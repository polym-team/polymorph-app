import { COLLECTIONS } from '@/app/api/shared/consts/firestoreCollection';
import { getFirestoreClient } from '@/app/api/shared/libs/fireStore';

const firestoreClient = getFirestoreClient(COLLECTIONS.FAVORITE_APART);

export { firestoreClient };
