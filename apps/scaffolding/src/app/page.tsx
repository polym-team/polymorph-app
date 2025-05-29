import { Button, Typography } from "@package/ui";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono lg:flex">
        <div className="text-center">
          <Typography variant="h1" className="mb-8">
            Polymorph Scaffolding App
          </Typography>
          <Typography variant="lead" className="mb-8">
            빠른 프로토타이핑을 위한 스캐폴딩 앱입니다.
          </Typography>
          <div className="flex gap-4 justify-center">
            <Link href="/fast-dev">
              <Button variant="primary">빠른 개발 보기</Button>
            </Link>
            <Link href="/modern-ui">
              <Button variant="outline">모던 UI 보기</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-16 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-3 lg:text-left">
        <Link
          href="/fast-dev"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 cursor-pointer"
        >
          <Typography variant="h2" className="mb-3">
            빠른 개발{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1">
              -&gt;
            </span>
          </Typography>
          <p className="m-0 max-w-[30ch] text-gray-500">
            Next.js와 TypeScript로 빠르게 프로토타입을 개발하세요.
          </p>
        </Link>

        <Link
          href="/modern-ui"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 cursor-pointer"
        >
          <Typography variant="h2" className="mb-3">
            모던 UI{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1">
              -&gt;
            </span>
          </Typography>
          <p className="m-0 max-w-[30ch] text-gray-500">
            shadcn/ui와 Tailwind CSS로 아름다운 UI를 구성하세요.
          </p>
        </Link>

        <Link
          href="/monorepo"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 cursor-pointer"
        >
          <Typography variant="h2" className="mb-3">
            모노레포{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1">
              -&gt;
            </span>
          </Typography>
          <p className="m-0 max-w-[30ch] text-gray-500">
            pnpm workspace로 확장 가능한 모노레포 구조를 활용하세요.
          </p>
        </Link>
      </div>
    </main>
  );
}
