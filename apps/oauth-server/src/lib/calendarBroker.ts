import { prisma } from './prisma';
import { decryptToken, encryptToken } from './tokenCrypto';
import { refreshCalendarAccessToken } from './googleCalendar';

/**
 * 캘린더 토큰 브로커 코어.
 *
 * 저장된 access token 이 유효하면 그대로, 만료(임박)면 refresh token 으로 갱신 후
 * 재암호화하여 저장한다. refresh token 은 이 모듈 밖으로 절대 반환하지 않는다.
 */

const EXPIRY_SKEW_MS = 60_000; // 만료 1분 전이면 선제 갱신

/**
 * userId 의 유효한 캘린더 access token 을 반환한다.
 * grant 가 없으면(= 캘린더 미연결) null. refresh 실패 시 throw.
 */
export async function getValidAccessToken(userId: string): Promise<string | null> {
  const grant = await prisma.googleCalendarGrant.findUnique({ where: { userId } });
  if (!grant || !grant.refreshToken) return null;

  const stillValid =
    grant.accessToken &&
    grant.accessTokenExpiresAt &&
    grant.accessTokenExpiresAt.getTime() - EXPIRY_SKEW_MS > Date.now();

  if (stillValid) {
    return decryptToken(grant.accessToken as string);
  }

  const refreshToken = decryptToken(grant.refreshToken);
  const { accessToken, expiresAt } = await refreshCalendarAccessToken(refreshToken);

  await prisma.googleCalendarGrant.update({
    where: { userId },
    data: {
      accessToken: encryptToken(accessToken),
      accessTokenExpiresAt: expiresAt,
    },
  });

  return accessToken;
}
