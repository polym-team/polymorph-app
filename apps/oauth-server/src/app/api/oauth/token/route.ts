import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { issueAccessToken } from '@/lib/accessToken';
import { redirectUrisEqual } from '@/lib/redirectUri';
import {
  generateOpaqueToken,
  hashToken,
  verifyPkceS256,
} from '@/lib/oauthTokens';

/**
 * OAuth 2.1 Token Endpoint
 *
 * POST /api/oauth/token  (application/x-www-form-urlencoded 또는 application/json)
 *
 * grant_type=authorization_code
 *   code, code_verifier, client_id, redirect_uri
 * grant_type=refresh_token
 *   refresh_token, client_id
 *
 * 응답: { access_token, token_type: "Bearer", expires_in, refresh_token }
 *
 * refresh token 은 회전(rotation)한다. 이미 폐기된(회전된) refresh token 이 다시 오면
 * 탈취로 간주하고 해당 user+client 의 모든 refresh token 을 폐기한다.
 */

type Params = Record<string, string>;

async function parseBody(req: Request): Promise<Params> {
  const ct = req.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) {
    return (await req.json().catch(() => ({}))) as Params;
  }
  const text = await req.text();
  return Object.fromEntries(new URLSearchParams(text));
}

function oauthError(error: string, status: number, description?: string): NextResponse {
  return NextResponse.json(
    description ? { error, error_description: description } : { error },
    { status, headers: { 'Cache-Control': 'no-store' } },
  );
}

function tokenResponse(accessToken: string, expiresIn: number, refreshToken: string): NextResponse {
  return NextResponse.json(
    {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: expiresIn,
      refresh_token: refreshToken,
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}

export async function POST(req: Request) {
  const params = await parseBody(req);
  const grantType = params.grant_type;

  if (grantType === 'authorization_code') {
    return handleAuthorizationCode(params);
  }
  if (grantType === 'refresh_token') {
    return handleRefreshToken(params);
  }
  return oauthError('unsupported_grant_type', 400);
}

async function handleAuthorizationCode(params: Params): Promise<NextResponse> {
  const { code, code_verifier: codeVerifier, client_id: clientId, redirect_uri: redirectUri } = params;

  if (!code || !codeVerifier || !clientId || !redirectUri) {
    return oauthError('invalid_request', 400, 'code, code_verifier, client_id, redirect_uri가 필요합니다.');
  }

  const clientApp = await prisma.clientApp.findUnique({ where: { clientId } });
  if (!clientApp || !clientApp.enabled) {
    return oauthError('invalid_client', 401);
  }

  const ac = await prisma.authorizationCode.findUnique({ where: { codeHash: hashToken(code) } });
  if (!ac) return oauthError('invalid_grant', 400, 'code를 찾을 수 없습니다.');
  if (ac.usedAt) return oauthError('invalid_grant', 400, '이미 사용된 code입니다.');
  if (ac.expiresAt.getTime() < Date.now()) return oauthError('invalid_grant', 400, '만료된 code입니다.');
  if (ac.clientId !== clientId) return oauthError('invalid_grant', 400, 'client_id 불일치.');
  if (!redirectUrisEqual(ac.redirectUri, redirectUri)) {
    return oauthError('invalid_grant', 400, 'redirect_uri 불일치.');
  }
  if (!verifyPkceS256(codeVerifier, ac.codeChallenge)) {
    return oauthError('invalid_grant', 400, 'PKCE 검증 실패.');
  }

  // 원자적 단일 사용 처리 (동시 요청 replay 방지)
  const consumed = await prisma.authorizationCode.updateMany({
    where: { id: ac.id, usedAt: null },
    data: { usedAt: new Date() },
  });
  if (consumed.count !== 1) {
    return oauthError('invalid_grant', 400, '이미 사용된 code입니다.');
  }

  const accessToken = await issueAccessToken(ac.userId, clientId, clientApp.accessTokenLifetime);
  if (!accessToken) return oauthError('invalid_grant', 400, '사용자를 찾을 수 없습니다.');

  const refreshToken = await createRefreshToken(ac.userId, clientId, clientApp.refreshTokenLifetime);
  return tokenResponse(accessToken, clientApp.accessTokenLifetime, refreshToken);
}

async function handleRefreshToken(params: Params): Promise<NextResponse> {
  const { refresh_token: refreshToken, client_id: clientId } = params;

  if (!refreshToken || !clientId) {
    return oauthError('invalid_request', 400, 'refresh_token, client_id가 필요합니다.');
  }

  const clientApp = await prisma.clientApp.findUnique({ where: { clientId } });
  if (!clientApp || !clientApp.enabled) {
    return oauthError('invalid_client', 401);
  }

  const rt = await prisma.refreshToken.findUnique({ where: { tokenHash: hashToken(refreshToken) } });
  if (!rt) return oauthError('invalid_grant', 400, 'refresh_token을 찾을 수 없습니다.');
  if (rt.clientId !== clientId) return oauthError('invalid_grant', 400, 'client_id 불일치.');

  // 재사용 탐지: 이미 회전(폐기)된 토큰이 다시 옴 → 탈취 가정, 체인 전체 폐기
  if (rt.revokedAt) {
    await prisma.refreshToken.updateMany({
      where: { userId: rt.userId, clientId: rt.clientId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return oauthError('invalid_grant', 400, '재사용된 refresh_token — 세션을 폐기했습니다. 다시 로그인하세요.');
  }
  if (rt.expiresAt.getTime() < Date.now()) return oauthError('invalid_grant', 400, '만료된 refresh_token입니다.');

  const accessToken = await issueAccessToken(rt.userId, clientId, clientApp.accessTokenLifetime);
  if (!accessToken) return oauthError('invalid_grant', 400, '사용자를 찾을 수 없습니다.');

  // 회전: 신규 발급 + 기존 폐기 (원자적)
  const newRaw = generateOpaqueToken();
  const created = await prisma.refreshToken.create({
    data: {
      tokenHash: hashToken(newRaw),
      userId: rt.userId,
      clientId,
      expiresAt: new Date(Date.now() + clientApp.refreshTokenLifetime * 1000),
    },
  });
  const rotated = await prisma.refreshToken.updateMany({
    where: { id: rt.id, revokedAt: null },
    data: { revokedAt: new Date(), rotatedTo: created.id },
  });
  if (rotated.count !== 1) {
    // 동시 회전 경쟁에서 짐 → 방금 만든 신규 토큰 폐기하고 거부
    await prisma.refreshToken.update({ where: { id: created.id }, data: { revokedAt: new Date() } });
    return oauthError('invalid_grant', 400, '동시 갱신 충돌 — 다시 시도하세요.');
  }

  return tokenResponse(accessToken, clientApp.accessTokenLifetime, newRaw);
}

async function createRefreshToken(
  userId: string,
  clientId: string,
  lifetimeSec: number,
): Promise<string> {
  const raw = generateOpaqueToken();
  await prisma.refreshToken.create({
    data: {
      tokenHash: hashToken(raw),
      userId,
      clientId,
      expiresAt: new Date(Date.now() + lifetimeSec * 1000),
    },
  });
  return raw;
}
