import { protectedResourceHandler, metadataCorsOptionsRequestHandler } from 'mcp-handler';

export const dynamic = 'force-dynamic';

// RFC 9728 — 이 MCP 리소스 서버의 인증서버로 oauth.polymorph.co.kr 를 가리킨다.
// resourceUrl 을 명시(프록시 뒤에서 http 로 잘못 추정되는 것 방지, https 강제).
const prm = protectedResourceHandler({
  authServerUrls: [process.env.OAUTH_ISSUER || 'https://oauth.polymorph.co.kr'],
  resourceUrl: process.env.MCP_RESOURCE_URL || 'https://directfeedback.polymorph.co.kr/api/mcp',
});

export function GET(req: Request) {
  return prm(req);
}
// metadataCorsOptionsRequestHandler()는 팩토리 — 호출해 얻은 핸들러를 OPTIONS로 export
export const OPTIONS = metadataCorsOptionsRequestHandler();
