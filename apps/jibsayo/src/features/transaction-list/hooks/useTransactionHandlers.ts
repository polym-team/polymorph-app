/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  useAddFavoriteApartMutation,
  useRemoveFavoriteApartMutation,
} from '@/entities/apart';
import { useTransactionPageSearchParams } from '@/entities/transaction';
import { ROUTE_PATH } from '@/shared/consts/route';
import { useNavigate } from '@/shared/hooks/useNavigate';

import { HandlerState, TransactionItemViewModel } from '../types';

export const useTransactionHandlers = (): HandlerState => {
  const { navigate } = useNavigate();
  const { searchParams } = useTransactionPageSearchParams();
  const { mutate: mutateFavoriteApartRemove } =
    useRemoveFavoriteApartMutation();
  const { mutate: mutateFavoriteApartAdd } = useAddFavoriteApartMutation();

  const toggleFavorite = (item: TransactionItemViewModel) => {
    // FIXME: 작업 필요
    // const params = {
    //   apartToken: item.fallbackToken,
    //   apartName: item.apartName,
    //   address: item.address,
    //   regionCode: searchParams.regionCode,
    // };
    // if (item.isFavorite) {
    //   mutateFavoriteApartRemove(params);
    // } else {
    //   mutateFavoriteApartAdd(params);
    // }
  };

  const navigateToApartDetail = (item: TransactionItemViewModel) => {
    navigate(
      `${ROUTE_PATH.APART}/${item.apartId}?fallbackToken=${item.fallbackToken}`
    );
  };

  return { toggleFavorite, navigateToApartDetail };
};
