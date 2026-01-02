import { query } from '@/app/api/shared/libs/database';
import { logger } from '@/app/api/shared/utils/logger';

import type { ApartmentsByNameResponse } from './types';

interface ApartmentRow {
  id: number;
  apart_name: string;
  total_household_count: number | null;
  completion_year: number | null;
  region_code: string;
  dong: string;
  jibun_addr: string;
  doro_addr: string;
}

const buildOrderByClause = (keywords: string[]): string => {
  const allInApartName = keywords
    .map(k => `apart_name LIKE '%${k}%'`)
    .join(' AND ');

  const scoreCalculation = `
    CASE WHEN ${allInApartName} THEN 1000 ELSE 0 END +
    ${keywords.map(k => `CASE WHEN apart_name LIKE '%${k}%' THEN 10 ELSE 0 END`).join(' + ')} +
    ${keywords.map(k => `CASE WHEN dong LIKE '%${k}%' THEN 5 ELSE 0 END`).join(' + ')} +
    ${keywords.map(k => `CASE WHEN jibun_addr LIKE '%${k}%' THEN 3 ELSE 0 END`).join(' + ')} +
    ${keywords.map(k => `CASE WHEN doro_addr LIKE '%${k}%' THEN 3 ELSE 0 END`).join(' + ')}
  `.trim();

  return `ORDER BY (${scoreCalculation}) DESC, apart_name ASC`;
};

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

    const likeConditions = keywords
      .map(() => '(apart_name LIKE ? OR dong LIKE ? OR jibun_addr LIKE ? OR doro_addr LIKE ?)')
      .join(' AND ');

    const likeParams: string[] = [];
    keywords.forEach(keyword => {
      likeParams.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    });

    const orderByClause = buildOrderByClause(keywords);

    const rows = await query<ApartmentRow[]>(
      `SELECT
        id,
        apart_name,
        total_household_count,
        completion_year,
        region_code,
        dong,
        jibun_addr,
        doro_addr
       FROM apartments
       WHERE ${likeConditions}
       ${orderByClause}
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
