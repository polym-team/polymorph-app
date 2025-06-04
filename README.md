# Polymorph App

pnpm workspace를 사용한 **모던 모노레포** 구조의 프로젝트입니다.  
shadcn/ui 기반의 아름다운 UI 컴포넌트와 TypeScript로 구성되어 있습니다.

## 🚀 프로젝트 구조

```
polymorph-app/
├── apps/
│   ├── scaffolding/          # Next.js 기반 스캐폴딩 앱
│   │   ├── src/app/
│   │   │   ├── fast-dev/     # 빠른 개발 도구 소개 페이지
│   │   │   ├── modern-ui/    # 모던 UI 컴포넌트 쇼케이스
│   │   │   └── monorepo/     # 모노레포 구조 설명 페이지
│   │   └── ...
│   └── jibsayo-react-native/ # React Native 앱
├── packages/
│   ├── ui/                   # shadcn/ui 기반 공통 UI 컴포넌트
│   │   ├── src/
│   │   │   ├── button.tsx    # Button 컴포넌트
│   │   │   ├── input.tsx     # Input 컴포넌트
│   │   │   ├── select.tsx    # Select 컴포넌트
│   │   │   ├── badge.tsx     # Badge 컴포넌트
│   │   │   ├── card.tsx      # Card 컴포넌트 세트
│   │   │   └── typography.tsx # Typography 컴포넌트
│   │   └── index.ts
│   ├── utils/                # 공통 유틸리티 함수
│   ├── config/               # 공통 설정 파일들
│   │   ├── tailwind.config.js
│   │   ├── postcss.config.js
│   │   └── eslint.config.js
│   └── styles/               # 글로벌 스타일
├── pnpm-workspace.yaml       # pnpm workspace 설정
└── package.json              # 루트 패키지 설정
```

## ✨ 주요 특징

### 🎨 모던 UI 컴포넌트

- **shadcn/ui 기반**: 아름답고 접근성이 좋은 컴포넌트들
- **일관된 디자인**: 통일된 border-radius, 색상, 간격
- **다양한 variants**: Button, Badge 등 다양한 스타일 옵션
- **TypeScript 완전 지원**: 타입 안전성 보장

### 🏗️ 모노레포 구조

- **pnpm workspace**: 효율적인 의존성 관리
- **패키지 간 참조**: `@package/ui`, `@package/utils` 등
- **공통 설정 공유**: Tailwind, ESLint, PostCSS 설정 통합
- **빠른 개발**: Hot Reload와 TypeScript 지원

### 📱 샘플 페이지들

- **빠른 개발 페이지**: 개발 도구와 명령어 소개
- **모던 UI 페이지**: 모든 UI 컴포넌트 쇼케이스
- **모노레포 페이지**: 프로젝트 구조와 장점 설명

## 🛠️ 기술 스택

- **모노레포**: pnpm workspace
- **프레임워크**: Next.js 14.2.29
- **언어**: TypeScript
- **UI 라이브러리**: shadcn/ui 기반 커스텀 컴포넌트
- **스타일링**: Tailwind CSS
- **폰트**: Noto Sans KR
- **패키지 매니저**: pnpm

## 🚀 시작하기

### 1. 의존성 설치

```bash
pnpm install
```

### 2. 개발 서버 실행

```bash
# scaffolding 앱 실행
pnpm --filter scaffolding dev

# 또는 루트에서
pnpm dev
```

### 3. 빌드

```bash
# scaffolding 앱 빌드
pnpm --filter scaffolding build

# 또는 루트에서
pnpm build
```

## 📋 스크립트

- `pnpm dev` - scaffolding 앱 개발 서버 실행
- `pnpm build` - scaffolding 앱 빌드
- `pnpm start` - scaffolding 앱 프로덕션 서버 실행
- `pnpm lint` - 모든 패키지 린트 검사
- `pnpm type-check` - 모든 패키지 타입 검사
- `pnpm jibsayo-react-native start` - jibsayo-react-native 앱 실행
- `pnpm jibsayo-react-native android` - 안드로이드 빌드 및 실행
- `pnpm jibsayo-react-native ios` - iOS 빌드 및 실행

## 📦 패키지 상세

### apps/scaffolding

Next.js 기반의 메인 애플리케이션으로 다음 페이지들을 포함합니다:

- **홈페이지**: 프로젝트 소개 및 네비게이션
- **빠른 개발 페이지** (`/fast-dev`): 개발 도구 소개
- **모던 UI 페이지** (`/modern-ui`): UI 컴포넌트 쇼케이스
- **모노레포 페이지** (`/monorepo`): 프로젝트 구조 설명

### packages/ui

shadcn/ui 스타일을 따르는 공통 UI 컴포넌트 라이브러리:

#### 컴포넌트 목록

- **Button**: 6가지 variants (default, primary, danger, outline, secondary, ghost, link)
- **Input**: 폼 입력 필드
- **Select**: 드롭다운 선택 컴포넌트
- **Badge**: 6가지 variants (default, secondary, danger, outline, success, warning)
- **Card**: 카드 컴포넌트 세트 (Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter)
- **Typography**: 다양한 텍스트 스타일 (h1~h4, p, lead, large, small, muted, code, blockquote)

#### 특징

- 일관된 `rounded` border-radius (4px)
- 통일된 높이 (`h-10`) - Button, Input, Select
- TypeScript 완전 지원
- class-variance-authority 기반 variant 시스템

### packages/utils

공통 유틸리티 함수들:

- `cn()`: clsx와 tailwind-merge를 결합한 클래스 병합 함수

### packages/config

공통 설정 파일들:

- **tailwind.config.js**: Tailwind CSS 설정
- **postcss.config.js**: PostCSS 설정
- **eslint.config.js**: ESLint 설정

### packages/styles

글로벌 스타일:

- **globals.css**: Tailwind CSS 기본 스타일

## 🎯 사용법

### UI 컴포넌트 사용

```tsx
import {
  Button,
  Typography,
  Input,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@package/ui';

function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>제목</CardTitle>
      </CardHeader>
      <CardContent>
        <Typography variant="p">내용</Typography>
        <Input placeholder="입력하세요" />
        <div className="flex gap-2">
          <Button variant="primary">확인</Button>
          <Button variant="outline">취소</Button>
        </div>
        <Badge variant="success">완료</Badge>
      </CardContent>
    </Card>
  );
}
```

### 유틸리티 함수 사용

```tsx
import { cn } from '@package/utils';

function MyComponent({ className }) {
  return <div className={cn('base-classes', className)}>내용</div>;
}
```

## 🔧 새로운 컴포넌트 추가하기

1. `packages/ui/src/` 에 새 컴포넌트 파일 생성
2. shadcn/ui 스타일 가이드 따르기
3. `packages/ui/index.ts` 에 export 추가
4. TypeScript 타입 정의 포함

## 🌟 왜 이 구조인가?

### 장점

✅ **모던한 UI**: shadcn/ui 기반의 아름다운 컴포넌트들  
✅ **타입 안전성**: TypeScript로 완전한 타입 지원  
✅ **일관된 디자인**: 통일된 디자인 시스템  
✅ **재사용성**: 모노레포를 통한 컴포넌트 공유  
✅ **확장성**: 새로운 앱과 패키지 쉽게 추가 가능  
✅ **개발 경험**: Hot Reload, TypeScript, ESLint 등 최적화된 DX

### 설계 원칙

- **컴포넌트 중심**: 재사용 가능한 UI 컴포넌트 우선
- **타입 안전성**: 모든 컴포넌트에 완전한 TypeScript 지원
- **일관성**: 통일된 스타일과 패턴
- **확장성**: 쉽게 새로운 기능 추가 가능

## �� 라이선스

MIT License
