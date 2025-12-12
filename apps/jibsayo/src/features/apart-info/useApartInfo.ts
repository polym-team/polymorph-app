import {
  useAddFavoriteApartMutation,
  useFavoriteApartListQuery,
  useRemoveFavoriteApartMutation,
} from '@/entities/apart';

import { ApartInfoType } from './type';

interface Params {
  apartId: number | null;
  data: ApartInfoType | undefined;
}

interface Return {
  isEmptyData: boolean;
  isFavorited: boolean;
  toggleFavorite: () => void;
}

export const useApartInfo = ({ apartId, data }: Params): Return => {
  const { data: favoriteApartList } = useFavoriteApartListQuery();
  const { mutate: mutateAddFavoriteApart } = useAddFavoriteApartMutation();
  const { mutate: mutateRemoveFavoriteApart } =
    useRemoveFavoriteApartMutation();

  const isFavorited =
    favoriteApartList?.some(apart => apart.apartId === apartId) ?? false;
  const isEmptyData = data
    ? Object.keys(data)
        .filter(key => key !== 'regionCode' && key !== 'apartName')
        .every(key => !data[key as keyof ApartInfoType])
    : false;

  const toggleFavorite = () => {
    if (!data || !apartId) return;

    if (isFavorited) {
      mutateRemoveFavoriteApart({
        apartId,
        apartName: data.apartName,
        regionCode: data.regionCode,
      });
    } else {
      mutateAddFavoriteApart({
        apartId,
        apartName: data.apartName,
        regionCode: data.regionCode,
      });
    }
  };

  return { isEmptyData, isFavorited, toggleFavorite };
};
