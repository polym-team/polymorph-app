# Collab — Yjs 실시간 공동 편집 서버

Hocuspocus 기반의 범용 Yjs WebSocket 서버. JWT 인증과 MySQL 바이너리 영속화를 담당하며, 특정 앱에 종속되지 않는다.

## 아키텍처

```
Browser (HocuspocusProvider)
    └── WSS → Collab (Hocuspocus :3005) → MySQL (YjsDocument)
```

- **프로토콜**: Yjs CRDT + Hocuspocus WebSocket
- **인증**: JWT (COLLAB_SECRET으로 서명 검증)
- **영속화**: YjsDocument 테이블에 Yjs 바이너리 상태 저장 (LongBlob)
- **문서 이름 규칙**: `{app}:{scope}:{id}` (예: `okr:spaceId:okrId`)

## 로컬 실행

```bash
# 1. DB 컨테이너 실행
pnpm --filter collab db:up

# 2. Prisma client 생성 + 테이블 생성
pnpm --filter collab db:push

# 3. 서버 실행
pnpm --filter collab dev
```

포트: `3005` (환경변수 `PORT`로 변경 가능)

## 환경변수 (.env)

| 변수 | 설명 |
|------|------|
| `DATABASE_URL` | MySQL 연결 문자열 |
| `COLLAB_SECRET` | JWT 서명/검증용 공유 시크릿 (클라이언트 앱과 동일해야 함) |
| `PORT` | 서버 포트 (기본: 3005) |

## 클라이언트 연동

클라이언트 앱에서 collab 서버를 사용하려면:

1. **토큰 발급 API 구현** — 클라이언트 앱의 서버에서 `COLLAB_SECRET`으로 JWT 발급
   ```typescript
   // JWT payload: { sub: userId, room: documentName, name: userName, readOnly?: boolean }
   ```

2. **HocuspocusProvider 연결** — 클라이언트에서 WebSocket 연결
   ```typescript
   new HocuspocusProvider({
     url: 'ws://localhost:3005',
     name: 'okr:spaceId:okrId',
     token: () => fetchTokenFromYourAPI(),
   })
   ```

## Prisma

collab은 별도 DB를 사용하며, Prisma client를 `src/generated/prisma`에 출력하여 모노레포 내 다른 앱과 충돌하지 않는다.

```
apps/collab/
├── prisma/schema.prisma    # YjsDocument 모델
└── src/generated/prisma/   # 생성된 Prisma client (.gitignore)
```

## 스크립트

| 명령 | 설명 |
|------|------|
| `dev` | tsx watch로 개발 서버 실행 |
| `start` | tsx로 프로덕션 서버 실행 |
| `db:generate` | Prisma client 생성 |
| `db:push` | DB 스키마 동기화 |
| `db:up` | Docker MySQL 컨테이너 실행 |
| `db:down` | Docker MySQL 컨테이너 중지 |
