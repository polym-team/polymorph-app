import { Button } from '@package/ui';
import Link from 'next/link';

export default function FastDevPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-4xl w-full text-center">
        <h1 className="text-4xl font-bold mb-8">⚡ 빠른 개발</h1>
        <p className="text-xl text-gray-600 mb-12">
          Next.js와 TypeScript로 빠르게 프로토타입을 개발하세요
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h3 className="text-xl font-semibold mb-4">🚀 Hot Reload</h3>
            <p className="text-gray-600 mb-4">
              코드 변경 시 즉시 반영되는 개발 환경
            </p>
            <div className="bg-gray-100 p-3 rounded text-sm font-mono">
              pnpm dev
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h3 className="text-xl font-semibold mb-4">📦 모노레포</h3>
            <p className="text-gray-600 mb-4">
              여러 패키지를 하나의 저장소에서 관리
            </p>
            <div className="bg-gray-100 p-3 rounded text-sm font-mono">
              pnpm --filter [app] [command]
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h3 className="text-xl font-semibold mb-4">🔧 TypeScript</h3>
            <p className="text-gray-600 mb-4">타입 안전성과 개발자 경험 향상</p>
            <div className="bg-gray-100 p-3 rounded text-sm font-mono">
              pnpm tsc
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h3 className="text-xl font-semibold mb-4">🎯 ESLint</h3>
            <p className="text-gray-600 mb-4">코드 품질과 일관성 유지</p>
            <div className="bg-gray-100 p-3 rounded text-sm font-mono">
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
