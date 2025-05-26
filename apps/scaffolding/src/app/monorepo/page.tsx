import { Button } from "@package/ui";
import { cn } from "@package/utils";
import Link from "next/link";

export default function MonorepoPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-6xl w-full text-center">
        <h1 className="text-4xl font-bold mb-8">📦 모노레포</h1>
        <p className="text-xl text-gray-600 mb-12">
          pnpm workspace로 확장 가능한 모노레포 구조를 활용하세요
        </p>

        {/* Project Structure */}
        <div className="bg-gray-900 text-green-400 p-6 rounded-lg font-mono text-left mb-12 overflow-x-auto">
          <div className="text-sm">
            <div>polymorph-app/</div>
            <div className="ml-4">├── apps/</div>
            <div className="ml-8">
              └── scaffolding/{" "}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* UI Package */}
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h3 className="text-xl font-semibold mb-4 text-blue-600">
              @package/ui
            </h3>
            <p className="text-gray-600 mb-4">재사용 가능한 UI 컴포넌트들</p>
            <div className="space-y-2 mb-4">
              <Button variant="primary" size="sm" className="w-full">
                Button Component
              </Button>
              <div className="text-sm text-gray-500">
                + Card, Input, Modal...
              </div>
            </div>
            <div className="bg-gray-100 p-2 rounded text-xs font-mono">
              import {`{ Button }`} from &quot;@package/ui&quot;
            </div>
          </div>

          {/* Utils Package */}
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h3 className="text-xl font-semibold mb-4 text-green-600">
              @package/utils
            </h3>
            <p className="text-gray-600 mb-4">공통 유틸리티 함수들</p>
            <div className="space-y-2 mb-4">
              <div
                className={cn(
                  "p-2 bg-blue-100 rounded text-sm",
                  "text-blue-800"
                )}
              >
                cn() 함수 예시
              </div>
              <div className="text-sm text-gray-500">
                + formatDate, debounce...
              </div>
            </div>
            <div className="bg-gray-100 p-2 rounded text-xs font-mono">
              import {`{ cn }`} from &quot;@package/utils&quot;
            </div>
          </div>

          {/* Config Package */}
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h3 className="text-xl font-semibold mb-4 text-purple-600">
              packages/config
            </h3>
            <p className="text-gray-600 mb-4">공통 설정 파일들</p>
            <div className="space-y-2 mb-4 text-sm">
              <div>• next.config.js</div>
              <div>• tailwind.config.js</div>
              <div>• tsconfig.base.json</div>
              <div>• postcss.config.js</div>
            </div>
            <div className="bg-gray-100 p-2 rounded text-xs font-mono">
              require(&quot;../../packages/config/...&quot;)
            </div>
          </div>
        </div>

        {/* Commands */}
        <div className="bg-white p-8 rounded-lg shadow-md border mb-8">
          <h3 className="text-xl font-semibold mb-6">주요 명령어들</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3 text-blue-600">개발 명령어</h4>
              <div className="space-y-2 text-sm">
                <div className="bg-gray-100 p-2 rounded font-mono">
                  pnpm --filter scaffolding dev
                </div>
                <div className="bg-gray-100 p-2 rounded font-mono">
                  pnpm --recursive lint
                </div>
                <div className="bg-gray-100 p-2 rounded font-mono">
                  pnpm --recursive tsc
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3 text-green-600">패키지 관리</h4>
              <div className="space-y-2 text-sm">
                <div className="bg-gray-100 p-2 rounded font-mono">
                  pnpm install
                </div>
                <div className="bg-gray-100 p-2 rounded font-mono">
                  pnpm add [package] --filter [app]
                </div>
                <div className="bg-gray-100 p-2 rounded font-mono">
                  pnpm --recursive clean
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center">
            <div className="text-3xl mb-2">🔄</div>
            <h4 className="font-semibold mb-2">코드 재사용</h4>
            <p className="text-sm text-gray-600">
              패키지 간 코드 공유로 중복 제거
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">⚡</div>
            <h4 className="font-semibold mb-2">빠른 개발</h4>
            <p className="text-sm text-gray-600">
              공통 설정과 컴포넌트로 빠른 프로토타이핑
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">📈</div>
            <h4 className="font-semibold mb-2">확장성</h4>
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
