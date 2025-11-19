export function PageLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="bg-white p-3">
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
      <div>{children}</div>
    </section>
  );
}
