import { NextResponse } from 'next/server';

/**
 * OAuth 2.0 Authorization Server Metadata (RFC 8414)
 * MCP 등 클라이언트가 엔드포인트를 자동 디스커버리하는 데 사용.
 * GET /.well-known/oauth-authorization-server
 */
export async function GET(req: Request) {
  const base = (process.env.NEXTAUTH_URL ?? new URL(req.url).origin).replace(/\/$/, '');

  return NextResponse.json(
    {
      issuer: base,
      authorization_endpoint: `${base}/api/oauth/authorize`,
      token_endpoint: `${base}/api/oauth/token`,
      revocation_endpoint: `${base}/api/oauth/revoke`,
      response_types_supported: ['code'],
      grant_types_supported: ['authorization_code', 'refresh_token'],
      code_challenge_methods_supported: ['S256'],
      token_endpoint_auth_methods_supported: ['none'],
    },
    { headers: { 'Cache-Control': 'public, max-age=3600' } },
  );
}
