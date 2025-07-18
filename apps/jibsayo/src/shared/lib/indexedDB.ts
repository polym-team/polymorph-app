const DB_NAME = 'jibsayo-db';
const DB_VERSION = 1;
const STORE_NAME = 'key-value-store';

interface IndexedDBWrapper {
  getItem: <T>(key: string) => Promise<T | null>;
  setItem: <T>(key: string, value: T) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  clear: () => Promise<void>;
}

class IndexedDBManager implements IndexedDBWrapper {
  private db: IDBDatabase | null = null;
  private isInitialized = false;

  private async initDB(): Promise<IDBDatabase> {
    if (this.db && this.isInitialized) {
      return this.db;
    }

    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(
          new Error('IndexedDB는 브라우저 환경에서만 사용할 수 있습니다.')
        );
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error('IndexedDB 열기 실패'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        resolve(this.db);
      };

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 기존 스토어가 있으면 삭제
        if (db.objectStoreNames.contains(STORE_NAME)) {
          db.deleteObjectStore(STORE_NAME);
        }

        // 새로운 스토어 생성
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        store.createIndex('key', 'key', { unique: true });
      };
    });
  }

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const db = await this.initDB();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(key);

        request.onerror = () => {
          reject(new Error('데이터 조회 실패'));
        };

        request.onsuccess = () => {
          const result = request.result;
          if (result) {
            try {
              const parsedValue = JSON.parse(result.value);
              resolve(parsedValue);
            } catch {
              resolve(result.value);
            }
          } else {
            resolve(null);
          }
        };
      });
    } catch (error) {
      console.warn('IndexedDB getItem 실패:', error);
      return null;
    }
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const db = await this.initDB();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        const serializedValue =
          typeof value === 'string' ? value : JSON.stringify(value);
        const request = store.put({ key, value: serializedValue });

        request.onerror = () => {
          reject(new Error('데이터 저장 실패'));
        };

        request.onsuccess = () => {
          resolve();
        };
      });
    } catch (error) {
      console.warn('IndexedDB setItem 실패:', error);
      throw error;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      const db = await this.initDB();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(key);

        request.onerror = () => {
          reject(new Error('데이터 삭제 실패'));
        };

        request.onsuccess = () => {
          resolve();
        };
      });
    } catch (error) {
      console.warn('IndexedDB removeItem 실패:', error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      const db = await this.initDB();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();

        request.onerror = () => {
          reject(new Error('데이터 전체 삭제 실패'));
        };

        request.onsuccess = () => {
          resolve();
        };
      });
    } catch (error) {
      console.warn('IndexedDB clear 실패:', error);
      throw error;
    }
  }
}

// 싱글톤 인스턴스
const indexedDBManager = new IndexedDBManager();

// 기존 localStorage API와 동일한 인터페이스 제공
export const getItem = async <T>(key: string): Promise<T | null> => {
  return indexedDBManager.getItem<T>(key);
};

export const setItem = async <T>(key: string, value: T): Promise<void> => {
  return indexedDBManager.setItem<T>(key, value);
};

export const removeItem = async (key: string): Promise<void> => {
  return indexedDBManager.removeItem(key);
};

export const clear = async (): Promise<void> => {
  return indexedDBManager.clear();
};

// 동기 버전 (기존 코드와의 호환성을 위해)
export const getItemSync = <T>(key: string): T | null => {
  // 동기 버전은 지원하지 않으므로 null 반환
  console.warn(
    'IndexedDB는 비동기만 지원합니다. getItemSync 대신 getItem을 사용하세요.'
  );
  return null;
};

export const setItemSync = (key: string, value: any): void => {
  // 동기 버전은 지원하지 않으므로 무시
  console.warn(
    'IndexedDB는 비동기만 지원합니다. setItemSync 대신 setItem을 사용하세요.'
  );
};

export const removeItemSync = (key: string): void => {
  // 동기 버전은 지원하지 않으므로 무시
  console.warn(
    'IndexedDB는 비동기만 지원합니다. removeItemSync 대신 removeItem을 사용하세요.'
  );
};
