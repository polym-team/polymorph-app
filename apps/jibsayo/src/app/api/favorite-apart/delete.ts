import { logger } from '@/app/api/shared/utils/logger';

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateToken, TOKEN_COOKIE } from '@polymorph/shared-auth';

import { firestoreClient } from './services/fireStoreService';
import {
  findExistingFavoriteApart,
  validateDeleteRequestData,
} from './services/validatorService';
import { removeFavoriteForUser } from './services/userBasedService';
import { DeleteFavoriteApartResponse } from './types';

// DELETE - 즐겨찾기 아파트 삭제
// 1) 로그인 유저(웹): JWT 기반으로 DB 삭제
// 2) 웹뷰(레거시): deviceId 기반 Firestore 삭제
//    TODO: 네이티브 앱 출시 후 oauth 통합 재검토
export async function DELETE(
  request: NextRequest
): Promise<NextResponse<DeleteFavoriteApartResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const apartToken = searchParams.get('apartToken') ?? '';

    if (!apartToken) {
      return NextResponse.json(
        { success: false, error: '아파트 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 1. JWT 쿠키 확인
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_COOKIE)?.value;
    if (token) {
      const result = await validateToken(token);
      if (result.valid && result.payload) {
        await removeFavoriteForUser(result.payload.sub, Number(apartToken));
        return NextResponse.json({ success: true }, { status: 200 });
      }
    }

    // 2. 웹뷰 레거시
    const deviceId = searchParams.get('deviceId') ?? '';
    const validation = validateDeleteRequestData({ deviceId, apartToken });
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.error ?? '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const existingFavorite = await findExistingFavoriteApart(apartToken, deviceId);
    if (!existingFavorite || !existingFavorite.id) {
      return NextResponse.json(
        { success: false, error: '해당 즐겨찾기를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const result = await firestoreClient.deleteDocument(existingFavorite.id);
    if (result.success) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    return NextResponse.json(
      { success: false, error: '즐겨찾기 삭제에 실패했습니다.' },
      { status: 500 }
    );
  } catch (error) {
    logger.error('즐겨찾기 아파트 삭제 실패:', { error });
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
