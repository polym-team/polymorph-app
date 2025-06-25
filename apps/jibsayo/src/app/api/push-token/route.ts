import { NextRequest, NextResponse } from 'next/server';

import {
  CreatePushTokenRequest,
  PushTokenListResponse,
  PushTokenResponse,
} from './types';
import {
  findExistingToken,
  firestoreClient,
  mapFirestoreToPushToken,
  mapPushTokenToFirestore,
  validateDeviceId,
  validateToken,
} from './utils';

// GET - 디바이스의 푸시토큰 목록 조회
export async function GET(
  request: NextRequest
): Promise<NextResponse<PushTokenListResponse>> {
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

    // 디바이스의 모든 푸시토큰 조회
    const documents = await firestoreClient.getDocuments({
      where: [{ field: 'deviceId', operator: '==', value: deviceId }],
    });

    const tokens = documents.map(doc => mapFirestoreToPushToken(doc));

    return NextResponse.json({ success: true, data: tokens }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/push-token:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<PushTokenResponse>> {
  try {
    const body: CreatePushTokenRequest = await request.json();
    const { deviceId, token, os, osVersion, appVersion } = body;

    // 입력 유효성 검사
    if (!validateDeviceId(deviceId)) {
      return NextResponse.json(
        { success: false, error: '디바이스 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    if (!validateToken(token)) {
      return NextResponse.json(
        { success: false, error: '유효한 푸시 토큰이 필요합니다.' },
        { status: 400 }
      );
    }

    if (!os || !osVersion || !appVersion) {
      return NextResponse.json(
        { success: false, error: 'OS, OS 버전, 앱 버전 정보가 필요합니다.' },
        { status: 400 }
      );
    }

    // 기존 토큰이 있는지 확인
    const existingToken = await findExistingToken(deviceId);

    if (existingToken) {
      // 기존 토큰이 있으면 업데이트
      const updateData = {
        token,
        os,
        osVersion,
        appVersion,
        notificationsEnabled: true,
        updatedAt: new Date(),
      };

      const result = await firestoreClient.updateDocument(
        existingToken.id!,
        updateData
      );

      if (result.success) {
        const updatedToken = {
          ...existingToken,
          token,
          os,
          osVersion,
          appVersion,
          notificationsEnabled: true,
          updatedAt: new Date(),
        };

        return NextResponse.json(
          { success: true, data: updatedToken },
          { status: 200 }
        );
      } else {
        return NextResponse.json(
          { success: false, error: '토큰 업데이트에 실패했습니다.' },
          { status: 500 }
        );
      }
    } else {
      // 새 토큰 생성
      const tokenData = mapPushTokenToFirestore({
        deviceId,
        token,
        os,
        osVersion,
        appVersion,
        notificationsEnabled: true,
      });

      const result = await firestoreClient.createDocument(tokenData);

      if (result.success) {
        const newToken = {
          id: result.id,
          deviceId,
          token,
          os,
          osVersion,
          appVersion,
          notificationsEnabled: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        return NextResponse.json(
          { success: true, data: newToken },
          { status: 201 }
        );
      } else {
        return NextResponse.json(
          { success: false, error: '토큰 생성에 실패했습니다.' },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error('Error in POST /api/push-token:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
