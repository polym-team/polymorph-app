import {
  CollectionReference,
  DocumentData,
  DocumentReference,
  Query,
} from 'firebase/firestore';

export interface FirestoreConfig {
  collectionName: string;
  projectId?: string;
  apiKey?: string;
  authDomain?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

export interface FirestoreDocument<T = DocumentData> {
  id: string;
  data: T;
  ref: DocumentReference<T>;
  exists: boolean;
}

export interface FirestoreQueryOptions {
  limit?: number;
  orderBy?: {
    field: string;
    direction?: 'asc' | 'desc';
  };
  where?: Array<{
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
  }>;
  startAfter?: any;
  endBefore?: any;
}

export interface FirestoreWriteResult {
  id: string;
  success: boolean;
  error?: Error;
}

export interface FirestoreBatchResult {
  success: boolean;
  errors: Error[];
}

export interface FirestoreTransactionResult<T = DocumentData> {
  success: boolean;
  data?: T;
  error?: Error;
}
