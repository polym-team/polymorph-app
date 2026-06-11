# CLAUDE.md

이 문서는 Claude Code가 `polymorph-app` 모노레포에서 작업할 때 참조하는 가이드입니다.

## Project Overview

pnpm workspace 기반 Next.js 모노레포. 모든 앱이 같은 인증 서버(`oauth-server`)와 공통 UI/유틸 패키지(`packages/ui`, `packages/utils` 등)를 공유합니다. 빌드된 이미지는 GitHub Actions를 통해 `polymorph-k8s` 저장소에 반영되며, argocd가 자동 sync합니다.

## Sibling Repositories

Claude Code 에이전트는 일반적으로 **`polymorph-app`에서 실행**합니다. 하지만 단일 작업이 여러 저장소에 걸치는 경우가 많으니, 다음 형제 저장소들의 역할을 알고 있어야 합니다.

| 경로 | 역할 |
|---|---|
| `/Users/rootbeer.axz-pc/Documents/project/polymorph-app` | **(현 위치)** 모든 Next.js 앱·공유 패키지 소스 |
| `/Users/rootbeer.axz-pc/Documents/project/polymorph-k8s` | argocd app-of-apps 패턴의 k8s 매니페스트. `apps/<name>/application.yaml`에 등록되면 자동으로 argocd app으로 등록되고, `manifests/<name>/` 아래 리소스가 동기화됨. cron/secret/ingress/deployment 등은 모두 여기에 있음. |
| `/Users/rootbeer.axz-pc/Documents/project/infra-macmini-gitops` | argocd·traefik·cloudnative-pg·registry 등 클러스터 인프라를 Terraform으로 관리 |
| `/Users/rootbeer.axz-pc/Documents/project/polymorph-upptime` | 장애 대응용 정적 상태 페이지(GitHub Pages). 외부 서비스로 점검/헬스체크 노출. **현재 비어 있음.** |

### 작업 위치 판단 가이드

- 앱 코드/로직 변경 → **polymorph-app**
- k8s 리소스(Deployment, CronJob, Ingress, Secret 등) 추가/수정 → **polymorph-k8s/manifests/\<app\>/**
- 새 앱을 클러스터에 올리려면 → **polymorph-k8s/apps/\<app\>/application.yaml** 추가 + `manifests/<app>/` 작성
- 클러스터/인프라 자체 변경(새 네임스페이스 모듈, DB, Ingress controller 등) → **infra-macmini-gitops**
- 점검/장애 안내 페이지 → **polymorph-upptime**

## Monorepo Structure

```
polymorph-app/
├── apps/
│   ├── oauth-server/              # 중앙 인증 서버 (oauth.polymorph.co.kr)
│   ├── jibsayo/                   # 부동산 거래 정보 앱
│   ├── rootbeer-employee-mall/    # 사내 공동구매 몰
│   ├── autto/                     # autto.polymorph.co.kr
│   ├── bookmark-share/            # 북마크 공유
│   ├── collab/                    # 협업 도구
│   ├── okra/                      # 오크라
│   ├── official-website/          # 회사 공식 웹사이트
│   ├── maintenance/               # 점검 모드용 catch-all 503 앱
│   └── scaffolding/               # UI 컴포넌트 쇼케이스
└── packages/
    ├── ui/            # shadcn/ui 기반 공통 컴포넌트 (Button, Input, Select, Badge, Card, Typography 등)
    ├── utils/         # cn() 등 공통 유틸
    ├── shared-auth/   # oauth-server 발급 JWT 검증 유틸
    ├── firebase/      # Firebase Admin SDK + Expo Push 클라이언트
    ├── styles/        # 글로벌 스타일
    └── config/        # Tailwind / PostCSS / ESLint 공통 설정
```

각 앱이 자체적으로 가지는 상세 가이드는 해당 디렉토리의 `CLAUDE.md`(존재하는 경우)를 우선 참조:

- `apps/oauth-server/CLAUDE.md` — 다른 앱이 OAuth 통합할 때 절차
- `apps/jibsayo/CLAUDE.md` — Feature-Sliced Design, API/테스트 전략

## Commands

자세한 스크립트는 루트 및 각 앱의 `package.json` 참조. 자주 쓰는 진입점:

```bash
pnpm install                       # 전체 의존성 설치
pnpm <app>                         # 루트 package.json에 정의된 단축 스크립트
                                   # → 앱 + oauth-server를 함께 dev 모드로 실행
                                   # 예: pnpm rootbeer, pnpm jibsayo, pnpm autto
pnpm --filter <app> dev|build|tsc|lint|clean
```

pnpm workspace 프로토콜로 공유 패키지를 참조하며 (`"@package/ui": "workspace:*"`), Next.js `transpilePackages`로 트랜스파일합니다.

## Deployment Flow

1. `apps/<app>/**` 변경 → main push
2. `.github/workflows/<app>-deploy-polymorph-k8s-prd.yaml`이 실행:
   - 이미지를 빌드해서 레지스트리에 푸시
   - `polymorph-k8s/manifests/<app>/deployment.yaml`의 이미지 태그를 커밋으로 갱신 (`chore(<app>): update image to <sha>`)
3. argocd가 `polymorph-k8s` 변경을 감지 → 클러스터에 자동 동기화

> **중요**: 대규모 변경은 argocd 부담을 줄이기 위해 영향 단위로 커밋을 쪼개고, 푸시는 사용자 지시가 있을 때만 진행합니다.

CronJob, Secret, Ingress 등 런타임 리소스 추가가 필요하면 앱 코드와 별개로 `polymorph-k8s/manifests/<app>/`에 직접 매니페스트를 작성/커밋해야 반영됩니다.

## Authentication

인증이 필요한 앱은 **자체 로그인 UI를 만들지 않고** `oauth.polymorph.co.kr`(`apps/oauth-server`)로 위임합니다. JWT 검증은 `packages/shared-auth`를 사용합니다. 신규 앱을 통합할 때는 `apps/oauth-server/CLAUDE.md`의 통합 가이드를 따르세요.

## UI Conventions

`packages/ui`는 shadcn/ui 스타일을 따릅니다. 새 컴포넌트를 추가할 때:

- `rounded` border-radius (4px), 일관된 `h-10` (Button/Input/Select)
- `class-variance-authority`로 variant 시스템 구성
- `cn()` (from `@package/utils`)으로 클래스 병합
- `packages/ui/index.ts`에 export 추가

기존 컴포넌트의 정확한 API/변형은 `packages/ui/src/` 소스를 직접 확인하세요.

## Firebase

`@polymorph/firebase` 패키지가 `AdminFirestoreClient`와 `ExpoPushNotificationClient`를 제공합니다. **Admin SDK는 서버 사이드(API 라우트/크론) 전용**이며, 자격 증명은 환경변수로 관리됩니다.

## Git Workflow

- Husky + lint-staged: 스테이지된 ts/tsx 파일에 `eslint --fix`, jibsayo는 추가로 `pnpm tsc` 실행
- 스테이징은 가능하면 변경한 파일을 명시해서 추가하세요 (`git add <path>`). 광범위한 `git add .`는 의도치 않은 파일을 끌어올 수 있습니다.
- 커밋 메시지는 `feat(<app>): ...` / `fix(<app>): ...` / `chore(<app>): ...` / `ci(<app>): ...` / `docs(<app>): ...` 형식을 따릅니다.
