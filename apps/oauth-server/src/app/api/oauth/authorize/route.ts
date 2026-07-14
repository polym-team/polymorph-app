import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isAllowedRedirectUri } from '@/lib/redirectUri';
import { generateOpaqueToken, hashToken } from '@/lib/oauthTokens';

/**
 * OAuth 2.1 Authorization Endpoint (Authorization Code + PKCE)
 *
 * GET /api/oauth/authorize
 *   ?response_type=code
 *   &client_id=<clientId>
 *   &redirect_uri=<루프백/등록 콜백>
 *   &code_challenge=<S256>
 *   &code_challenge_method=S256
 *   &state=<CSRF>
 *   &scope=<선택>
 *
 * - 로그인 세션 없으면 /login 으로 유도 후 이 URL 로 복귀.
 * - 세션 있으면 단기(60초) 1회용 code 발급, redirect_uri?code=..&state=.. 로 리다이렉트.
 *   (code 는 쿼리로 반환 — 루프백 HTTP 서버가 fragment 는 읽지 못하므로.)
 */

const CODE_TTL_MS = 60_000;

/** redirect_uri 로 OAuth 에러를 실어 리다이렉트 (redirect_uri 가 검증된 경우에만 사용). */
function errorRedirect(
  redirectUri: string,
  error: string,
  state: string | null,
  description?: string,
): NextResponse {
  const dest = new URL(redirectUri);
  dest.searchParams.set('error', error);
  if (description) dest.searchParams.set('error_description', description);
  if (state) dest.searchParams.set('state', state);
  return NextResponse.redirect(dest);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sp = url.searchParams;

  const responseType = sp.get('response_type');
  const clientId = sp.get('client_id');
  const redirectUri = sp.get('redirect_uri');
  const codeChallenge = sp.get('code_challenge');
  const codeChallengeMethod = sp.get('code_challenge_method');
  const state = sp.get('state');
  const scope = sp.get('scope') ?? undefined;

  // client_id / redirect_uri 는 검증 전이므로 에러를 redirect 로 보내면 안 됨 → 사용자에게 직접 응답
  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: 'invalid_request', error_description: 'client_id, redirect_uri가 필요합니다.' },
      { status: 400 },
    );
  }

  const clientApp = await prisma.clientApp.findUnique({ where: { clientId } });
  if (!clientApp || !clientApp.enabled) {
    return NextResponse.json(
      { error: 'unauthorized_client', error_description: '허용되지 않은 클라이언트입니다.' },
      { status: 403 },
    );
  }
  if (!isAllowedRedirectUri(redirectUri, clientApp.allowedRedirectUris)) {
    return NextResponse.json(
      { error: 'invalid_request', error_description: '허용되지 않은 redirect_uri입니다.' },
      { status: 403 },
    );
  }

  // 이 시점부터는 redirect_uri 가 신뢰됨 → 나머지 에러는 redirect 로 전달
  if (responseType !== 'code') {
    return errorRedirect(redirectUri, 'unsupported_response_type', state);
  }
  if (!codeChallenge || codeChallengeMethod !== 'S256') {
    return errorRedirect(
      redirectUri,
      'invalid_request',
      state,
      'code_challenge_method=S256 및 code_challenge가 필요합니다.',
    );
  }

  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;

  // 미로그인 → 기존 /login(self-login 모드)으로 유도, 로그인 후 이 authorize URL 로 복귀
  if (!userId) {
    const loginUrl = new URL('/login', url.origin);
    loginUrl.searchParams.set('callbackUrl', url.pathname + url.search);
    return NextResponse.redirect(loginUrl);
  }

  // 단기 1회용 authorization code 발급
  const code = generateOpaqueToken();
  await prisma.authorizationCode.create({
    data: {
      codeHash: hashToken(code),
      userId,
      clientId,
      redirectUri,
      codeChallenge,
      scope,
      expiresAt: new Date(Date.now() + CODE_TTL_MS),
    },
  });

  const dest = new URL(redirectUri);
  dest.searchParams.set('code', code);
  if (state) dest.searchParams.set('state', state);
  return NextResponse.redirect(dest);
}
