import { Button } from "@package/ui";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-8">Polymorph Scaffolding App</h1>
          <p className="text-xl text-gray-600 mb-8">
            빠른 프로토타이핑을 위한 스캐폴딩 앱입니다.
          </p>
          <div className="flex gap-4 justify-center">
            <Button>시작하기</Button>
            <Button variant="outline">문서 보기</Button>
          </div>
        </div>
      </div>

      <div className="mt-16 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-3 lg:text-left">
        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100">
          <h2 className="mb-3 text-2xl font-semibold">
            빠른 개발{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm text-gray-500">
            Next.js와 TypeScript로 빠르게 프로토타입을 개발하세요.
          </p>
        </div>

        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100">
          <h2 className="mb-3 text-2xl font-semibold">
            모던 UI{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm text-gray-500">
            shadcn/ui와 Tailwind CSS로 아름다운 UI를 구성하세요.
          </p>
        </div>

        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100">
          <h2 className="mb-3 text-2xl font-semibold">
            모노레포{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm text-gray-500">
            pnpm workspace로 확장 가능한 모노레포 구조를 활용하세요.
          </p>
        </div>
      </div>
    </main>
  );
}
