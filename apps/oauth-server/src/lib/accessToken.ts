import { prisma } from '@/lib/prisma';
import { generateToken } from '@polymorph/shared-auth';

/**
 * userId + clientId 로 access JWT 를 발급한다.
 * /api/token(fragment 흐름)과 /api/oauth/token(code 흐름)이 공유하는 클레임 산출 로직.
 * 사용자를 못 찾으면 null.
 */
export async function issueAccessToken(
  userId: string,
  clientId: string,
  accessTokenLifetime: number,
): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { accounts: { orderBy: { createdAt: 'desc' } } },
  });
  if (!user) return null;

  const provider = user.accounts[0]?.provider ?? 'unknown';
  const linkedEmails = Array.from(
    new Set(
      user.accounts
        .map((a) => a.email)
        .filter((e): e is string => !!e && !e.endsWith('@no-email.polymorph.co.kr')),
    ),
  );

  return generateToken({
    sub: user.id,
    email: user.email,
    name: user.name ?? undefined,
    provider,
    clientId,
    linkedEmails,
    expiresInSec: accessTokenLifetime,
  });
}
