import { crawlNewTransactions } from './services/crawl';
import {
  getCachedTransactions,
  saveCachedTransactions,
} from './services/fireStore';

// 동적 라우트로 설정 (정적 빌드 시 request.url 사용으로 인한 오류 방지)
export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const area = searchParams.get('area');

    if (!area) {
      return Response.json(
        { message: '필수 파라미터가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 캐시 확인: Firestore에서 캐시된 데이터 조회
    const cachedData = await getCachedTransactions(area);
    if (cachedData) {
      return Response.json(cachedData.data);
    }

    // 캐시가 없거나 만료된 경우 크롤링 수행
    const result = await crawlNewTransactions(area);

    // 크롤링 완료 후 Firestore에 캐시 저장
    await saveCachedTransactions(area, result);

    return Response.json(result);
  } catch (error) {
    console.error('크롤링 오류:', error);
    return Response.json(
      {
        message: '서버 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      },
      { status: 500 }
    );
  }
}
