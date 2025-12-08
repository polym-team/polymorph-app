import {
  useAddFavoriteApartMutation,
  useFavoriteApartListQuery,
  useRemoveFavoriteApartMutation,
} from '@/entities/apart';

import { ApartInfoType } from './type';

interface Params {
  apartToken: string;
  data: ApartInfoType | undefined;
}

interface Return {
  isFavorited: boolean;
  toggleFavorite: () => void;
}

export const useApartInfo = ({ apartToken, data }: Params): Return => {
  const { data: favoriteApartList } = useFavoriteApartListQuery();
  const { mutate: mutateAddFavoriteApart } = useAddFavoriteApartMutation();
  const { mutate: mutateRemoveFavoriteApart } =
    useRemoveFavoriteApartMutation();

  const isFavorited =
    favoriteApartList?.some(apart => apart.apartToken === apartToken) ?? false;

  const toggleFavorite = () => {
    if (!data) return;

    if (isFavorited) {
      mutateRemoveFavoriteApart({
        apartToken,
        apartName: data.apartName,
        regionCode: data.regionCode,
      });
    } else {
      mutateAddFavoriteApart({
        apartToken,
        apartName: data.apartName,
        regionCode: data.regionCode,
      });
    }
  };

  return { isFavorited, toggleFavorite };
};
