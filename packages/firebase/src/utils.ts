import { DocumentData, Timestamp } from 'firebase/firestore';

// Timestamp를 Date로 변환
export function convertTimestampToDate(timestamp: Timestamp): Date {
  return timestamp.toDate();
}

// Date를 Timestamp로 변환
export function convertDateToTimestamp(date: Date): Timestamp {
  return Timestamp.fromDate(date);
}

// 현재 시간을 Timestamp로 가져오기
export function getCurrentTimestamp(): Timestamp {
  return Timestamp.now();
}

// 문서 데이터에서 Timestamp 필드들을 Date로 변환
export function convertTimestampsToDates<T extends DocumentData>(data: T): T {
  const converted = { ...data };

  for (const [key, value] of Object.entries(converted)) {
    if (value instanceof Timestamp) {
      (converted as any)[key] = convertTimestampToDate(value);
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      (converted as any)[key] = convertTimestampsToDates(value);
    }
  }

  return converted;
}

// 문서 데이터에서 Date 필드들을 Timestamp로 변환
export function convertDatesToTimestamps<T extends DocumentData>(data: T): T {
  const converted = { ...data };

  for (const [key, value] of Object.entries(converted)) {
    if (value instanceof Date) {
      (converted as any)[key] = convertDateToTimestamp(value);
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      (converted as any)[key] = convertDatesToTimestamps(value);
    }
  }

  return converted;
}

// 문서 ID 생성 (자동 생성된 ID 대신 사용)
export function generateDocumentId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// 쿼리 옵션 빌더
export class QueryBuilder {
  private constraints: Array<{
    field: string;
    operator:
      | '=='
      | '!='
      | '<'
      | '<='
      | '>'
      | '>='
      | 'array-contains'
      | 'array-contains-any'
      | 'in'
      | 'not-in';
    value: any;
  }> = [];
  private orderByField?: string;
  private orderByDirection?: 'asc' | 'desc';
  private limitValue?: number;
  private startAfterValue?: any;
  private endBeforeValue?: any;

  where(
    field: string,
    operator:
      | '=='
      | '!='
      | '<'
      | '<='
      | '>'
      | '>='
      | 'array-contains'
      | 'array-contains-any'
      | 'in'
      | 'not-in',
    value: any
  ): QueryBuilder {
    this.constraints.push({ field, operator, value });
    return this;
  }

  orderBy(field: string, direction: 'asc' | 'desc' = 'asc'): QueryBuilder {
    this.orderByField = field;
    this.orderByDirection = direction;
    return this;
  }

  limit(count: number): QueryBuilder {
    this.limitValue = count;
    return this;
  }

  startAfter(value: any): QueryBuilder {
    this.startAfterValue = value;
    return this;
  }

  endBefore(value: any): QueryBuilder {
    this.endBeforeValue = value;
    return this;
  }

  build() {
    return {
      where: this.constraints.length > 0 ? this.constraints : undefined,
      orderBy: this.orderByField
        ? { field: this.orderByField, direction: this.orderByDirection }
        : undefined,
      limit: this.limitValue,
      startAfter: this.startAfterValue,
      endBefore: this.endBeforeValue,
    };
  }
}

// 에러 처리 유틸리티
export function isFirestoreError(error: any): boolean {
  return error && error.code && error.message;
}

export function getFirestoreErrorMessage(error: any): string {
  if (isFirestoreError(error)) {
    return error.message;
  }
  return error?.message || 'Unknown error occurred';
}
