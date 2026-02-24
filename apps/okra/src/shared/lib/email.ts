import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInvitationEmail(
  to: string,
  spaceName: string,
  inviteUrl: string,
) {
  await resend.emails.send({
    from: 'Okra <okra@no-reply.polymorph.co.kr>',
    to,
    subject: `${spaceName} 스페이스에 초대되었습니다`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h2 style="margin-bottom: 16px;">${spaceName} 스페이스 초대</h2>
        <p style="color: #555; line-height: 1.6;">
          팀원이 <strong>${spaceName}</strong> 스페이스에 초대했습니다.
          아래 버튼을 클릭하여 참여하세요.
        </p>
        <a
          href="${inviteUrl}"
          style="display: inline-block; margin-top: 24px; padding: 12px 24px; background-color: #18181b; color: #fff; text-decoration: none; border-radius: 4px;"
        >
          초대 수락하기
        </a>
        <p style="margin-top: 32px; font-size: 12px; color: #999;">
          이 링크는 7일 후 만료됩니다. 본인이 요청하지 않은 초대라면 이 이메일을 무시하세요.
        </p>
      </div>
    `,
  });
}
