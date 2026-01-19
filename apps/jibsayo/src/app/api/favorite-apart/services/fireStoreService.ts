import { AdminFirestoreClient } from '@polymorph/firebase';

import { COLLECTIONS } from '@/app/api/shared/consts/firestoreCollection';
import { getFirestoreClient } from '@/app/api/shared/libs/fireStore';

let _firestoreClient: AdminFirestoreClient | null = null;

function firestoreClient(): AdminFirestoreClient {
  if (!_firestoreClient) {
    _firestoreClient = getFirestoreClient(COLLECTIONS.FAVORITE_APART);
  }
  return _firestoreClient;
}

export { firestoreClient };
