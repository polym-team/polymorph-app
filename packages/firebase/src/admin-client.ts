import {
  cert,
  getApps,
  initializeApp,
  ServiceAccount,
} from 'firebase-admin/app';
import {
  DocumentData,
  Firestore,
  getFirestore,
  Transaction,
} from 'firebase-admin/firestore';

import {
  FirestoreBatchResult,
  FirestoreDocument,
  FirestoreQueryOptions,
  FirestoreTransactionResult,
  FirestoreWriteResult,
} from './types';

export interface AdminFirestoreConfig {
  collectionName: string;
  projectId?: string;
  serviceAccount?: any;
  serviceAccountPath?: string;
}

export class AdminFirestoreClient {
  private app: any;
  private firestore: Firestore;
  private collectionRef: any;

  constructor(config: AdminFirestoreConfig) {
    // Firebase Admin 앱 초기화
    const existingApps = getApps();
    if (existingApps.length > 0) {
      this.app = existingApps[0];
    } else {
      if (config.serviceAccount) {
        this.app = initializeApp({
          credential: cert(config.serviceAccount),
          projectId: config.projectId,
        });
      } else if (config.serviceAccountPath) {
        this.app = initializeApp({
          credential: cert(config.serviceAccountPath),
          projectId: config.projectId,
        });
      } else {
        // 기본 인증 사용 (GOOGLE_APPLICATION_CREDENTIALS 환경변수)
        this.app = initializeApp({
          projectId: config.projectId,
        });
      }
    }

    this.firestore = getFirestore(this.app);
    this.collectionRef = this.firestore.collection(config.collectionName);
  }

  // 단일 문서 읽기
  async getDocument<T = DocumentData>(
    id: string
  ): Promise<FirestoreDocument<T> | null> {
    try {
      const docRef = this.collectionRef.doc(id);
      const docSnap = await docRef.get();

      if (docSnap.exists) {
        return {
          id: docSnap.id,
          data: docSnap.data() as T,
          ref: docRef as any,
          exists: true,
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting document:', error);
      throw error;
    }
  }

  // 컬렉션 쿼리
  async getDocuments<T = DocumentData>(
    options?: FirestoreQueryOptions
  ): Promise<FirestoreDocument<T>[]> {
    try {
      let query: any = this.collectionRef;

      if (options?.where) {
        options.where.forEach(condition => {
          query = query.where(
            condition.field,
            condition.operator,
            condition.value
          );
        });
      }

      if (options?.orderBy) {
        query = query.orderBy(options.orderBy.field, options.orderBy.direction);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.startAfter) {
        query = query.startAfter(options.startAfter);
      }

      if (options?.endBefore) {
        query = query.endBefore(options.endBefore);
      }

      const querySnapshot = await query.get();

      return querySnapshot.docs.map((doc: any) => ({
        id: doc.id,
        data: doc.data() as T,
        ref: doc.ref as any,
        exists: true,
      }));
    } catch (error) {
      console.error('Error getting documents:', error);
      throw error;
    }
  }

  // 문서 생성
  async createDocument<T extends DocumentData>(
    data: T
  ): Promise<FirestoreWriteResult> {
    try {
      const docRef = await this.collectionRef.add(data);
      return {
        id: docRef.id,
        success: true,
      };
    } catch (error) {
      console.error('Error creating document:', error);
      return {
        id: '',
        success: false,
        error: error as Error,
      };
    }
  }

  // 지정된 ID로 문서 생성
  async createDocumentWithId<T extends DocumentData>(
    id: string,
    data: T
  ): Promise<FirestoreWriteResult> {
    try {
      const docRef = this.collectionRef.doc(id);
      await docRef.set(data);
      return {
        id,
        success: true,
      };
    } catch (error) {
      console.error('Error creating document with ID:', error);
      return {
        id,
        success: false,
        error: error as Error,
      };
    }
  }

  // 문서 업데이트
  async updateDocument<T extends DocumentData>(
    id: string,
    data: Partial<T>
  ): Promise<FirestoreWriteResult> {
    try {
      const docRef = this.collectionRef.doc(id);
      await docRef.update(data);
      return {
        id,
        success: true,
      };
    } catch (error) {
      console.error('Error updating document:', error);
      return {
        id,
        success: false,
        error: error as Error,
      };
    }
  }

  // 문서 삭제
  async deleteDocument(id: string): Promise<FirestoreWriteResult> {
    try {
      const docRef = this.collectionRef.doc(id);
      await docRef.delete();
      return {
        id,
        success: true,
      };
    } catch (error) {
      console.error('Error deleting document:', error);
      return {
        id,
        success: false,
        error: error as Error,
      };
    }
  }

  // 배치 작업 시작
  startBatch(): any {
    return this.firestore.batch();
  }

  // 배치에 문서 추가
  addToBatch(
    batch: any,
    operation: 'create' | 'update' | 'delete',
    id: string,
    data?: DocumentData
  ): void {
    const docRef = this.collectionRef.doc(id);

    switch (operation) {
      case 'create':
        batch.set(docRef, data!);
        break;
      case 'update':
        batch.update(docRef, data!);
        break;
      case 'delete':
        batch.delete(docRef);
        break;
    }
  }

  // 배치 커밋
  async commitBatch(batch: any): Promise<FirestoreBatchResult> {
    try {
      await batch.commit();
      return {
        success: true,
        errors: [],
      };
    } catch (error) {
      console.error('Error committing batch:', error);
      return {
        success: false,
        errors: [error as Error],
      };
    }
  }

  // 트랜잭션 실행
  async runTransaction<T = DocumentData>(
    updateFunction: (transaction: Transaction) => Promise<T>
  ): Promise<FirestoreTransactionResult<T>> {
    try {
      const result = await this.firestore.runTransaction(updateFunction);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Error running transaction:', error);
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  // 컬렉션 참조 가져오기
  getCollectionRef(): any {
    return this.collectionRef;
  }

  // Firestore 인스턴스 가져오기
  getFirestoreInstance(): Firestore {
    return this.firestore;
  }
}
