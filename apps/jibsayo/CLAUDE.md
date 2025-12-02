# Jibsayo App - CLAUDE.md

This file provides guidance to Claude Code when working with the Jibsayo app.

## Project Overview

Jibsayo는 부동산 거래 정보를 제공하는 Next.js 기반 웹 애플리케이션입니다. Feature-Sliced Design (FSD) 아키텍처를 사용하여 구조화되어 있으며, 모노레포의 공유 패키지들을 활용합니다.

## Architecture

### Feature-Sliced Design (FSD)

이 프로젝트는 Feature-Sliced Design 아키텍처를 따릅니다. 각 레이어는 명확한 책임과 의존성 규칙을 가집니다.

```
apps/jibsayo/src/
├── app/        # Next.js App Router (페이지, API Routes)
├── features/   # 기능(Feature) 레이어
├── entities/   # 엔티티(Entity) 레이어
├── wigets/     # 위젯(Widget) 레이어
├── shared/     # 공유(Shared) 레이어
└── assets/     # 정적 자산
```

### FSD 레이어 설명

#### 1. App Layer (`app/`)

- Next.js App Router의 페이지 및 라우팅
- API Routes (`app/api/`)
- 각 API는 models, services로 구조화
- API shared: 공통 라이브러리, 서비스, 유틸리티

#### 2. Features Layer (`features/`)

- 사용자 시나리오 기반의 독립적인 기능 단위
- 각 feature는 UI와 비즈니스 로직을 포함
- sub-features: 복잡한 기능을 더 작은 단위로 분해
- 다른 features에 의존하지 않음 (entities, shared만 의존 가능)

**Feature 내부 구조 규칙**:

```
features/{feature-name}/
├── index.ts                    # Public API (export만 담당)
├── {FeatureName}.tsx          # 엔트리포인트 컴포넌트
├── services.ts                # 단일 서비스 파일 (1개일 때)
├── services/                  # 여러 서비스 파일 (2개 이상일 때)
│   ├── calculator.ts
│   └── converter.ts
├── hooks.ts                   # 단일 훅 파일 (1개일 때)
├── hooks/                     # 여러 훅 파일 (2개 이상일 때)
│   ├── useFeatureA.ts
│   └── useFeatureB.ts
├── types.ts                   # 단일 타입 파일 (1개일 때)
├── types/                     # 여러 타입 파일 (2개 이상일 때)
│   ├── request.ts
│   └── response.ts
└── sub-features/              # 복잡한 기능 분해 (선택적)
```

**세그먼트 규칙**:

- 세그먼트가 **1개**면 피처 루트에 바로 작성 (`services.ts`, `hooks.ts`, `types.ts`)
- 세그먼트가 **2개 이상**이면 별도 폴더 생성 (`services/`, `hooks/`, `types/`)
- `index.ts`는 반드시 포함하여 Public API 정의
- `{FeatureName}.tsx`는 해당 feature의 메인 컴포넌트

#### 3. Entities Layer (`entities/`)

- 비즈니스 엔티티 (아파트, 거래, 지역 등)
- 도메인 모델, 타입, 기본 CRUD 로직
- features보다 낮은 레벨의 추상화
- 다른 entities, shared에만 의존 가능

#### 4. Widgets Layer (`wigets/`)

- 페이지 레벨의 독립적인 UI 블록
- 여러 features를 조합하여 구성

#### 5. Shared Layer (`shared/`)

- 프로젝트 전체에서 사용되는 공통 코드
- 레이어 구분 없이 모든 곳에서 import 가능
- server/: 서버 사이드 전용 모듈 (API Routes에서만 사용)

### API 구조

각 API 엔드포인트는 다음과 같은 구조를 따릅니다:

```
app/api/{endpoint}/
├── route.ts           # API 핸들러 (GET, POST, etc.)
├── models/            # 데이터 모델, 타입 정의
├── services/          # 비즈니스 로직
└── utils/             # 유틸리티 함수 (선택적)
```

**원칙**:

- `route.ts`는 요청/응답 처리만 담당
- 비즈니스 로직은 `services/`에 분리
- 타입과 모델은 `models/`에 정의
- 공통 로직은 `app/api/shared/`로 추출

### 의존성 규칙

FSD의 핵심 규칙:

1. **하위 레이어는 상위 레이어를 import할 수 없음**
   - `shared` ← `entities` ← `features` ← `wigets` ← `app`
2. **같은 레이어 내에서는 서로 import 불가** (features 간, entities 간)
3. **shared는 모든 레이어에서 import 가능**

올바른 예시:

```typescript
// features/transaction-list 에서
import { Transaction } from '@/entities/transaction';
// ✅ entities 사용
import { cn } from '@/shared/utils';

// ✅ shared 사용
```

잘못된 예시:

```typescript
// features/transaction-list 에서
import { ApartInfo } from '@/features/apart-info';
// ❌ 다른 feature 사용 불가

// entities/apart 에서
import { TransactionList } from '@/features/transaction-list';

// ❌ 상위 레이어 사용 불가
```

## Development Guidelines

### 새로운 기능 추가하기

1. **Entity가 필요한가?**

   - 새로운 도메인 모델이면 `entities/` 에 추가
   - 타입, 기본 CRUD 서비스, 훅 정의

2. **Feature 생성**

   - `features/{feature-name}/` 디렉토리 생성
   - UI 컴포넌트는 `ui/` 에
   - 비즈니스 로직은 `hooks/`, `services/` 에
   - 복잡하면 `sub-features/` 로 분해

3. **API 추가**

   - `app/api/{endpoint}/` 구조 생성
   - models, services 분리
   - 공통 로직은 `app/api/shared/` 활용

4. **페이지 연결**
   - `app/` 에 라우트 추가
   - features와 widgets 조합하여 페이지 구성

### 코드 작성 원칙

- **단일 책임**: 각 모듈은 하나의 명확한 책임만
- **의존성 방향**: FSD 레이어 규칙 준수
- **타입 안전성**: TypeScript 타입을 명확히 정의
- **재사용성**: 공통 로직은 적절한 레이어로 추출

### 패키지 사용

```typescript
// 모노레포 공유 패키지
// 내부 모듈 (절대 경로 사용)
import { Transaction } from '@/entities/transaction';
import { useTransactionList } from '@/features/transaction-list';
import { REGIONS } from '@/shared/consts';
import { AdminFirestoreClient } from '@polymorph/firebase';

import { Button, Input } from '@package/ui';
import { cn } from '@package/utils';
```

## Testing

타입 체크는 pre-commit hook에서 자동 실행됩니다:

```bash
pnpm --filter jibsayo tsc
```

## Notes

- **API Routes**: 서버 컴포넌트와 분리, `/api` prefix 사용
- **상태 관리**: Zustand 사용 (`shared/stores/`)
- **데이터 페칭**: React Query 사용 (`app/queries/`)
