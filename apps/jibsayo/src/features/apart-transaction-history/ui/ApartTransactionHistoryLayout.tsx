import { Card, Typography } from '@package/ui';

interface ApartTransactionHistoryLayoutProps {
  children: React.ReactNode;
}

export function ApartTransactionHistoryLayout({
  children,
}: ApartTransactionHistoryLayoutProps) {
  return (
    <Card className="p-3">
      <Typography variant="large" className="font-semibold">
        거래 내역
      </Typography>
      <div className="flex flex-col gap-y-5">{children}</div>
    </Card>
  );
}
