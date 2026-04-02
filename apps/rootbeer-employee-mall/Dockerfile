# 1. Base
FROM node:20-alpine AS base
RUN apk update && apk add --no-cache libc6-compat chromium
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
RUN pnpm --filter rootbeer-employee-mall build

# 4. Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/rootbeer-employee-mall/.next/standalone ./
COPY --from=builder /app/apps/rootbeer-employee-mall/.next/static ./apps/rootbeer-employee-mall/.next/static
COPY --from=builder /app/apps/rootbeer-employee-mall/public ./apps/rootbeer-employee-mall/public

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/rootbeer-employee-mall/server.js"]
