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

# 3. 실행 단계
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 appuser

# collab 앱과 필요한 workspace 파일 복사
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/collab ./apps/collab
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Prisma client 생성
RUN cd apps/collab && npx prisma generate

# 첫 배포 시 DB 스키마 자동 생성을 위한 prisma CLI
RUN npm install -g prisma@6.2.1

USER appuser

EXPOSE 3005
ENV PORT=3005

CMD ["sh", "-c", "prisma db push --skip-generate --schema=./apps/collab/prisma/schema.prisma && node_modules/.bin/tsx apps/collab/src/server.ts"]
