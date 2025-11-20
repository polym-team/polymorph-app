import { logger } from '@/app/api/shared/utils/logger';

import { NextRequest, NextResponse } from 'next/server';

import {
  getAllNewTransactions,
  getFavoriteApartList,
  getPushNotifications,
  removeDuplicateRegionCodesInFavoriteApartList,
  sendPushNotifications,
} from './services/transactionService';
import {
  validateRateLimit,
  validateUserAgent,
} from './services/validatorService';

export async function GET(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || '';

  // 0. User-Agent 검증
  if (!validateUserAgent(userAgent)) {
    logger.error('잘못된 User-Agent', { userAgent });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 1. 호출 제한 검증
  if (!(await validateRateLimit())) {
    logger.error('오늘 이미 호출되었습니다.', { userAgent });
    return NextResponse.json(
      {
        success: false,
        message: '오늘 이미 호출되었습니다.',
        scrapedAt: new Date().toISOString(),
      },
      { status: 429 }
    );
  }

  // 2. Firestore에서 모든 favorite-apart 데이터 가져오기
  const favoriteAparts = await getFavoriteApartList();
  if (favoriteAparts.length === 0) {
    logger.info('즐겨찾기된 아파트가 없습니다.');
    return NextResponse.json({
      success: true,
      message: '즐겨찾기된 아파트가 없습니다.',
      pushNotifications: [],
    });
  }
  logger.info(`즐겨찾기 아파트 발견`, { favoriteAparts });

  // 3. regionCode 목록 취합 (중복 제거)
  const uniqueRegionCodes =
    removeDuplicateRegionCodesInFavoriteApartList(favoriteAparts);
  logger.info('크롤링할 지역 코드', { uniqueRegionCodes });

  // 4. 각 regionCode별로 신규 거래 데이터 가져오기
  const today = new Date().toISOString().split('T')[0];
  const allTransactions = await getAllNewTransactions(uniqueRegionCodes, today);
  if (allTransactions.length === 0) {
    logger.info('신규 거래 데이터가 없습니다.');
    return NextResponse.json({
      success: true,
      message: '신규 거래 데이터가 없습니다.',
      pushNotifications: [],
    });
  }
  logger.info('총 신규 거래 데이터', { allTransactions });

  // 5. 푸시 알림 데이터 생성
  const pushNotifications = await getPushNotifications(
    allTransactions,
    favoriteAparts
  );
  if (pushNotifications.length === 0) {
    logger.info('푸시 알림 데이터가 없습니다.');
    return NextResponse.json({
      success: true,
      message: '푸시 알림 데이터가 없습니다.',
      pushNotifications: [],
    });
  }
  logger.info('푸시 알림 데이터', { pushNotifications });

  // 6. 푸시 알림 전송
  const pushResults = await sendPushNotifications(pushNotifications);
  logger.info('푸시 알림 전송 결과', { pushResults });

  return NextResponse.json({
    success: true,
    message: '푸시 알림 전송이 완료되었습니다.',
    pushResults,
  });
}
