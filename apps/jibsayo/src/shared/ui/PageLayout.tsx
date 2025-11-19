export function PageLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h1 className="p-3 text-lg font-semibold">{title}</h1>
      <div className="px-3 pb-10">{children}</div>
    </section>
  );
}
