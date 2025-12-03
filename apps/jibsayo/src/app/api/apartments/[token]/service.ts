import { COLLECTIONS } from '@/app/api/shared/consts/firestoreCollection';
import { getFirestoreClient } from '@/app/api/shared/libs/fireStore';
import { logger } from '@/app/api/shared/utils/logger';

import {
  APART_TYPE_MAP,
  BUILDED_TYPE_MAP,
  HEATING_TYPE_MAP,
  SALE_TYPE_MAP,
} from './consts';
import type { ApartByIdResponse } from './types';

const convertToResponse = (doc: any): ApartByIdResponse => {
  return {
    regionCode: doc.data.regionCode,
    apartName: doc.data.apartName,
    buildYear: doc.data.buildYear,
    dong: doc.data.dong,
    doro: doc.data.doro ?? null,
    apartType:
      APART_TYPE_MAP?.[doc.data.apartType as keyof typeof APART_TYPE_MAP] ??
      null,
    saleType:
      SALE_TYPE_MAP?.[doc.data.saleType as keyof typeof SALE_TYPE_MAP] ?? null,
    heatingType:
      HEATING_TYPE_MAP?.[
        doc.data.heatingType as keyof typeof HEATING_TYPE_MAP
      ] ?? null,
    buildedType:
      BUILDED_TYPE_MAP?.[
        doc.data.buildedType as keyof typeof BUILDED_TYPE_MAP
      ] ?? null,
    buildingCount: doc.data.buildingCount ?? null,
    constructorCompany: doc.data.constructorCompany ?? null,
    developerCompany: doc.data.developerCompany ?? null,
    saleHouseholdCount: doc.data.saleHouseholdCount ?? null,
    householdCount: doc.data.householdCount ?? null,
    rentHouseholdCount: doc.data.rentHouseholdCount ?? null,
    parkingCount: doc.data.parkingCount ?? null,
    groundParkingCount: doc.data.groundParkingCount ?? null,
    undergroundParkingCount: doc.data.undergroundParkingCount ?? null,
    electronicParkingCount: doc.data.electronicParkingCount ?? null,
    maxFloor: doc.data.maxFloor ?? null,
    amenities: doc.data.amenities ?? null,
  };
};

export const getApartByApartToken = async (
  apartToken: string
): Promise<ApartByIdResponse | null> => {
  try {
    const firestoreClient = getFirestoreClient(COLLECTIONS.APARTMENTS);
    const document = await firestoreClient.getDocument(apartToken);

    if (!document) {
      logger.warn('아파트 정보를 찾을 수 없음', { apartToken });
      return null;
    }

    return convertToResponse(document);
  } catch (error) {
    logger.error('아파트 정보 조회 실패', {
      apartToken,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
    });
    throw error;
  }
};
