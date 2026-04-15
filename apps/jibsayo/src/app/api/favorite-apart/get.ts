import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateToken, TOKEN_COOKIE } from '@polymorph/shared-auth';

import { FavoriteApartListResponse } from './types';
import { firestoreClient } from './services/fireStoreService';
import { mapFirestoreToFavoriteApart } from './services/mapperService';
import { validateDeviceId } from './services/validatorService';
import { getFavoritesByUser } from './services/userBasedService';

// GET - 즐겨찾기 목록 조회
// 1) 로그인 유저(웹): JWT 쿠키 기반으로 DB 조회
// 2) 웹뷰(레거시): deviceId 쿼리 기반으로 Firestore 조회
//    TODO: 네이티브 앱 출시 후 oauth 통합 재검토. 현재는 deviceId 기반 레거시 유지
export async function GET(
  request: NextRequest
): Promise<NextResponse<FavoriteApartListResponse>> {
  try {
    // 1. JWT 쿠키 확인 (웹 로그인 유저 우선)
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_COOKIE)?.value;
    if (token) {
      const result = await validateToken(token);
      if (result.valid && result.payload) {
        const items = await getFavoritesByUser(result.payload.sub);
        return NextResponse.json(
          {
            success: true,
            data: items.map(i => ({
              apartToken: String(i.apartId),
              apartName: i.apartName,
              regionCode: i.regionCode,
              deviceId: '',
              createdAt: new Date(),
              updatedAt: new Date(),
            })),
          },
          { status: 200 }
        );
      }
    }

    // 2. 웹뷰 레거시 (deviceId 기반)
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');

    if (!deviceId || !validateDeviceId(deviceId)) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const documents = await firestoreClient.getDocuments({
      where: [{ field: 'deviceId', operator: '==', value: deviceId }],
    });
    const favoriteAparts = documents.map((doc: unknown) =>
      mapFirestoreToFavoriteApart(doc)
    );

    return NextResponse.json(
      { success: true, data: favoriteAparts },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
