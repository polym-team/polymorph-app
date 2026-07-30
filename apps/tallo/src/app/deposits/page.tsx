import { Button } from '@package/ui';

import { prisma } from '@/lib/prisma';
import { getAuthUserFromCookies } from '@/lib/user-auth';

export const dynamic = 'force-dynamic';

const OAUTH = process.env.NEXT_PUBLIC_OAUTH_SERVER_URL ?? 'https://oauth.polymorph.co.kr';
const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? '';

function fmtAmount(won: number): string {
  return won.toLocaleString('ko-KR');
}
function fmtDate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default async function DepositsPage() {
  const user = await getAuthUserFromCookies();

  if (!user) {
    const loginUrl = `${OAUTH}/login?clientId=tallo&redirectUri=${encodeURIComponent(`${BASE}/auth/callback`)}`;
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <h1 className="text-lg font-semibold tracking-tight">로그인이 필요합니다</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            입금 내역은 로그인 후 볼 수 있습니다.
          </p>
          <a
            href={loginUrl}
            className="mt-6 inline-block w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground"
          >
            로그인
          </a>
        </div>
      </main>
    );
  }

  // 내 감시 계좌의 끝자리와 매칭되는 입금 원장만 노출 (수취계좌는 마스킹 저장).
  const accounts = await prisma.account.findMany({
    where: { userId: user.userId },
    select: { accountNumber: true },
  });
  const acctDigits = accounts
    .map((a) => a.accountNumber.replace(/\D/g, ''))
    .filter((d) => d.length >= 4);

  let rows: { id: number; payerName: string; amount: number; txAt: Date; bankAccount: string | null }[] = [];
  if (acctDigits.length > 0) {
    const recent = await prisma.deposit.findMany({
      orderBy: { txAt: 'desc' },
      take: 200,
      select: { id: true, payerName: true, amount: true, txAt: true, bankAccount: true },
    });
    rows = recent.filter((d) => {
      const dep = (d.bankAccount ?? '').replace(/\D/g, '');
      return dep.length >= 4 && acctDigits.some((acc) => acc.endsWith(dep));
    });
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:py-10">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">입금 내역</h1>
        <a href="/accounts">
          <Button variant="outline" size="sm">
            내 계좌
          </Button>
        </a>
      </div>
      <p className="mb-5 text-sm text-muted-foreground">
        등록한 감시 계좌로 들어온 입금 원장입니다. (최근순)
      </p>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {rows.length === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-muted-foreground">
            아직 입금 내역이 없습니다.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">일시</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">입금자명</th>
                  <th className="hidden whitespace-nowrap px-4 py-3 font-semibold sm:table-cell">
                    수취계좌
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-right font-semibold">금액</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((d) => (
                  <tr key={d.id} className="border-b border-border last:border-none">
                    <td className="whitespace-nowrap px-4 py-3 font-mono tabular-nums text-muted-foreground">
                      {fmtDate(d.txAt)}
                    </td>
                    <td className="px-4 py-3 font-medium">{d.payerName}</td>
                    <td className="hidden whitespace-nowrap px-4 py-3 font-mono text-muted-foreground sm:table-cell">
                      {d.bankAccount ?? '-'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-mono font-medium tabular-nums">
                      {fmtAmount(d.amount)}원
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
