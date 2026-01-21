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

# 3. 빌드 단계
FROM base AS builder
WORKDIR /app

COPY --from=deps /app ./

ENV IS_DOCKER_BUILD=true
RUN pnpm --filter bookmark-share db:generate
RUN pnpm --filter bookmark-share build

# 4. 실행 단계
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/bookmark-share/.next/standalone ./
COPY --from=builder /app/apps/bookmark-share/.next/static ./apps/bookmark-share/.next/static

# Create cache directory with proper permissions
RUN mkdir -p /app/apps/bookmark-share/.next/cache
RUN chown -R nextjs:nodejs /app/apps/bookmark-share/.next

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/bookmark-share/server.js"]
