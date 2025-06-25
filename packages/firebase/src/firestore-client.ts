import {
  FirebaseApp,
  FirebaseOptions,
  getApps,
  initializeApp,
} from 'firebase/app';
import {
  addDoc,
  collection,
  CollectionReference,
  deleteDoc,
  doc,
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  endBefore,
  Firestore,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  QueryConstraint,
  QuerySnapshot,
  runTransaction,
  startAfter,
  Transaction,
  updateDoc,
  where,
  writeBatch,
  WriteBatch,
  WithFieldValue,
} from 'firebase/firestore';

import {
  FirestoreBatchResult,
  FirestoreConfig,
  FirestoreDocument,
  FirestoreQueryOptions,
  FirestoreTransactionResult,
  FirestoreWriteResult,
} from './types';

export class FirestoreClient {
  private app: FirebaseApp;
  private firestore: Firestore;
  private collectionRef: CollectionReference;

  constructor(config: FirestoreConfig) {
    // Firebase 앱 초기화
    const firebaseConfig: FirebaseOptions = {
      projectId: config.projectId,
      apiKey: config.apiKey,
      authDomain: config.authDomain,
      storageBucket: config.storageBucket,
      messagingSenderId: config.messagingSenderId,
      appId: config.appId,
    };

    // 이미 초기화된 앱이 있는지 확인
    const existingApps = getApps();
    if (existingApps.length > 0) {
      this.app = existingApps[0];
    } else {
      this.app = initializeApp(firebaseConfig);
    }

    this.firestore = getFirestore(this.app);
    this.collectionRef = collection(this.firestore, config.collectionName);
  }

  // 단일 문서 읽기
  async getDocument<T = DocumentData>(
    id: string
  ): Promise<FirestoreDocument<T> | null> {
    try {
      const docRef = doc(this.collectionRef, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          data: docSnap.data() as T,
          ref: docRef as DocumentReference<T>,
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
      const constraints: QueryConstraint[] = [];

      if (options?.where) {
        options.where.forEach(condition => {
          constraints.push(
            where(condition.field, condition.operator, condition.value)
          );
        });
      }

      if (options?.orderBy) {
        constraints.push(
          orderBy(options.orderBy.field, options.orderBy.direction)
        );
      }

      if (options?.limit) {
        constraints.push(limit(options.limit));
      }

      if (options?.startAfter) {
        constraints.push(startAfter(options.startAfter));
      }

      if (options?.endBefore) {
        constraints.push(endBefore(options.endBefore));
      }

      const q = query(this.collectionRef, ...constraints);
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        data: doc.data() as T,
        ref: doc.ref as DocumentReference<T>,
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
      const docRef = await addDoc(this.collectionRef, data as WithFieldValue<DocumentData>);
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

  // 문서 업데이트
  async updateDocument<T extends DocumentData>(
    id: string,
    data: Partial<T>
  ): Promise<FirestoreWriteResult> {
    try {
      const docRef = doc(this.collectionRef, id);
      await updateDoc(docRef, data as DocumentData);
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
      const docRef = doc(this.collectionRef, id);
      await deleteDoc(docRef);
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
  startBatch(): WriteBatch {
    return writeBatch(this.firestore);
  }

  // 배치에 문서 추가
  addToBatch(
    batch: WriteBatch,
    operation: 'create' | 'update' | 'delete',
    id: string,
    data?: DocumentData
  ): void {
    const docRef = doc(this.collectionRef, id);

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
  async commitBatch(batch: WriteBatch): Promise<FirestoreBatchResult> {
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
      const result = await runTransaction(this.firestore, updateFunction);
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
  getCollectionRef(): CollectionReference {
    return this.collectionRef;
  }

  // Firestore 인스턴스 가져오기
  getFirestoreInstance(): Firestore {
    return this.firestore;
  }
}
