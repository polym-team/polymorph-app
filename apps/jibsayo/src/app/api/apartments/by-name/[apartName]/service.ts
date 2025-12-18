import { query } from '@/app/api/shared/libs/database';
import { logger } from '@/app/api/shared/utils/logger';

import type { ApartmentsByNameResponse } from './types';

interface ApartmentRow {
  id: number;
  apart_name: string;
  total_household_count: number | null;
  completion_year: number;
  region_code: string;
  dong: string;
}

export const getApartmentsByName = async (
  apartName: string
): Promise<ApartmentsByNameResponse> => {
  try {
    let keywords: string[] = [];
    const trimmed = apartName.trim();

    if (trimmed.includes(' ')) {
      keywords = trimmed.split(/\s+/).filter(k => k.length > 0);
    } else {
      for (let i = 0; i < trimmed.length; i += 2) {
        const chunk = trimmed.substring(i, i + 2);
        if (chunk.length >= 2) {
          keywords.push(chunk);
        }
      }
    }

    if (keywords.length === 0) {
      return [];
    }

    const likeConditions = keywords.map(() => 'apart_name LIKE ?').join(' AND ');
    const likeParams = keywords.map(keyword => `%${keyword}%`);

    const rows = await query<ApartmentRow[]>(
      `SELECT
        id,
        apart_name,
        total_household_count,
        completion_year,
        region_code,
        dong
       FROM apartments
       WHERE ${likeConditions}
       ORDER BY apart_name
       LIMIT 15`,
      likeParams
    );

    return rows.map(row => ({
      id: row.id,
      apartName: row.apart_name,
      householdCount: row.total_household_count,
      completionYear: row.completion_year,
      regionCode: row.region_code,
      dong: row.dong,
    }));
  } catch (error) {
    logger.error('아파트 이름 검색 실패', {
      apartName,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
    });
    throw error;
  }
};
