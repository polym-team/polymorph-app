# direct-feedback (DirectFeedback 백엔드)

화면 엘리먼트 코멘트를 저장·공유하고 Claude Code(MCP)에 노출하는 리뷰 도구의 **백엔드**.
Next.js(App Router) + Prisma(MySQL) + `@polymorph/shared-auth`. 코멘트/그룹 REST API,
그룹 관리 대시보드(`/`), 개인정보처리방침(`/privacy`).

> **📐 전체 그림(여러 저장소에 걸침)은 [`ARCHITECTURE.md`](./ARCHITECTURE.md) 부터 읽으세요.**
> 이 앱은 한 조각이고, 확장/MCP 는 별도 저장소에 있습니다.

## 관련 저장소 / 위치
- 이 백엔드: `polymorph-app/apps/direct-feedback` (여기)
- Chrome 확장: https://github.com/polym-team/directfeedback-extension
- MCP 서버: https://github.com/polym-team/directfeedback-mcp
- k8s 매니페스트: `polymorph-k8s/{apps,manifests}/direct-feedback`
- 설계 문서: `polymorph-app/docs/directfeedback-design.md`
- 프로덕션: https://directfeedback.polymorph.co.kr

## 로컬 실행
```bash
pnpm direct-feedback   # 백엔드(3008) + oauth-server(3007) 동시 (polymorph-app 루트)
```
`.env` 필요: `DATABASE_URL`, `OAUTH_JWT_SECRET`(oauth-server 와 동일), `NEXT_PUBLIC_OAUTH_SERVER_URL`.

## 스크립트
- `pnpm --filter direct-feedback db:generate` — Prisma 클라이언트 생성(gitignore 됨)
- `pnpm --filter direct-feedback db:push` — 스키마를 DB 에 반영
- `pnpm --filter direct-feedback tsc` — 타입체크

배포·데이터모델·API·인증·주의점은 전부 `ARCHITECTURE.md` 참고.
