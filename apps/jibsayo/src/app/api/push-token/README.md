# 푸시 토큰 API

Firebase Admin SDK를 사용한 푸시 토큰 관리 API입니다.

## 엔드포인트

### POST `/api/push-token`

푸시 토큰을 등록하거나 업데이트합니다.

**요청 본문:**

```json
{
  "deviceId": "iphone-14-pro-max",
  "token": "fcm-token-ios-example-123456789",
  "os": "ios",
  "osVersion": "17.0",
  "appVersion": "1.0.0"
}
```

**curl 예시:**

```bash
curl -X POST https://jibsayo.vercel.app/api/push-token \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "iphone-14-pro-max",
    "token": "fcm-token-ios-example-123456789",
    "os": "ios",
    "osVersion": "17.0",
    "appVersion": "1.0.0"
  }'
```

**응답:**

```json
{
  "success": true,
  "data": {
    "id": "bdyq3jBfLIM2t1vTgB6O",
    "deviceId": "iphone-14-pro-max",
    "token": "fcm-token-ios-example-123456789",
    "os": "ios",
    "osVersion": "17.0",
    "appVersion": "1.0.0",
    "notificationsEnabled": true,
    "createdAt": "2025-06-25T07:53:01.104Z",
    "updatedAt": "2025-06-25T15:29:39.690Z"
  }
}
```

### GET `/api/push-token?deviceId={deviceId}`

특정 디바이스의 푸시 토큰을 조회합니다.

**curl 예시:**

```bash
curl "https://jibsayo.vercel.app/api/push-token?deviceId=iphone-14-pro-max"
```

**응답:**

```json
{
  "success": true,
  "data": [
    {
      "id": "bdyq3jBfLIM2t1vTgB6O",
      "deviceId": "iphone-14-pro-max",
      "token": "fcm-token-ios-example-123456789",
      "os": "ios",
      "osVersion": "17.0",
      "appVersion": "1.0.0",
      "notificationsEnabled": true,
      "createdAt": "2025-06-25T07:53:01.104Z",
      "updatedAt": "2025-06-25T15:29:39.690Z"
    }
  ]
}
```

## JavaScript/TypeScript 예시

### Fetch API 사용

```javascript
// 토큰 등록/업데이트
const registerToken = async tokenData => {
  const response = await fetch('https://jibsayo.vercel.app/api/push-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tokenData),
  });
  return await response.json();
};

// 토큰 조회
const getTokens = async deviceId => {
  const response = await fetch(
    `https://jibsayo.vercel.app/api/push-token?deviceId=${deviceId}`
  );
  return await response.json();
};

// 사용 예시
const tokenData = {
  deviceId: 'iphone-14-pro-max',
  token: 'fcm-token-ios-example-123456789',
  os: 'ios',
  osVersion: '17.0',
  appVersion: '1.0.0',
};

// 토큰 등록
const result = await registerToken(tokenData);
console.log(result);

// 토큰 조회
const tokens = await getTokens('iphone-14-pro-max');
console.log(tokens);
```

### Axios 사용

```javascript
import axios from 'axios';

// 토큰 등록/업데이트
const registerToken = async tokenData => {
  const response = await axios.post(
    'https://jibsayo.vercel.app/api/push-token',
    tokenData
  );
  return response.data;
};

// 토큰 조회
const getTokens = async deviceId => {
  const response = await axios.get(
    `https://jibsayo.vercel.app/api/push-token?deviceId=${deviceId}`
  );
  return response.data;
};
```

## 필수 필드

| 필드         | 타입   | 설명                         | 필수 |
| ------------ | ------ | ---------------------------- | ---- |
| `deviceId`   | string | 디바이스 고유 식별자         | ✅   |
| `token`      | string | FCM 푸시 토큰                | ✅   |
| `os`         | string | 운영체제 (ios, android, web) | ✅   |
| `osVersion`  | string | OS 버전                      | ✅   |
| `appVersion` | string | 앱 버전                      | ✅   |

## 다양한 디바이스 예시

### iOS 디바이스

```json
{
  "deviceId": "iphone-15-pro",
  "token": "ios-fcm-token-abc123def456",
  "os": "ios",
  "osVersion": "17.2",
  "appVersion": "1.2.0"
}
```

### Android 디바이스

```json
{
  "deviceId": "samsung-galaxy-s24",
  "token": "android-fcm-token-xyz789uvw012",
  "os": "android",
  "osVersion": "14.0",
  "appVersion": "1.2.0"
}
```

### 웹 브라우저

```json
{
  "deviceId": "chrome-desktop-mac",
  "token": "web-push-token-chrome-345678",
  "os": "web",
  "osVersion": "chrome-120.0",
  "appVersion": "1.2.0"
}
```

## 에러 응답

### 400 Bad Request

```json
{
  "success": false,
  "error": "유효한 디바이스 ID가 필요합니다."
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "error": "서버 오류가 발생했습니다."
}
```

## 동작 방식

1. **새 토큰 등록**: `deviceId`가 존재하지 않으면 새 문서를 생성합니다.
2. **토큰 업데이트**: 같은 `deviceId`로 요청하면 기존 토큰을 업데이트합니다.
3. **토큰 조회**: `deviceId`로 필터링하여 해당 디바이스의 토큰을 조회합니다.

## Firebase Firestore 구조

```
Collection: push-token
Document: {
  deviceId: string,
  token: string,
  os: string,
  osVersion: string,
  appVersion: string,
  notificationsEnabled: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}
```
