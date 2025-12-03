import { logger } from '@/app/api/shared/utils/logger';
import { ROUTE_PATH } from '@/shared/consts/route';
import { ExpoPushNotificationClient } from '@polymorph/firebase';

import { mapFirestoreToFavoriteApart } from '../../favorite-apart/services/mapperService';
import { FavoriteApart } from '../../favorite-apart/types';
import {
  createApartId,
  parseTransactionId,
} from '../../shared/services/transaction/service';
import { NewTransactionItem, PushNotificationItem } from '../types';
import {
  favoriteApartFirestoreClient,
  pushTokenFirestoreClient,
} from './fireStoreService';

const expoPushClient = new ExpoPushNotificationClient();

const getNewTransactionsByArea = async (
  area: string,
  date: string
): Promise<NewTransactionItem[]> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/new-transactions?area=${area}&date=${date}`,
      {
        cache: 'no-store',
        headers: { 'User-Agent': 'Internal-API-Call' },
      }
    );
    const data = await response.json();
    logger.info(`${area} 지역의 신규 거래 데이터`, {
      area,
      date,
      count: data.count,
    });

    // transactionIds를 NewTransactionItem[]으로 변환
    const transactionIds: string[] = data.transactionIds || [];
    const transactions: NewTransactionItem[] = transactionIds
      .map(id => {
        const parsed = parseTransactionId(id);
        if (!parsed) return null;

        return {
          transactionId: id,
          apartId: parsed.apartId,
          apartName: parsed.apartName,
          buildedYear: null, // transactionId에는 buildedYear 정보가 없음
          address: parsed.address,
          tradeDate: parsed.tradeDate,
          size: parsed.size ?? null,
          floor: parsed.floor,
          tradeAmount: parsed.tradeAmount,
        } as NewTransactionItem;
      })
      .filter((tx): tx is NewTransactionItem => tx !== null);

    return transactions;
  } catch (error) {
    logger.error('신규 거래 데이터 조회 실패', { area, date, error });
    return [];
  }
};

const validateToken = (token: string): boolean => {
  // 기본 검증
  if (!token || token.length === 0) {
    return false;
  }

  // Exponent Push Token 검증
  if (token.startsWith('ExponentPushToken[') && token.endsWith(']')) {
    const tokenContent = token.slice(18, -1); // ExponentPushToken[...] 안의 내용
    if (tokenContent.length >= 20) {
      return true;
    } else {
      return false;
    }
  }

  // Firebase FCM 토큰 검증
  if (token.length >= 140) {
    return true;
  }

  // 테스트/더미 토큰인지 확인
  if (
    token.includes('example') ||
    token.includes('test') ||
    token.includes('dummy')
  ) {
    return false;
  }

  return false;
};

const sendPushNotification = async (
  deviceId: string,
  transactionCount: number,
  regionCode: string,
  apartName: string
): Promise<boolean> => {
  try {
    const pushTitle = '새로운 아파트 거래';
    const pushBody = `${apartName} 아파트에 ${transactionCount}건의 신규 거래가 있습니다.`;
    const pushData = {
      action: 'gotoUrl',
      screen: 'modal',
      tabName: 'saved',
      url: `https://jibsayo.vercel.app/${ROUTE_PATH.APART}?regionCode=${regionCode}&apartName=${apartName}`,
    };

    // Firestore에서 토큰 조회 (문서 ID로 직접 조회)
    const tokenDoc = await pushTokenFirestoreClient.getDocument(deviceId);
    const token = tokenDoc?.data?.token;

    if (!token) {
      logger.error(`토큰 획득 실패`, { deviceId });
      return false;
    }

    // 토큰 유효성 검사
    if (!validateToken(token)) {
      logger.error(`유효하지 않은 토큰`, { deviceId, token });
      return false;
    }

    // Expo Push Notification Service를 사용하여 전송
    const result = await expoPushClient.sendToDevice(token, {
      title: pushTitle,
      body: pushBody,
      data: pushData,
    });

    if (result.success) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    logger.error('푸시 알림 전송 실패', { deviceId, error });
    return false;
  }
};

export const getFavoriteApartList = async (): Promise<FavoriteApart[]> => {
  try {
    const favoriteDocuments = await favoriteApartFirestoreClient.getDocuments(
      {}
    );
    return favoriteDocuments.map(doc => mapFirestoreToFavoriteApart(doc));
  } catch (error) {
    logger.error('즐겨찾기 아파트 목록 조회 실패', { error });
    return [];
  }
};

export const removeDuplicateRegionCodesInFavoriteApartList = (
  favoriteAparts: FavoriteApart[]
): string[] => {
  return Array.from(new Set(favoriteAparts.map(fav => fav.regionCode)));
};

export const getAllNewTransactions = async (
  regionCodes: string[],
  date: string
): Promise<NewTransactionItem[]> => {
  // 모든 regionCode를 병렬로 처리하여 실행 시간 단축
  const results = await Promise.allSettled(
    regionCodes.map(regionCode => getNewTransactionsByArea(regionCode, date))
  );

  // 성공한 결과만 필터링하고 평탄화
  return results
    .filter(result => result.status === 'fulfilled')
    .flatMap(result => result.value);
};

export const getPushNotifications = async (
  allTransactions: NewTransactionItem[],
  favoriteAparts: FavoriteApart[]
): Promise<PushNotificationItem[]> => {
  const pushNotifications: PushNotificationItem[] = [];
  const sentSet = new Set<string>();

  for (const favorite of favoriteAparts) {
    const key = `${favorite.deviceId}|${favorite.apartName}`;
    if (sentSet.has(key)) continue;

    const matchedTransactions = allTransactions.filter(transaction => {
      const favoriteApartId = createApartId({
        regionCode: favorite.regionCode,
        address: favorite.address,
        apartName: favorite.apartName,
      });
      return transaction.apartId === favoriteApartId;
    });

    if (matchedTransactions.length > 0) {
      pushNotifications.push({
        deviceId: favorite.deviceId,
        apartName: favorite.apartName,
        regionCode: favorite.regionCode,
        transactionCount: matchedTransactions.length,
        transactions: matchedTransactions,
      });
      sentSet.add(key);
    }
  }

  return pushNotifications;
};

export const sendPushNotifications = async (
  pushNotifications: PushNotificationItem[]
): Promise<{ successCount: number; failureCount: number }> => {
  const pushResults = await Promise.allSettled(
    pushNotifications.map(async pushData => {
      const success = await sendPushNotification(
        pushData.deviceId,
        pushData.transactionCount,
        pushData.regionCode,
        pushData.apartName
      );

      return {
        success,
        deviceId: pushData.deviceId,
        regionCode: pushData.regionCode,
        apartName: pushData.apartName,
      };
    })
  );

  const successCount = pushResults.filter(
    result => result.status === 'fulfilled' && result.value.success
  ).length;

  const failureCount = pushNotifications.length - successCount;

  return {
    successCount,
    failureCount,
  };
};
