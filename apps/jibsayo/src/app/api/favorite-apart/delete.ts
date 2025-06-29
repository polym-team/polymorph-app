import { NextRequest, NextResponse } from 'next/server';

import { DeleteFavoriteApartResponse } from './types';
import {
  findExistingFavoriteApart,
  firestoreClient,
  validateFavoriteApartData,
} from './utils';

// DELETE - 즐겨찾기 아파트 삭제
export async function DELETE(
  request: NextRequest
): Promise<NextResponse<DeleteFavoriteApartResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');
    const regionCode = searchParams.get('regionCode');
    const address = searchParams.get('address');
    const apartName = searchParams.get('apartName');

    // 필수 파라미터 검사
    if (!deviceId || !regionCode || !address || !apartName) {
      return NextResponse.json(
        {
          success: false,
          error: '디바이스 ID, 지역코드, 주소, 아파트명이 모두 필요합니다.',
        },
        { status: 400 }
      );
    }

    // 입력 유효성 검사
    const validation = validateFavoriteApartData({
      deviceId,
      regionCode,
      address,
      apartName,
    });

    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // 삭제할 즐겨찾기 찾기
    const existingFavorite = await findExistingFavoriteApart(
      deviceId,
      regionCode,
      address,
      apartName
    );

    if (!existingFavorite) {
      return NextResponse.json(
        { success: false, error: '해당 즐겨찾기를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 즐겨찾기 삭제
    const result = await firestoreClient.deleteDocument(existingFavorite.id!);

    if (result.success) {
      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      return NextResponse.json(
        { success: false, error: '즐겨찾기 삭제에 실패했습니다.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in DELETE /api/favorite-apart:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
