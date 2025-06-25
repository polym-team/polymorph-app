export interface PushToken {
  id?: string;
  deviceId: string;
  token: string;
  os: string;
  osVersion: string;
  appVersion: string;
  notificationsEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePushTokenRequest {
  deviceId: string;
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
