import { query } from '@/app/api/shared/libs/database';
import { logger } from '@/app/api/shared/utils/logger';

import {
  APART_TYPE_MAP,
  BUILDED_TYPE_MAP,
  HEATING_TYPE_MAP,
  SALE_TYPE_MAP,
} from './consts';
import type { ApartByIdResponse } from './types';

interface ApartmentRow {
  region_code: string;
  apart_name: string;
  completion_year: number;
  dong: string;
  jibun_addr: string | null;
  doro_addr: string | null;
  apart_type: string | null;
  sale_type: string | null;
  heating_type: string | null;
  building_structure: string | null;
  building_count: number | null;
  constructor_company: string | null;
  developer_company: string | null;
  sale_household_count: number | null;
  total_household_count: number | null;
  rent_household_count: number | null;
  parking_count: number | null;
  ground_parking_count: number | null;
  underground_parking_count: number | null;
  ev_parking_count: number | null;
  max_floor: number | null;
  amenities: string | null;
}

const convertToResponse = (row: ApartmentRow): ApartByIdResponse => {
  return {
    regionCode: row.region_code,
    apartName: row.apart_name,
    buildYear: row.completion_year,
    dong: row.dong,
    apartType:
      APART_TYPE_MAP?.[row.apart_type as keyof typeof APART_TYPE_MAP] ?? null,
    saleType:
      SALE_TYPE_MAP?.[row.sale_type as keyof typeof SALE_TYPE_MAP] ?? null,
    heatingType:
      HEATING_TYPE_MAP?.[row.heating_type as keyof typeof HEATING_TYPE_MAP] ??
      null,
    buildedType:
      BUILDED_TYPE_MAP?.[
        row.building_structure as keyof typeof BUILDED_TYPE_MAP
      ] ?? null,
    buildingCount: row.building_count ?? null,
    constructorCompany: row.constructor_company ?? null,
    developerCompany: row.developer_company ?? null,
    saleHouseholdCount: row.sale_household_count ?? null,
    householdCount: row.total_household_count ?? null,
    rentHouseholdCount: row.rent_household_count ?? null,
    parkingCount: row.parking_count ?? null,
    groundParkingCount: row.ground_parking_count ?? null,
    undergroundParkingCount: row.underground_parking_count ?? null,
    electronicParkingCount: row.ev_parking_count ?? null,
    maxFloor: row.max_floor ?? null,
    amenities: row.amenities ? JSON.parse(row.amenities) : null,
  };
};

export const getApartByApartId = async (
  apartId: string
): Promise<ApartByIdResponse | null> => {
  try {
    const rows = await query<ApartmentRow[]>(
      `SELECT * FROM apartments
       WHERE id = ?`,
      [apartId]
    );

    if (!rows || rows.length === 0) {
      logger.warn('아파트 정보를 찾을 수 없음', { apartId });
      return null;
    }

    return convertToResponse(rows[0]);
  } catch (error) {
    logger.error('아파트 정보 조회 실패', {
      apartId,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
    });
    throw error;
  }
};
