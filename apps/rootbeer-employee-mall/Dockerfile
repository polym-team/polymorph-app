# 1. Base
FROM node:20-alpine AS base
RUN apk update && apk add --no-cache libc6-compat chromium nss freetype harfbuzz ca-certificates ttf-freefont
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

# 2. Dependencies
FROM base AS deps
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./
RUN pnpm fetch

COPY . .
RUN pnpm install --offline --frozen-lockfile

# 3. Build
FROM base AS builder
WORKDIR /app

COPY --from=deps /app ./

ENV IS_DOCKER_BUILD=true
RUN pnpm --filter rootbeer-employee-mall db:generate
RUN pnpm --filter rootbeer-employee-mall build

# Flatten playwright into a copyable location
RUN mkdir -p /playwright-modules/playwright-core && \
    cp -r node_modules/.pnpm/playwright-core@*/node_modules/playwright-core/* /playwright-modules/playwright-core/ && \
    mkdir -p /playwright-modules/playwright && \
    cp -r node_modules/.pnpm/playwright@*/node_modules/playwright/* /playwright-modules/playwright/

# 4. Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/rootbeer-employee-mall/.next/standalone ./
COPY --from=builder /app/apps/rootbeer-employee-mall/.next/static ./apps/rootbeer-employee-mall/.next/static
COPY --from=builder /playwright-modules/playwright-core ./node_modules/playwright-core
COPY --from=builder /playwright-modules/playwright ./node_modules/playwright

# Prisma migrate deploy에 필요한 파일
COPY --from=builder /app/apps/rootbeer-employee-mall/prisma ./prisma
COPY --from=builder /app/node_modules/.pnpm/prisma@*/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/.pnpm/@prisma+engines@*/node_modules/@prisma/engines ./node_modules/@prisma/engines

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 앱 시작 전 미적용 migration 실행 → 이미 적용된 건 건너뜀 (멱등)
CMD ["sh", "-c", "npx prisma migrate deploy --schema=./prisma/schema.prisma && node apps/rootbeer-employee-mall/server.js"]
