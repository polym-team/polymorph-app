import Link from 'next/link';

import { Button } from '@package/ui';
import { cn } from '@package/utils';

export default function MonorepoPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-6xl text-center">
        <h1 className="mb-8 text-4xl font-bold">📦 모노레포</h1>
        <p className="mb-12 text-xl text-gray-600">
          pnpm workspace로 확장 가능한 모노레포 구조를 활용하세요
        </p>

        {/* Project Structure */}
        <div className="mb-12 overflow-x-auto rounded-lg bg-gray-900 p-6 text-left font-mono text-green-400">
          <div className="text-sm">
            <div>polymorph-app/</div>
            <div className="ml-4">├── apps/</div>
            <div className="ml-8">
              └── scaffolding/{' '}
              <span className="text-gray-500"># Next.js 앱</span>
            </div>
            <div className="ml-4">├── packages/</div>
            <div className="ml-8">
              ├── ui/ <span className="text-gray-500"># UI 컴포넌트</span>
            </div>
            <div className="ml-8">
              ├── utils/ <span className="text-gray-500"># 유틸리티</span>
            </div>
            <div className="ml-8">
              ├── config/ <span className="text-gray-500"># 설정 파일</span>
            </div>
            <div className="ml-8">
              └── styles/ <span className="text-gray-500"># 글로벌 스타일</span>
            </div>
            <div className="ml-4">├── package.json</div>
            <div className="ml-4">└── pnpm-workspace.yaml</div>
          </div>
        </div>

        {/* Package Showcase */}
        <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* UI Package */}
          <div className="rounded-lg border bg-white p-6 shadow-md">
            <h3 className="mb-4 text-xl font-semibold text-blue-600">
              @package/ui
            </h3>
            <p className="mb-4 text-gray-600">재사용 가능한 UI 컴포넌트들</p>
            <div className="mb-4 space-y-2">
              <Button variant="primary" size="sm" className="w-full">
                Button Component
              </Button>
              <div className="text-sm text-gray-500">
                + Card, Input, Modal...
              </div>
            </div>
            <div className="rounded bg-gray-100 p-2 font-mono text-xs">
              import {`{ Button }`} from &quot;@package/ui&quot;
            </div>
          </div>

          {/* Utils Package */}
          <div className="rounded-lg border bg-white p-6 shadow-md">
            <h3 className="mb-4 text-xl font-semibold text-green-600">
              @package/utils
            </h3>
            <p className="mb-4 text-gray-600">공통 유틸리티 함수들</p>
            <div className="mb-4 space-y-2">
              <div
                className={cn(
                  'rounded bg-blue-100 p-2 text-sm',
                  'text-blue-800'
                )}
              >
                cn() 함수 예시
              </div>
              <div className="text-sm text-gray-500">
                + formatDate, debounce...
              </div>
            </div>
            <div className="rounded bg-gray-100 p-2 font-mono text-xs">
              import {`{ cn }`} from &quot;@package/utils&quot;
            </div>
          </div>

          {/* Config Package */}
          <div className="rounded-lg border bg-white p-6 shadow-md">
            <h3 className="mb-4 text-xl font-semibold text-purple-600">
              packages/config
            </h3>
            <p className="mb-4 text-gray-600">공통 설정 파일들</p>
            <div className="mb-4 space-y-2 text-sm">
              <div>• next.config.js</div>
              <div>• tailwind.config.js</div>
              <div>• tsconfig.base.json</div>
              <div>• postcss.config.js</div>
            </div>
            <div className="rounded bg-gray-100 p-2 font-mono text-xs">
              require(&quot;../../packages/config/...&quot;)
            </div>
          </div>
        </div>

        {/* Commands */}
        <div className="mb-8 rounded-lg border bg-white p-8 shadow-md">
          <h3 className="mb-6 text-xl font-semibold">주요 명령어들</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h4 className="mb-3 font-medium text-blue-600">개발 명령어</h4>
              <div className="space-y-2 text-sm">
                <div className="rounded bg-gray-100 p-2 font-mono">
                  pnpm --filter scaffolding dev
                </div>
                <div className="rounded bg-gray-100 p-2 font-mono">
                  pnpm --recursive lint
                </div>
                <div className="rounded bg-gray-100 p-2 font-mono">
                  pnpm --recursive tsc
                </div>
              </div>
            </div>
            <div>
              <h4 className="mb-3 font-medium text-green-600">패키지 관리</h4>
              <div className="space-y-2 text-sm">
                <div className="rounded bg-gray-100 p-2 font-mono">
                  pnpm install
                </div>
                <div className="rounded bg-gray-100 p-2 font-mono">
                  pnpm add [package] --filter [app]
                </div>
                <div className="rounded bg-gray-100 p-2 font-mono">
                  pnpm --recursive clean
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="text-center">
            <div className="mb-2 text-3xl">🔄</div>
            <h4 className="mb-2 font-semibold">코드 재사용</h4>
            <p className="text-sm text-gray-600">
              패키지 간 코드 공유로 중복 제거
            </p>
          </div>
          <div className="text-center">
            <div className="mb-2 text-3xl">⚡</div>
            <h4 className="mb-2 font-semibold">빠른 개발</h4>
            <p className="text-sm text-gray-600">
              공통 설정과 컴포넌트로 빠른 프로토타이핑
            </p>
          </div>
          <div className="text-center">
            <div className="mb-2 text-3xl">📈</div>
            <h4 className="mb-2 font-semibold">확장성</h4>
            <p className="text-sm text-gray-600">
              새로운 앱과 패키지 쉽게 추가
            </p>
          </div>
        </div>

        <Link href="/">
          <Button variant="outline" size="lg">
            홈으로 돌아가기
          </Button>
        </Link>
      </div>
    </main>
  );
}
