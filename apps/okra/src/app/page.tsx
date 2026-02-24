import Link from 'next/link';
import { Button } from '@package/ui';
import { auth } from '@/shared/lib/auth';

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-green-50 to-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">Okra</h1>
        <p className="mt-4 text-lg text-gray-600">
          팀의 OKR을 함께 만들고, 실행하고, 회고하세요
        </p>
        <p className="mt-2 text-gray-500">
          Space 기반의 팀 협업과 커스텀 주기의 OKR 관리를 지원합니다
        </p>

        <div className="mt-8">
          {session ? (
            <Link href="/spaces">
              <Button size="lg">내 Space 보기</Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button size="lg">Google로 시작하기</Button>
            </Link>
          )}
        </div>

        <div className="mt-12 grid max-w-2xl gap-6 text-left sm:grid-cols-3">
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <h3 className="font-semibold">목표 설정</h3>
            <p className="mt-1 text-sm text-gray-600">
              팀의 Objective와 Key Result를 함께 정의하세요
            </p>
          </div>
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <h3 className="font-semibold">진행 추적</h3>
            <p className="mt-1 text-sm text-gray-600">
              Key Result의 진행 상황을 실시간으로 업데이트하세요
            </p>
          </div>
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <h3 className="font-semibold">회고</h3>
            <p className="mt-1 text-sm text-gray-600">
              주기별 회고를 통해 팀의 성장을 기록하세요
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
