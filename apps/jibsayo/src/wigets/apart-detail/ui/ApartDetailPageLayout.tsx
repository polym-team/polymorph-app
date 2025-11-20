interface ApartDetailPageLayoutProps {
  children: React.ReactNode;
}

export function ApartDetailPageLayout({
  children,
}: ApartDetailPageLayoutProps) {
  return <div className="flex w-full flex-col gap-y-5">{children}</div>;
}
