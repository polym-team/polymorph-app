import Link from 'next/link';

import { Button } from '@package/ui';

export default function FastDevPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-4xl text-center">
        <h1 className="mb-8 text-4xl font-bold">⚡ 빠른 개발</h1>
        <p className="mb-12 text-xl text-gray-600">
          Next.js와 TypeScript로 빠르게 프로토타입을 개발하세요
        </p>

        <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="rounded-lg border bg-white p-6 shadow-md">
            <h3 className="mb-4 text-xl font-semibold">🚀 Hot Reload</h3>
            <p className="mb-4 text-gray-600">
              코드 변경 시 즉시 반영되는 개발 환경
            </p>
            <div className="rounded bg-gray-100 p-3 font-mono text-sm">
              pnpm dev
            </div>
          </div>

          <div className="rounded-lg border bg-white p-6 shadow-md">
            <h3 className="mb-4 text-xl font-semibold">📦 모노레포</h3>
            <p className="mb-4 text-gray-600">
              여러 패키지를 하나의 저장소에서 관리
            </p>
            <div className="rounded bg-gray-100 p-3 font-mono text-sm">
              pnpm --filter [app] [command]
            </div>
          </div>

          <div className="rounded-lg border bg-white p-6 shadow-md">
            <h3 className="mb-4 text-xl font-semibold">🔧 TypeScript</h3>
            <p className="mb-4 text-gray-600">타입 안전성과 개발자 경험 향상</p>
            <div className="rounded bg-gray-100 p-3 font-mono text-sm">
              pnpm tsc
            </div>
          </div>

          <div className="rounded-lg border bg-white p-6 shadow-md">
            <h3 className="mb-4 text-xl font-semibold">🎯 ESLint</h3>
            <p className="mb-4 text-gray-600">코드 품질과 일관성 유지</p>
            <div className="rounded bg-gray-100 p-3 font-mono text-sm">
              pnpm lint
            </div>
          </div>
        </div>

        <Link href="/">
          <Button variant="outline">홈으로 돌아가기</Button>
        </Link>
      </div>
    </main>
  );
}
