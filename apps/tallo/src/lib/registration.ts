import { prisma } from './prisma';

export const REGISTRATION_TTL_MS = 10 * 60 * 1000; // 10분

export const RegStatus = {
  awaitingOtp: 'awaiting_otp',
  verified: 'verified',
  expired: 'expired',
  canceled: 'canceled',
} as const;

/**
 * 특정 번호의 만료된 awaiting_otp 세션을 expired로 정리(lazy sweep).
 * 상호배제 판정·조회 전에 호출해 끊긴 세션이 잠금을 붙잡지 않게 한다.
 */
export async function expireStaleSessions(phoneNumber?: string): Promise<void> {
  await prisma.registrationSession.updateMany({
    where: {
      status: RegStatus.awaitingOtp,
      expiresAt: { lt: new Date() },
      ...(phoneNumber ? { phoneNumber } : {}),
    },
    data: { status: RegStatus.expired },
  });
}

/** 세션이 아직 유효한(awaiting_otp & 미만료) 상태인지. */
export function isActive(session: { status: string; expiresAt: Date }): boolean {
  return session.status === RegStatus.awaitingOtp && session.expiresAt.getTime() > Date.now();
}
