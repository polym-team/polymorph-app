# IndexedDB 사용 가이드

## 개요

기존의 localStorage를 IndexedDB로 마이그레이션했습니다. IndexedDB는 더 큰 저장 용량과 비동기 작업을 지원합니다.

## 사용법

### 기본 CRUD 작업

```typescript
import { clear, getItem, removeItem, setItem } from '@/shared/lib/indexedDB';

// 데이터 저장
await setItem('key', { data: 'value' });

// 데이터 조회
const data = await getItem<{ data: string }>('key');

// 데이터 삭제
await removeItem('key');

// 전체 데이터 삭제
await clear();
```

### 기존 localStorage 코드와의 호환성

기존 localStorage를 사용하던 코드는 다음과 같이 변경해야 합니다:

#### Before (localStorage)

```typescript
import { getItem, setItem } from '@/shared/lib/localStorage';

// 동기 방식
const data = getItem('key');
setItem('key', value);
```

#### After (IndexedDB)

```typescript
import { getItem, setItem } from '@/shared/lib/indexedDB';

// 비동기 방식
const data = await getItem('key');
await setItem('key', value);
```

## 주요 변경사항

### 1. DeviceManager

- `getDeviceId()` → `getDeviceId()` (비동기)
- `setDeviceId()` → `setDeviceId()` (비동기)
- 동기 버전: `getDeviceIdSync()`, `setDeviceIdSync()`

### 2. Favorite Storage

- `loadFavoriteApartListFromLocal()` → `loadFavoriteApartListFromLocal()` (비동기)
- `addFavoriteApartToLocal()` → `addFavoriteApartToLocal()` (비동기)
- `removeFavoriteApartFromLocal()` → `removeFavoriteApartFromLocal()` (비동기)

### 3. Hooks

- `useFavoriteApartList`: 모든 함수가 비동기로 변경
- `useTransactionViewSetting`: 저장 함수들이 비동기로 변경
- `useFavoriteRegion`: 저장 함수들이 비동기로 변경

## 데이터베이스 구조

- **데이터베이스명**: `jibsayo-db`
- **버전**: 1
- **스토어명**: `key-value-store`
- **키 패스**: `key`
- **인덱스**: `key` (unique)

## 마이그레이션

기존 localStorage 데이터는 자동으로 IndexedDB로 마이그레이션됩니다. 마이그레이션 과정에서 기존 데이터 형식도 새로운 형식으로 변환됩니다.

## 주의사항

1. **비동기 작업**: 모든 IndexedDB 작업은 비동기입니다. `await` 키워드를 사용해야 합니다.
2. **브라우저 지원**: IndexedDB는 모든 최신 브라우저에서 지원됩니다.
3. **에러 처리**: IndexedDB 작업 실패 시 적절한 에러 처리가 필요합니다.
4. **용량 제한**: IndexedDB는 localStorage보다 훨씬 큰 저장 용량을 제공합니다.

## 테스트

테스트 파일들도 비동기 함수 호출로 수정해야 합니다:

```typescript
// Before
const result = loadFavoriteApartListFromLocal();

// After
const result = await loadFavoriteApartListFromLocal();
```
