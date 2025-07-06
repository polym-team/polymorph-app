export interface PushToken {
  id?: string; // 문서 ID (deviceId와 동일)
  token: string;
  os: string;
  osVersion: string;
  appVersion: string;
  notificationsEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePushTokenRequest {
  deviceId: string; // URL 파라미터나 문서 ID로 사용
  token: string;
  os: string;
  osVersion: string;
  appVersion: string;
}

export interface UpdatePushTokenRequest {
  token?: string;
  notificationsEnabled?: boolean;
  os?: string;
  osVersion?: string;
  appVersion?: string;
}

export interface PushTokenResponse {
  success: boolean;
  data?: PushToken;
  error?: string;
}

export interface PushTokenListResponse {
  success: boolean;
  data?: PushToken[];
  error?: string;
}
