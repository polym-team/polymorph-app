# GitHub Actions 배치 작업 설정 가이드

GitHub Actions를 사용하여 매일 자동으로 거래 데이터를 수집하고 Firestore에 저장합니다.

## 1. GitHub Secrets 설정

GitHub 저장소 **Settings > Secrets and variables > Actions**에서 다음 시크릿들을 추가하세요:

### Firebase 설정 (`.env.local.sample` 참고)

다음 6개의 시크릿을 추가합니다:

1. **FIREBASE_PROJECT_ID**

   - 값: `jibsayo-polymorph`

2. **FIREBASE_PRIVATE_KEY_ID**

   - 값: `.env.local.sample`의 `FIREBASE_PRIVATE_KEY_ID` 값

3. **FIREBASE_PRIVATE_KEY**

   - 값: `.env.local.sample`의 `FIREBASE_PRIVATE_KEY` 값 (따옴표 포함)
   - 예시: `"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"`

4. **FIREBASE_CLIENT_EMAIL**

   - 값: `.env.local.sample`의 `FIREBASE_CLIENT_EMAIL` 값

5. **FIREBASE_CLIENT_ID**

   - 값: `.env.local.sample`의 `FIREBASE_CLIENT_ID` 값

6. **FIREBASE_CLIENT_CERT_URL**
   - 값: `.env.local.sample`의 `FIREBASE_CLIENT_CERT_URL` 값

### 국토부 API 키

7. **NEXT_PUBLIC_GO_DATA_API_KEY**
   - 값: `.env.local.sample`의 `NEXT_PUBLIC_GO_DATA_API_KEY` 값

## 2. 워크플로우 설명

### 자동 실행

매일 오전 8시 (KST)에 자동으로 실행됩니다.

```yaml
schedule:
  - cron: '0 23 * * *' # UTC 23:00 (전날) = KST 08:00
```

### 수동 실행

GitHub Actions 페이지에서 "Run workflow" 버튼으로 수동 실행할 수 있습니다.

### 처리 과정

1. **데이터 수집**: 69개 지역의 최근 3개월 거래 데이터 수집
2. **병렬 처리**: 10개 지역씩 동시 처리하여 속도 향상
3. **Firestore 저장**: `legacy-transactions` 컬렉션에 저장
4. **로그 업로드**: 실행 결과를 Artifact로 7일간 보관

## 3. 로컬 테스트

환경변수를 설정하고 로컬에서 테스트할 수 있습니다:

```bash
# .env.local.sample 파일을 .env.local로 복사
cp apps/jibsayo/.env.local.sample apps/jibsayo/.env.local

# 환경변수를 export (macOS/Linux)
export FIREBASE_PROJECT_ID=".." # .env.local의 값
export FIREBASE_PRIVATE_KEY_ID="..." # .env.local의 값
export FIREBASE_PRIVATE_KEY="..." # .env.local의 값 (따옴표 포함)
export FIREBASE_CLIENT_EMAIL="..." # .env.local의 값
export FIREBASE_CLIENT_ID="..." # .env.local의 값
export FIREBASE_CLIENT_CERT_URL="..." # .env.local의 값
export NEXT_PUBLIC_GO_DATA_API_KEY="..." # .env.local의 값

# 또는 .env 파일에서 자동으로 로드하려면:
# source apps/jibsayo/.env.local

# 의존성 설치
pnpm install

# 배치 실행
pnpm --filter jibsayo batch:run
```

## 4. 모니터링

### GitHub Actions 페이지에서 확인

- Repository > Actions 탭에서 실행 결과 확인
- 각 실행 로그에서 상세 내역 확인 가능

### 결과 예시

```
✨ Batch job completed
============================================================
✅ Success: 69 regions
❌ Failed: 0 regions
📊 Total transactions: 12,345
⏱️  Duration: 45.23s
```

### 로그 다운로드

각 실행의 "Artifacts" 섹션에서 `batch-logs`를 다운로드할 수 있습니다.

## 5. 문제 해결

### API 호출 제한 초과

동시 처리 개수를 줄이려면 `apps/jibsayo/scripts/batch.ts`의 `CONCURRENCY_LIMIT`을 조정하세요:

```typescript
const CONCURRENCY_LIMIT = 5; // 기본값: 10
```

### Firestore 권한 오류

서비스 계정에 Firestore 읽기/쓰기 권한이 있는지 확인하세요.

### 타임아웃

GitHub Actions는 기본 6시간 타임아웃이 있어 충분합니다. 만약 더 필요하다면:

```yaml
jobs:
  fetch-transactions:
    timeout-minutes: 360 # 기본값: 360분 (6시간)
```

## 6. 비용

- **GitHub Actions**: Public 저장소는 무료, Private는 월 2,000분 무료
- **예상 실행 시간**: 약 1-2분/일
- **월 사용량**: 약 30-60분 (무료 한도 내)
