# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

pnpm workspace 기반 모노레포로, Next.js 앱들과 공유 패키지들로 구성되어 있습니다. shadcn/ui 기반의 UI 컴포넌트 시스템을 사용합니다.

## Commands

### Installation
```bash
# 모든 의존성 설치
pnpm install
```

### Development
```bash
# 특정 앱 개발 서버 실행
pnpm --filter <app-name> dev

# 예시
pnpm --filter jibsayo dev
pnpm --filter scaffolding dev
```

### Build & Type Check
```bash
# 특정 앱 빌드
pnpm --filter <app-name> build

# 타입 체크
pnpm --filter <app-name> tsc

# 린트
pnpm --filter <app-name> lint
```

### Cleanup
```bash
# Next.js 캐시 정리
pnpm --filter <app-name> clean
```

## Architecture

### Monorepo Structure

```
polymorph-app/
├── apps/
│   ├── jibsayo/       # 메인 부동산 거래 정보 앱 (상세 내용은 apps/jibsayo/CLAUDE.md 참조)
│   └── scaffolding/   # UI 컴포넌트 쇼케이스 앱
└── packages/
    ├── ui/            # shadcn/ui 기반 공통 UI 컴포넌트 라이브러리
    ├── utils/         # 공통 유틸리티 함수들
    ├── config/        # 공통 설정 파일들 (Tailwind, ESLint, PostCSS)
    ├── styles/        # 글로벌 스타일
    └── firebase/      # Firebase Admin SDK 및 Expo Push 알림 클라이언트
```

### Shared Packages

#### packages/ui
shadcn/ui 스타일을 따르는 공통 UI 컴포넌트 라이브러리:
- **Button**: 6가지 variants (default, primary, danger, outline, secondary, ghost, link)
- **Input**: 폼 입력 필드
- **Select**: 드롭다운 선택 컴포넌트
- **Badge**: 6가지 variants (default, secondary, danger, outline, success, warning)
- **Card**: 카드 컴포넌트 세트
- **Typography**: 다양한 텍스트 스타일 (h1~h4, p, lead, large, small, muted, code, blockquote)

**디자인 가이드라인**:
- 일관된 `rounded` border-radius (4px)
- 통일된 높이 (`h-10`) - Button, Input, Select
- class-variance-authority 기반 variant 시스템

#### packages/utils
- `cn()`: clsx와 tailwind-merge를 결합한 클래스 병합 함수

#### packages/firebase
Firebase Admin SDK 및 Expo Push 알림 클라이언트:
- `AdminFirestoreClient`: Firestore 데이터베이스 작업용 클래스
- `ExpoPushNotificationClient`: Expo 푸시 알림 전송용 클래스

#### packages/config
공통 설정 파일들:
- `tailwind.config.js`: Tailwind CSS 설정
- `postcss.config.js`: PostCSS 설정
- `eslint.config.js`: ESLint 설정


### Package Dependencies

앱들은 workspace 프로토콜로 공통 패키지를 참조합니다:
```json
"@package/ui": "workspace:*"
"@package/utils": "workspace:*"
"@polymorph/firebase": "workspace:*"
```

Next.js 설정에서 `transpilePackages`로 workspace 패키지들을 트랜스파일합니다:
```js
const nextConfig = {
  transpilePackages: ['@package/ui', '@package/utils'],
  // ...
};
```

## Git Workflow

**Pre-commit Hook**: Husky + lint-staged 사용
- TypeScript 파일 자동 ESLint 수정
- jibsayo 앱의 경우 타입 체크 (`pnpm tsc`) 실행

**중요**: 커밋 전 반드시 `git add .`로 모든 변경사항을 스테이지에 추가하세요. 스테이지되지 않은 변경사항은 커밋되지 않습니다.

## Development Notes

### Adding New UI Components to packages/ui

1. `packages/ui/src/`에 새 컴포넌트 파일 생성
2. shadcn/ui 디자인 가이드라인 따르기:
   - `rounded` border-radius (4px)
   - 일관된 height: `h-10` (Button, Input, Select)
   - class-variance-authority로 variant 시스템 구현
3. `packages/ui/index.ts`에 export 추가
4. TypeScript 타입 정의 포함

예시:
```tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@package/utils';

const componentVariants = cva(
  'base-classes',
  {
    variants: {
      variant: {
        default: '...',
        primary: '...',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface ComponentProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof componentVariants> {}

export function Component({ className, variant, ...props }: ComponentProps) {
  return (
    <element className={cn(componentVariants({ variant }), className)} {...props} />
  );
}
```

### Working with Firebase Package

`@polymorph/firebase` 패키지 사용 방법:

```typescript
import { AdminFirestoreClient } from '@polymorph/firebase';

// Firestore 작업
const firestoreClient = new AdminFirestoreClient();
const data = await firestoreClient.getData('collection', 'docId');

// Expo 푸시 알림
import { ExpoPushNotificationClient } from '@polymorph/firebase';
const pushClient = new ExpoPushNotificationClient();
await pushClient.sendPushNotification(tokens, message);
```

Firebase 설정은 환경변수로 관리하며, Admin SDK는 서버 사이드에서만 사용해야 합니다.

## App-Specific Documentation

각 앱의 상세한 아키텍처와 개발 가이드는 각 앱 디렉토리의 CLAUDE.md를 참조하세요:
- **apps/jibsayo**: `apps/jibsayo/CLAUDE.md` - Feature-Sliced Design 아키텍처, API 개발, 테스트 전략 등
- **apps/scaffolding**: UI 컴포넌트 쇼케이스 및 데모 앱
