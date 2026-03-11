# 1. 의존성 설치 단계
FROM node:20-slim AS deps
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./
RUN pnpm fetch

COPY . .
RUN pnpm install --offline --frozen-lockfile

# 프로덕션 의존성만 추출
RUN pnpm --filter employee-discount-webhook deploy --prod /app/deploy

# 2. 실행 단계
FROM node:20-slim AS runner
WORKDIR /app

# 프로덕션 node_modules + package.json
COPY --from=deps /app/deploy/node_modules ./node_modules
COPY --from=deps /app/deploy/package.json ./

# 소스 (tsx로 직접 실행)
COPY --from=deps /app/apps/employeeDiscountWebhook/src ./src
COPY --from=deps /app/apps/employeeDiscountWebhook/tsconfig.json ./

# Playwright Chromium + 시스템 의존성 설치
RUN npx playwright install --with-deps chromium

CMD ["npx", "tsx", "src/index.ts"]
