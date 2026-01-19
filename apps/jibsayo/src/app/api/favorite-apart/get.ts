import { NextRequest, NextResponse } from 'next/server';

import { FavoriteApartListResponse } from './types';
import { firestoreClient } from './services/fireStoreService';
import { mapFirestoreToFavoriteApart } from './services/mapperService';
import { validateDeviceId } from './services/validatorService';

// GET - 디바이스의 즐겨찾기 아파트 목록 조회
export async function GET(
  request: NextRequest
): Promise<NextResponse<FavoriteApartListResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');

    // 디바이스 ID 유효성 검사
    if (!deviceId || !validateDeviceId(deviceId)) {
      return NextResponse.json(
        { success: false, error: '유효한 디바이스 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 디바이스의 모든 즐겨찾기 아파트 조회
    const documents = await firestoreClient().getDocuments({
      where: [{ field: 'deviceId', operator: '==', value: deviceId }],
    });

    const favoriteAparts = documents.map((doc: any) =>
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
