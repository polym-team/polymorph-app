/**
 * 지역 코드 관리 서비스
 */
import { logger } from '@/app/api/shared/utils/logger';

/**
 * codes.json에서 서울/경기 지역코드 조회
 * @returns 69개 지역코드 배열
 */
export function getRegionCodes(): string[] {
  try {
    // eslint-disable-next-line global-require
    const regionData = require('@/entities/region/models/codes.json');
    const codes: string[] = [];

    (
      regionData as Array<{
        name: string;
        children: Array<{ code: string; name: string }>;
      }>
    ).forEach(group => {
      if (group.name === '서울시' || group.name === '경기도') {
        group.children.forEach(region => {
          codes.push(region.code);
        });
      }
    });

    logger.info('Loaded region codes', { count: codes.length });
    return codes;
  } catch (error) {
    logger.error('Failed to load region codes', {
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}
