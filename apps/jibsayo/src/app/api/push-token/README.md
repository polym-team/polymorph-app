# 푸시 토큰 API

## 디바이스 아이디로 토큰 정보 조회

[GET] `/api/push-token?deviceId={deviceId}`

**request payload**

```json
{}
```

**response**

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

## 푸시 토큰 등록/업데이트

[POST] `/api/push-token`

**request payload**

```json
{
  "deviceId": "iphone-14-pro-max",
  "token": "fcm-token-ios-example-123456789",
  "os": "ios",
  "osVersion": "17.0",
  "appVersion": "1.0.0"
}
```

**response**

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

## 푸시 토큰 수정

[PUT] `/api/push-token/{deviceId}`

**request payload**

```json
{
  "token": "updated-fcm-token-999888777",
  "notificationsEnabled": false,
  "os": "ios",
  "osVersion": "17.1",
  "appVersion": "1.0.1"
}
```

**response**

```json
{
  "success": true,
  "data": {
    "id": "bdyq3jBfLIM2t1vTgB6O",
    "deviceId": "iphone-14-pro-max",
    "token": "updated-fcm-token-999888777",
    "os": "ios",
    "osVersion": "17.1",
    "appVersion": "1.0.1",
    "notificationsEnabled": false,
    "createdAt": "2025-06-25T07:53:01.104Z",
    "updatedAt": "2025-06-25T15:29:54.267Z"
  }
}
```

## 푸시 토큰 삭제

[DELETE] `/api/push-token/{deviceId}`

**request payload**

```json
{}
```

**response**

```json
{
  "success": true,
  "data": {
    "id": "bdyq3jBfLIM2t1vTgB6O",
    "deleted": true
  }
}
```
