import { COLLECTIONS } from '@/app/api/shared/consts/firestoreCollection';
import { getFirestoreClient } from '@/app/api/shared/libs/fireStore';

const pushTokenFirestoreClient = getFirestoreClient(COLLECTIONS.PUSH_TOKEN);
const favoriteApartFirestoreClient = getFirestoreClient(
  COLLECTIONS.FAVORITE_APART
);
const apiRateLimitFirestoreClient = getFirestoreClient(
  COLLECTIONS.API_RATE_LIMIT
);

export {
  pushTokenFirestoreClient,
  favoriteApartFirestoreClient,
  apiRateLimitFirestoreClient,
};
