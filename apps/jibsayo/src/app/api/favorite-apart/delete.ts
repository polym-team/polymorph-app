import { logger } from '@/app/api/shared/utils/logger';

import { NextRequest, NextResponse } from 'next/server';

import { DeleteFavoriteApartResponse } from './types';
import { firestoreClient } from './services/fireStoreService';
import {
  findExistingFavoriteApart,
  validateDeleteRequestData,
} from './services/validatorService';

// DELETE - 즐겨찾기 아파트 삭제
export async function DELETE(
  request: NextRequest
): Promise<NextResponse<DeleteFavoriteApartResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId') ?? '';
    const apartId = searchParams.get('apartId') ?? '';

    // 필수 파라미터 검사
    if (!deviceId || !apartId) {
      return NextResponse.json(
        {
          success: false,
          error: '디바이스 ID, 아파트 ID가 모두 필요합니다.',
        },
        { status: 400 }
      );
    }

    // 입력 유효성 검사
    const validation = validateDeleteRequestData({
      deviceId,
      apartId,
    });

    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // 삭제할 즐겨찾기 찾기
    const existingFavorite = await findExistingFavoriteApart(apartId, deviceId);

    if (!existingFavorite || !existingFavorite.id) {
      return NextResponse.json(
        { success: false, error: '해당 즐겨찾기를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 즐겨찾기 삭제
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
