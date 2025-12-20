export function Main({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-screen-md flex-1 px-3 py-3 pb-10 lg:max-w-screen-lg">
      {children}
    </main>
  );
}
