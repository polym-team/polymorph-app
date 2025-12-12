import { NextRequest } from 'next/server';

import { getApartByApartId } from './service';

export async function GET(
  _: NextRequest,
  { params }: { params: { apartId: string } }
) {
  const { apartId } = params;

  if (!apartId) {
    return Response.json({ message: 'apartId가 필요합니다.' }, { status: 400 });
  }

  try {
    const apart = await getApartByApartId(Number(apartId));

    if (!apart) {
      return Response.json(
        { message: '아파트 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return Response.json(apart);
  } catch (error) {
    return Response.json(
      {
        message: '서버 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      },
      { status: 500 }
    );
  }
}
