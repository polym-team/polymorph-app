# @polymorph/firebase

Firebase Firestore 연결을 위한 가장 낮은 레이어의 코드입니다. 서버 사이드에서 Admin SDK를 사용하여 Firestore에 접근합니다.

## 설치

```bash
pnpm add @polymorph/firebase firebase-admin
```

## 기본 사용법

### 1. AdminFirestoreClient 초기화

```typescript
import { AdminFirestoreClient } from '@polymorph/firebase';

const firestoreClient = new AdminFirestoreClient({
  collectionName: 'users', // 컬렉션 이름
  projectId: 'your-project-id',
  // 서비스 계정 키 (선택사항)
  serviceAccount: {
    // 서비스 계정 정보
  },
  // 또는 서비스 계정 키 파일 경로 (선택사항)
  serviceAccountPath: '/path/to/service-account-key.json',
});
```

### 2. 문서 생성

```typescript
// 단일 문서 생성
const userData = {
  name: 'John Doe',
  email: 'john@example.com',
  createdAt: new Date(),
};

const result = await firestoreClient.createDocument(userData);
if (result.success) {
  console.log('문서가 생성되었습니다. ID:', result.id);
} else {
  console.error('문서 생성 실패:', result.error);
}
```

### 3. 문서 읽기

```typescript
// 단일 문서 읽기
const document = await firestoreClient.getDocument('document-id');
if (document) {
  console.log('문서 데이터:', document.data);
  console.log('문서 ID:', document.id);
}

// 컬렉션 쿼리
const documents = await firestoreClient.getDocuments({
  where: [{ field: 'status', operator: '==', value: 'active' }],
  orderBy: { field: 'createdAt', direction: 'desc' },
  limit: 10,
});

console.log('조회된 문서들:', documents);
```

### 4. 문서 업데이트

```typescript
const updateData = {
  name: 'Jane Doe',
  updatedAt: new Date(),
};

const result = await firestoreClient.updateDocument('document-id', updateData);
if (result.success) {
  console.log('문서가 업데이트되었습니다.');
} else {
  console.error('문서 업데이트 실패:', result.error);
}
```

### 5. 문서 삭제

```typescript
const result = await firestoreClient.deleteDocument('document-id');
if (result.success) {
  console.log('문서가 삭제되었습니다.');
} else {
  console.error('문서 삭제 실패:', result.error);
}
```

### 6. 배치 작업

```typescript
// 배치 시작
const batch = firestoreClient.startBatch();

// 배치에 작업 추가
firestoreClient.addToBatch(batch, 'create', 'new-doc-id', { name: 'New User' });
firestoreClient.addToBatch(batch, 'update', 'existing-doc-id', {
  status: 'updated',
});
firestoreClient.addToBatch(batch, 'delete', 'delete-doc-id');

// 배치 커밋
const result = await firestoreClient.commitBatch(batch);
if (result.success) {
  console.log('배치 작업이 성공했습니다.');
} else {
  console.error('배치 작업 실패:', result.errors);
}
```

### 7. 트랜잭션

```typescript
const result = await firestoreClient.runTransaction(async transaction => {
  // 트랜잭션 내에서 수행할 작업들
  const doc1 = await transaction.get(docRef1);
  const doc2 = await transaction.get(docRef2);

  // 데이터 검증 및 업데이트
  if (doc1.data().balance >= 100) {
    transaction.update(docRef1, { balance: doc1.data().balance - 100 });
    transaction.update(docRef2, { balance: doc2.data().balance + 100 });
    return { success: true };
  }

  throw new Error('잔액 부족');
});

if (result.success) {
  console.log('트랜잭션이 성공했습니다.');
} else {
  console.error('트랜잭션 실패:', result.error);
}
```

## 유틸리티 함수

### QueryBuilder 사용

```typescript
import { QueryBuilder } from '@polymorph/firebase';

const queryOptions = new QueryBuilder()
  .where('status', '==', 'active')
  .where('age', '>=', 18)
  .orderBy('createdAt', 'desc')
  .limit(20)
  .build();

const documents = await firestoreClient.getDocuments(queryOptions);
```

### Timestamp 변환

```typescript
import {
  convertDatesToTimestamps,
  convertDateToTimestamp,
  convertTimestampsToDates,
  convertTimestampToDate,
} from '@polymorph/firebase';

// Timestamp를 Date로 변환
const date = convertTimestampToDate(timestamp);

// Date를 Timestamp로 변환
const timestamp = convertDateToTimestamp(new Date());

// 문서 데이터의 모든 Timestamp를 Date로 변환
const documentWithDates = convertTimestampsToDates(documentData);

// 문서 데이터의 모든 Date를 Timestamp로 변환
const documentWithTimestamps = convertDatesToTimestamps(documentData);
```

## 타입 정의

```typescript
import {
  FirestoreBatchResult,
  FirestoreDocument,
  FirestoreQueryOptions,
  FirestoreTransactionResult,
  FirestoreWriteResult,
} from '@polymorph/firebase';

// 사용자 정의 타입
interface User {
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// 타입이 지정된 문서 읽기
const user = await firestoreClient.getDocument<User>('user-id');
if (user) {
  console.log(user.data.name); // 타입 안전성 보장
}
```

## 에러 처리

```typescript
import {
  getFirestoreErrorMessage,
  isFirestoreError,
} from '@polymorph/firebase';

try {
  const result = await firestoreClient.createDocument(data);
  if (!result.success) {
    console.error('Firestore 에러:', getFirestoreErrorMessage(result.error));
  }
} catch (error) {
  if (isFirestoreError(error)) {
    console.error('Firestore 에러:', error.code, error.message);
  } else {
    console.error('일반 에러:', error);
  }
}
```

## 인증 설정

### 로컬 개발 환경

1. Firebase 콘솔에서 서비스 계정 키 다운로드
2. 환경변수 설정:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
```

### Vercel 배포 환경

Vercel에서는 자동으로 Firebase Admin SDK 인증이 설정됩니다. 별도 설정이 필요하지 않습니다.

## 주의사항

1. **보안**: 서비스 계정 키는 절대 클라이언트 사이드에 노출하지 마세요.
2. **인덱스**: 복잡한 쿼리를 사용할 때는 Firestore 인덱스를 설정해야 할 수 있습니다.
3. **비용**: Firestore 사용량에 따라 비용이 발생할 수 있습니다.
4. **타입 안전성**: TypeScript를 사용하여 타입 안전성을 보장하세요.
5. **서버 사이드 전용**: 이 클라이언트는 서버 사이드에서만 사용해야 합니다.
