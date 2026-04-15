import { logger } from '@/app/api/shared/utils/logger';

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateToken, TOKEN_COOKIE } from '@polymorph/shared-auth';

import { firestoreClient } from './services/fireStoreService';
import {
  findExistingFavoriteApart,
  mapFavoriteApartToFirestore,
  validatePostRequestData,
} from './services/validatorService';
import { addFavoriteForUser } from './services/userBasedService';
import {
  CreateFavoriteApartRequest,
  FavoriteApart,
  FavoriteApartResponse,
} from './types';

// POST - 즐겨찾기 아파트 추가
// 1) 로그인 유저(웹): JWT 기반으로 DB 저장
// 2) 웹뷰(레거시): deviceId 기반 Firestore 저장
//    TODO: 네이티브 앱 출시 후 oauth 통합 재검토
export async function POST(
  request: NextRequest
): Promise<NextResponse<FavoriteApartResponse>> {
  try {
    const body: CreateFavoriteApartRequest = await request.json();
    const { apartToken, regionCode, apartName } = body;

    if (!apartToken || !regionCode || !apartName) {
      return NextResponse.json(
        { success: false, error: '필수 파라미터가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 1. JWT 쿠키 확인 (웹 로그인 유저 우선)
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_COOKIE)?.value;
    if (token) {
      const result = await validateToken(token);
      if (result.valid && result.payload) {
        await addFavoriteForUser(result.payload.sub, {
          apartId: Number(apartToken),
          regionCode,
          apartName,
        });
        return NextResponse.json(
          {
            success: true,
            data: {
              apartToken,
              deviceId: '',
              regionCode,
              apartName,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
          { status: 201 }
        );
      }
    }

    // 2. 웹뷰 레거시 (deviceId 기반 Firestore)
    const { deviceId } = body;
    const validation = validatePostRequestData({
      deviceId,
      apartToken,
      regionCode,
      apartName,
    });

    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.error ?? '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const existingFavorite = await findExistingFavoriteApart(apartToken, deviceId);
    if (existingFavorite) {
      return NextResponse.json(
        { success: false, error: '이미 즐겨찾기에 추가된 아파트입니다.' },
        { status: 409 }
      );
    }

    const favoriteApartData = mapFavoriteApartToFirestore({
      deviceId,
      apartToken,
      regionCode,
      apartName,
    });
    const result = await firestoreClient.createDocument(favoriteApartData);

    if (result.success) {
      const newFavoriteApart: FavoriteApart = {
        apartToken,
        deviceId,
        regionCode,
        apartName,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return NextResponse.json({ success: true, data: newFavoriteApart }, { status: 201 });
    }
    return NextResponse.json(
      { success: false, error: '즐겨찾기 생성에 실패했습니다.' },
      { status: 500 }
    );
  } catch (error) {
    logger.error('즐겨찾기 아파트 생성 실패:', { error });
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
