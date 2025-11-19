interface ApartTransactionHistoryLayoutProps {
  children: React.ReactNode;
}

export function ApartTransactionHistoryLayout({
  children,
}: ApartTransactionHistoryLayoutProps) {
  return (
    <div className="bg-white p-3">
      <span className="font-semibold">거래 내역</span>
      <div className="mt-2 flex flex-col gap-y-5">{children}</div>
    </div>
  );
}
