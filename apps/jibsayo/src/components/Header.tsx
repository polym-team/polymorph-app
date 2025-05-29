import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/transaction" className="flex items-center space-x-2">
            <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-full">
              <span className="text-xs font-bold text-white">집</span>
            </div>
            <span className="text-primary text-2xl font-bold">집사요</span>
          </Link>

          <nav className="flex items-center space-x-6">
            <Link
              href="/transaction"
              className="text-gray-600 transition-colors hover:text-gray-900"
            >
              실거래가 조회
            </Link>
            <Link
              href="/services"
              className="text-gray-600 transition-colors hover:text-gray-900"
            >
              저장된 아파트
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
