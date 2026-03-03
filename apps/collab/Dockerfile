# 1. Base 단계
FROM node:20-alpine AS base
RUN apk update && apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

# 2. 의존성 설치 + 빌드 단계
FROM base AS deps
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./
RUN pnpm fetch

COPY . .
RUN pnpm install --offline --frozen-lockfile

# Prisma client 생성
RUN pnpm --filter collab db:generate

# TypeScript → JavaScript 컴파일 (런타임에 tsx 불필요)
RUN cd apps/collab && npx tsc --noEmit false --outDir dist

# 프로덕션 의존성만 추출
RUN pnpm --filter collab deploy --prod /app/collab-deploy

# Prisma CLI를 pnpm store에서 추출 (runner에서 npm install -g 방지)
RUN cp -rL /app/node_modules/.pnpm/prisma@*/node_modules/prisma /prisma-cli

# 3. 실행 단계 (pnpm 불필요 → 경량 base)
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache libc6-compat

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 appuser

# 프로덕션 node_modules
COPY --from=deps /app/collab-deploy/node_modules ./node_modules
COPY --from=deps /app/collab-deploy/package.json ./

# 컴파일된 JavaScript
COPY --from=deps /app/apps/collab/dist ./dist

# 생성된 Prisma client (dist/lib/prisma.js → ../generated/prisma 경로 매칭)
COPY --from=deps /app/apps/collab/src/generated ./dist/generated

# Prisma schema (db push용)
COPY --from=deps /app/apps/collab/prisma ./prisma

# Prisma CLI (deps에서 복사 — npm install -g 없이 레이어 경량화)
COPY --from=deps /prisma-cli /usr/local/lib/node_modules/prisma
RUN ln -s /usr/local/lib/node_modules/prisma/build/index.js /usr/local/bin/prisma && chmod +x /usr/local/bin/prisma

USER appuser

EXPOSE 3005
ENV PORT=3005

CMD ["sh", "-c", "prisma db push --skip-generate && node dist/server.js"]
