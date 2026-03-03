# 1. Base 단계
FROM node:20-alpine AS base
RUN apk update && apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

# 2. 의존성 설치 단계
FROM base AS deps
WORKDIR /app

# pnpm workspace 설정 파일들 복사
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./

# pnpm fetch로 의존성 다운로드
RUN pnpm fetch

# 소스 복사 후 오프라인 설치
COPY . .
RUN pnpm install --offline --frozen-lockfile

# Prisma client 생성 (devDep인 prisma CLI가 있는 이 단계에서 실행)
RUN pnpm --filter collab db:generate

# collab만 프로덕션 의존성으로 추출 (생성된 prisma client 포함)
RUN pnpm --filter collab deploy --prod /app/collab-deploy

# 3. 실행 단계
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 appuser

# pnpm deploy로 추출된 경량 패키지 복사
COPY --from=deps /app/collab-deploy ./

# 런타임: prisma db push용 CLI + tsx
RUN npm install -g prisma@6.2.1 tsx

USER appuser

EXPOSE 3005
ENV PORT=3005

CMD ["sh", "-c", "prisma db push --skip-generate && tsx src/server.ts"]
