interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return <div className="flex w-full flex-col gap-y-5">{children}</div>;
}
