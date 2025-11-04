import { createResponse } from './services/crawl';

// 동적 라우트로 설정 (정적 빌드 시 request.url 사용으로 인한 오류 방지)
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const apartName = searchParams.get('apartName');
  const area = searchParams.get('area');

  if (!apartName || !area) {
    return Response.json(
      { message: '필수 파라미터(apartName, area)가 누락되었습니다.' },
      { status: 400 }
    );
  }

  try {
    const result = await createResponse(apartName, area);
    return Response.json(result);
  } catch {
    return Response.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
