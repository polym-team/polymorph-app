import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://autto.polymorph.co.kr';
const DHLOTTERY_BUY_URL = 'https://ol.dhlottery.co.kr/olotto/game/game645.do';

interface PurchaseSuccessData {
  accountNickname: string;
  dhlotteryId: string;
  roundNo: number;
  ticketCount: number;
  totalAmount: number;
  slots: Array<{ slot: string; mode: string; numbers: string[] }>;
}

export async function sendPurchaseSuccess(to: string, userName: string, data: PurchaseSuccessData) {
  const slotsRows = data.slots
    .map(
      (s) => `
        <tr>
          <td style="padding: 8px 10px; border-bottom: 1px solid #eee; font-weight: 600; width: 40px;">${s.slot}</td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #eee; color: #666; width: 60px;">${s.mode}</td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #eee; font-family: ui-monospace, monospace;">${s.numbers.join(' · ')}</td>
        </tr>`,
    )
    .join('');

  await resend.emails.send({
    from: 'Autto <autto@no-reply.polymorph.co.kr>',
    to,
    subject: `[Autto] ${data.roundNo}회 자동구매 완료`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 16px;">
        <h1 style="font-size: 22px; margin-bottom: 4px;">자동구매 완료</h1>
        <p style="color: #999; font-size: 13px; margin-bottom: 24px;">${userName}님, ${data.roundNo}회 자동구매가 완료되었습니다.</p>

        <div style="border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; margin-bottom: 20px;">
          <div style="background: #fdf7e8; padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">
            <strong>${data.accountNickname}</strong>
            <span style="color: #999; font-size: 12px; margin-left: 8px;">${data.dhlotteryId}</span>
          </div>
          <div style="padding: 16px;">
            <div style="display: flex; gap: 12px; margin-bottom: 16px;">
              <div style="flex: 1; background: #f9fafb; border-radius: 8px; padding: 10px 12px;">
                <div style="font-size: 11px; color: #999;">회차</div>
                <div style="font-size: 16px; font-weight: bold;">${data.roundNo}회</div>
              </div>
              <div style="flex: 1; background: #f9fafb; border-radius: 8px; padding: 10px 12px;">
                <div style="font-size: 11px; color: #999;">구매 수량</div>
                <div style="font-size: 16px; font-weight: bold;">${data.ticketCount}게임</div>
              </div>
              <div style="flex: 1; background: #f9fafb; border-radius: 8px; padding: 10px 12px;">
                <div style="font-size: 11px; color: #999;">총 금액</div>
                <div style="font-size: 16px; font-weight: bold;">${data.totalAmount.toLocaleString()}원</div>
              </div>
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tbody>${slotsRows}</tbody>
            </table>
          </div>
        </div>

        <p style="margin-top: 32px; font-size: 11px; color: #bbb; text-align: center;">
          이 이메일은 Autto 서비스에서 자동 발송되었습니다.
        </p>
      </div>
    `,
  });
}

interface PurchaseFailureData {
  accountNickname: string;
  dhlotteryId: string;
  roundNo: number;
  errorMessage: string;
  attemptCount: number;
}

export async function sendPurchaseFailure(to: string, userName: string, data: PurchaseFailureData) {
  await resend.emails.send({
    from: 'Autto <autto@no-reply.polymorph.co.kr>',
    to,
    subject: `[Autto] ${data.roundNo}회 자동구매 실패 - 수동 구매가 필요합니다`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 16px;">
        <h1 style="font-size: 22px; margin-bottom: 4px;">자동구매 실패</h1>
        <p style="color: #999; font-size: 13px; margin-bottom: 24px;">${userName}님, ${data.roundNo}회 자동구매가 ${data.attemptCount}회 재시도 후 실패했습니다.</p>

        <div style="border: 1px solid #fecaca; background: #fef2f2; border-radius: 12px; overflow: hidden; margin-bottom: 20px;">
          <div style="background: #fee2e2; padding: 12px 16px; border-bottom: 1px solid #fecaca;">
            <strong>${data.accountNickname}</strong>
            <span style="color: #b91c1c; font-size: 12px; margin-left: 8px;">${data.dhlotteryId}</span>
          </div>
          <div style="padding: 16px;">
            <div style="font-size: 13px; color: #7f1d1d; margin-bottom: 8px;">실패 사유</div>
            <div style="padding: 10px 12px; background: white; border: 1px solid #fecaca; border-radius: 6px; font-size: 13px; color: #991b1b; font-family: ui-monospace, monospace; white-space: pre-wrap;">${data.errorMessage}</div>
          </div>
        </div>

        <div style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
          <h2 style="font-size: 16px; margin: 0 0 8px;">수동 구매 안내</h2>
          <p style="font-size: 13px; color: #666; line-height: 1.6; margin: 0 0 16px;">
            동행복권 사이트가 일시적으로 불안정할 수 있습니다. 아래 버튼을 눌러 직접 구매해 주세요.
          </p>
          <a href="${DHLOTTERY_BUY_URL}" style="display: inline-block; background: #f59e0b; color: white; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; margin-right: 8px;">동행복권에서 구매하기</a>
          <a href="${APP_URL}" style="display: inline-block; background: #f3f4f6; color: #374151; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Autto에서 재시도</a>
        </div>

        <p style="margin-top: 32px; font-size: 11px; color: #bbb; text-align: center;">
          이 이메일은 Autto 서비스에서 자동 발송되었습니다.
        </p>
      </div>
    `,
  });
}

interface WeeklyReportData {
  accountNickname: string;
  dhlotteryId: string;
  history: Array<{
    roundNo: string;
    numbers: string;
    winResult: string;
    winAmount: string;
  }>;
  balance: {
    totalDeposit: number;
    purchasableAmount: number;
    monthlyPurchaseTotal: number;
  } | null;
}

function formatMoney(n: number): string {
  return n.toLocaleString() + '원';
}

export async function sendWeeklyReport(to: string, userName: string, reports: WeeklyReportData[]) {
  const accountSections = reports
    .map((report) => {
      const historyRows = report.history.length > 0
        ? report.history
            .map(
              (h) => `
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${h.roundNo}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; font-size: 12px; white-space: pre-wrap;">${h.numbers}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${h.winResult || '미추첨'}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${h.winAmount}</td>
              </tr>`,
            )
            .join('')
        : '<tr><td colspan="4" style="padding: 16px; text-align: center; color: #999;">최근 구매내역이 없습니다.</td></tr>';

      const balanceSection = report.balance
        ? `
          <div style="display: flex; gap: 16px; margin-top: 12px;">
            <div style="flex: 1; background: #f9fafb; border-radius: 8px; padding: 12px;">
              <div style="font-size: 11px; color: #999;">총 예치금</div>
              <div style="font-size: 16px; font-weight: bold;">${formatMoney(report.balance.totalDeposit)}</div>
            </div>
            <div style="flex: 1; background: #f9fafb; border-radius: 8px; padding: 12px;">
              <div style="font-size: 11px; color: #999;">구매 가능</div>
              <div style="font-size: 16px; font-weight: bold; color: ${report.balance.purchasableAmount < 5000 ? '#ef4444' : '#059669'};">${formatMoney(report.balance.purchasableAmount)}</div>
            </div>
            <div style="flex: 1; background: #f9fafb; border-radius: 8px; padding: 12px;">
              <div style="font-size: 11px; color: #999;">이번달 구매</div>
              <div style="font-size: 16px; font-weight: bold;">${formatMoney(report.balance.monthlyPurchaseTotal)}</div>
            </div>
          </div>
          ${report.balance.purchasableAmount < 5000 ? '<p style="margin-top: 8px; padding: 8px 12px; background: #fef2f2; border-radius: 6px; color: #dc2626; font-size: 13px;">⚠ 예치금이 부족합니다. 충전이 필요합니다.</p>' : ''}
        `
        : '<p style="color: #999; font-size: 13px; margin-top: 8px;">예치금 조회에 실패했습니다.</p>';

      return `
        <div style="margin-bottom: 32px; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
          <div style="background: #fdf7e8; padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">
            <strong>${report.accountNickname}</strong>
            <span style="color: #999; font-size: 12px; margin-left: 8px;">${report.dhlotteryId}</span>
          </div>
          <div style="padding: 16px;">
            <h3 style="margin: 0 0 8px; font-size: 14px; color: #666;">예치금 현황</h3>
            ${balanceSection}

            <h3 style="margin: 20px 0 8px; font-size: 14px; color: #666;">최근 구매내역</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <thead>
                <tr style="background: #f9fafb;">
                  <th style="padding: 8px; text-align: left;">회차</th>
                  <th style="padding: 8px; text-align: left;">번호</th>
                  <th style="padding: 8px; text-align: center;">결과</th>
                  <th style="padding: 8px; text-align: right;">당첨금</th>
                </tr>
              </thead>
              <tbody>${historyRows}</tbody>
            </table>
          </div>
        </div>
      `;
    })
    .join('');

  await resend.emails.send({
    from: 'Autto <autto@no-reply.polymorph.co.kr>',
    to,
    subject: `[Autto] 주간 로또 리포트`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 16px;">
        <h1 style="font-size: 22px; margin-bottom: 4px;">Autto 주간 리포트</h1>
        <p style="color: #999; font-size: 13px; margin-bottom: 24px;">${userName}님의 동행복권 현황입니다.</p>
        ${accountSections}
        <p style="margin-top: 32px; font-size: 11px; color: #bbb; text-align: center;">
          이 이메일은 Autto 서비스에서 자동 발송되었습니다.
        </p>
      </div>
    `,
  });
}
