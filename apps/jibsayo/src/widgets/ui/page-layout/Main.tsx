export function Main({ children }: { children: React.ReactNode }) {
  return (
    // pb: 모바일은 하단 네비 영역 여유, 데스크톱은 기본
    <main className="mx-auto max-w-screen-md flex-1 px-3 py-3 pb-32 md:pb-10 lg:max-w-screen-lg">
      {children}
    </main>
  );
}
