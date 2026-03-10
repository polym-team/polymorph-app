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

# Playwright Chromium 의존성
RUN apt-get update && apt-get install -y --no-install-recommends \
    libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 \
    libxkbcommon0 libxcomposite1 libxdamage1 libxrandr2 libgbm1 \
    libpango-1.0-0 libcairo2 libasound2 libxshmfence1 \
    && rm -rf /var/lib/apt/lists/*

# 프로덕션 node_modules + package.json
COPY --from=deps /app/deploy/node_modules ./node_modules
COPY --from=deps /app/deploy/package.json ./

# 소스 (tsx로 직접 실행)
COPY --from=deps /app/apps/employeeDiscountWebhook/src ./src
COPY --from=deps /app/apps/employeeDiscountWebhook/tsconfig.json ./

# Playwright Chromium 설치
RUN npx playwright install chromium

CMD ["npx", "tsx", "src/index.ts"]
