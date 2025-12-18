import { NextRequest } from 'next/server';

import { getApartmentsByName } from './service';

export async function GET(
  _: NextRequest,
  { params }: { params: { apartName: string } }
) {
  const { apartName } = params;

  if (!apartName) {
    return Response.json(
      { message: 'apartName이 필요합니다.' },
      { status: 400 }
    );
  }

  try {
    const apartments = await getApartmentsByName(decodeURIComponent(apartName));
    return Response.json(apartments);
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
