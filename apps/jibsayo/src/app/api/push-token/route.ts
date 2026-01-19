import { NextRequest, NextResponse } from 'next/server';

import {
  CreatePushTokenRequest,
  PushTokenListResponse,
  PushTokenResponse,
} from './types';
import {
  findExistingToken,
  firestoreClient as getFirestoreClient,
  mapFirestoreToPushToken,
  mapPushTokenToFirestore,
  validateDeviceId,
  validateToken,
} from './utils';

// 동적 라우트로 설정 (정적 빌드 시 request.url 사용으로 인한 오류 방지)
export const dynamic = 'force-dynamic';

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

    // 디바이스의 푸시토큰 조회 (문서 ID로 직접 조회)
    const document = await getFirestoreClient().getDocument(deviceId);

    if (document) {
      const token = mapFirestoreToPushToken(document);
      return NextResponse.json(
        { success: true, data: [token] },
        { status: 200 }
      );
    } else {
      return NextResponse.json({ success: true, data: [] }, { status: 200 });
    }
  } catch (error) {
    console.error('Error in GET /api/push-token:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE - 디바이스의 푸시토큰 삭제
export async function DELETE(
  request: NextRequest
): Promise<NextResponse<{ success: boolean; error?: string }>> {
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

    // 기존 토큰이 있는지 확인
    const existingToken = await findExistingToken(deviceId);

    if (!existingToken) {
      return NextResponse.json(
        { success: false, error: '삭제할 토큰을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 토큰 삭제 (문서 ID로 삭제)
    const result = await getFirestoreClient().deleteDocument(deviceId);

    if (result.success) {
      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      return NextResponse.json(
        { success: false, error: '토큰 삭제에 실패했습니다.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in DELETE /api/push-token:', error);
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
      // 기존 토큰이 있으면 업데이트 (문서 ID로 업데이트)
      const updateData = {
        token,
        os,
        osVersion,
        appVersion,
        notificationsEnabled: true,
        updatedAt: new Date(),
      };

      const result = await getFirestoreClient().updateDocument(
        deviceId, // deviceId를 문서 ID로 사용
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
      // 새 토큰 생성 (deviceId를 문서 ID로 사용)
      const tokenData = mapPushTokenToFirestore({
        deviceId,
        token,
        os,
        osVersion,
        appVersion,
        notificationsEnabled: true,
      });

      const result = await getFirestoreClient().createDocumentWithId(
        deviceId, // deviceId를 문서 ID로 사용
        tokenData
      );

      if (result.success) {
        const newToken = {
          id: deviceId, // deviceId를 ID로 사용
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
