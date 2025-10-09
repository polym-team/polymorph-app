import { createApartItemKey } from '@/shared/services/transactionService';

import { NextRequest, NextResponse } from 'next/server';

import { CreateFavoriteApartRequest, FavoriteApartResponse } from './types';
import {
  findExistingFavoriteApart,
  firestoreClient,
  mapFavoriteApartToFirestore,
  validateFavoriteApartData,
} from './utils';

// POST - 새로운 즐겨찾기 아파트 생성
export async function POST(
  request: NextRequest
): Promise<NextResponse<FavoriteApartResponse>> {
  try {
    const body: CreateFavoriteApartRequest = await request.json();
    const { deviceId, regionCode, address, apartName } = body;

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

    const id = createApartItemKey({
      regionCode,
      address,
      apartName,
    });

    // 이미 존재하는 즐겨찾기인지 확인
    const existingFavorite = await findExistingFavoriteApart(id, deviceId);

    if (existingFavorite) {
      return NextResponse.json(
        { success: false, error: '이미 즐겨찾기에 추가된 아파트입니다.' },
        { status: 409 }
      );
    }

    // 새 즐겨찾기 아파트 생성
    const favoriteApartData = mapFavoriteApartToFirestore({
      id,
      deviceId,
      regionCode,
      address,
      apartName,
    });

    const result = await firestoreClient.createDocument(favoriteApartData);

    if (result.success) {
      const newFavoriteApart = {
        id,
        deviceId,
        regionCode,
        address,
        apartName,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return NextResponse.json(
        { success: true, data: newFavoriteApart },
        { status: 201 }
      );
    } else {
      return NextResponse.json(
        { success: false, error: '즐겨찾기 생성에 실패했습니다.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in POST /api/favorite-apart:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
