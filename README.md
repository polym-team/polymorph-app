# Polymorph App

pnpm-workspace를 사용한 **극도로 간소화된** 모노레포 구조의 프로젝트입니다.

## 구조

```
polymorph-app/
├── apps/
│   └── scaffolding/          # Next.js 기반 스캐폴딩 앱
├── packages/
│   ├── ui/                   # 공통 UI 컴포넌트 (순수 TypeScript 파일들)
│   └── utils/                # 공통 유틸리티 함수 (순수 TypeScript 파일들)
├── pnpm-workspace.yaml       # pnpm workspace 설정
└── package.json              # 루트 패키지 설정 (핵심 의존성만)
```

## 미니멀 모노레포 구조

### 핵심 특징

- **핵심 의존성만**: Next.js, React, TypeScript, Tailwind CSS만 포함
- **복잡한 라이브러리 제거**: clsx, tailwind-merge, radix-ui, class-variance-authority 등 제거
- **간단한 컴포넌트**: shadcn 대신 순수 Tailwind CSS 기반 컴포넌트
- **TypeScript 경로 매핑**: `@polymorph/ui`, `@polymorph/utils`로 직접 참조

### 장점

✅ **극도로 가벼운 구조**: 불필요한 의존성 완전 제거  
✅ **빠른 설치**: 최소한의 패키지만 설치  
✅ **간단한 유지보수**: 복잡한 라이브러리 의존성 없음  
✅ **명확한 코드**: 외부 라이브러리 추상화 없이 직관적인 코드  
✅ **빠른 빌드**: 최소한의 번들 크기

### 포함된 패키지

- **React 생태계**: react, react-dom, next
- **개발 도구**: typescript, eslint, prettier
- **스타일링**: tailwindcss, autoprefixer, postcss
- **타입 정의**: @types/node, @types/react, @types/react-dom

## 시작하기

### 1. 의존성 설치

```bash
pnpm install
```

### 2. 개발 서버 실행

```bash
pnpm dev
```

### 3. 빌드

```bash
pnpm build
```

## 스크립트

- `pnpm dev` - scaffolding 앱 개발 서버 실행
- `pnpm build` - scaffolding 앱 빌드
- `pnpm start` - scaffolding 앱 프로덕션 서버 실행
- `pnpm lint` - 모든 패키지 린트 검사
- `pnpm type-check` - 모든 패키지 타입 검사

## 기술 스택

- **모노레포**: pnpm workspace
- **프레임워크**: Next.js 14
- **언어**: TypeScript
- **스타일링**: Tailwind CSS (순수)
- **패키지 매니저**: pnpm

## 패키지

### apps/scaffolding

- Next.js 기반의 스캐폴딩 앱
- TypeScript, Tailwind CSS 포함
- 빠른 프로토타이핑을 위한 기본 구조 제공
- 간단한 Button 컴포넌트 포함

### packages/ui

- 공통 UI 컴포넌트 라이브러리 (순수 TypeScript 파일들)
- 순수 Tailwind CSS 기반 컴포넌트들
- 외부 라이브러리 의존성 없음

### packages/utils

- 공통 유틸리티 함수들 (순수 TypeScript 파일들)
- 간단한 클래스 병합 함수

## 새로운 앱 추가하기

1. `apps/` 디렉토리에 새 앱 생성
2. 앱의 `tsconfig.json`에 경로 매핑 추가:
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@polymorph/ui": ["../../packages/ui"],
         "@polymorph/utils": ["../../packages/utils"]
       }
     }
   }
   ```
3. 핵심 의존성은 이미 루트에 설치되어 있어 별도 설치 불필요

## 새로운 패키지 추가하기

1. `packages/` 디렉토리에 새 디렉토리 생성
2. TypeScript 파일들 추가 (package.json 불필요!)
3. 필요한 의존성이 있다면 루트 `package.json`에 추가
4. 앱들의 `tsconfig.json`에 경로 매핑 추가

## 왜 이 구조인가?

많은 모노레포 설정이 과도하게 복잡합니다. 이 구조는:

- **shadcn 복잡성 제거**: clsx, tailwind-merge, radix-ui 등 불필요
- **순수 Tailwind CSS**: 직관적이고 명확한 스타일링
- **최소한의 의존성**: 정말 필요한 것만 포함
- **빠른 개발**: 복잡한 추상화 없이 바로 개발 가능

**결과**: 모노레포의 장점을 유지하면서도 극도로 간단하고 빠른 개발이 가능합니다.
