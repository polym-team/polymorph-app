import { NextRequest, NextResponse } from 'next/server';

import { PushTokenResponse, UpdatePushTokenRequest } from '../types';
import {
  findExistingToken,
  firestoreClient as getFirestoreClient,
  validateDeviceId,
  validateToken,
} from '../utils';

// PUT - 푸시토큰 업데이트 (deviceId 기반)
export async function PUT(
  request: NextRequest,
  { params }: { params: { deviceId: string } }
): Promise<NextResponse<PushTokenResponse>> {
  try {
    const { deviceId } = params;
    const body: UpdatePushTokenRequest = await request.json();
    const { token, notificationsEnabled, os, osVersion, appVersion } = body;

    // 디바이스 ID 유효성 검사
    if (!deviceId || !validateDeviceId(deviceId)) {
      return NextResponse.json(
        { success: false, error: '유효한 디바이스 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 기존 토큰 조회
    const existingToken = await findExistingToken(deviceId);
    if (!existingToken) {
      return NextResponse.json(
        { success: false, error: '해당 디바이스의 토큰을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 업데이트할 데이터 준비
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (token !== undefined) {
      if (!validateToken(token)) {
        return NextResponse.json(
          { success: false, error: '유효한 푸시 토큰이 필요합니다.' },
          { status: 400 }
        );
      }
      updateData.token = token;
    }

    if (notificationsEnabled !== undefined) {
      updateData.notificationsEnabled = notificationsEnabled;
    }

    if (os !== undefined) {
      updateData.os = os;
    }

    if (osVersion !== undefined) {
      updateData.osVersion = osVersion;
    }

    if (appVersion !== undefined) {
      updateData.appVersion = appVersion;
    }

    // 토큰 업데이트
    const result = await getFirestoreClient().updateDocument(
      existingToken.id!,
      updateData
    );

    if (result.success) {
      const updatedToken = {
        ...existingToken,
        ...updateData,
        updatedAt: updateData.updatedAt,
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
  } catch (error) {
    console.error('Error in PUT /api/push-token/[deviceId]:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE - 푸시토큰 삭제 (deviceId 기반)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { deviceId: string } }
): Promise<NextResponse<PushTokenResponse>> {
  try {
    const { deviceId } = params;

    // 디바이스 ID 유효성 검사
    if (!deviceId || !validateDeviceId(deviceId)) {
      return NextResponse.json(
        { success: false, error: '유효한 디바이스 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 기존 토큰 조회
    const existingToken = await findExistingToken(deviceId);
    if (!existingToken) {
      return NextResponse.json(
        { success: false, error: '해당 디바이스의 토큰을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 토큰 삭제
    const result = await getFirestoreClient().deleteDocument(existingToken.id!);

    if (result.success) {
      return NextResponse.json(
        { success: true, data: existingToken },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { success: false, error: '토큰 삭제에 실패했습니다.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in DELETE /api/push-token/[deviceId]:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
