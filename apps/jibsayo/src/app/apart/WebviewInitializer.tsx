'use client';

import { useFavoriteApartListQuery } from '@/entities/apart/hooks/useFavoriteApartListQuery';
import {
  removeOnWebviewWillAppear,
  setOnWebviewWillAppear,
} from '@/shared/services/webview';

import { useEffect } from 'react';

export function WebviewInitializer() {
  const { refetch: refetchFavoriteApartList } = useFavoriteApartListQuery();

  useEffect(() => {
    setOnWebviewWillAppear(() => {
      refetchFavoriteApartList();
    });

    return () => {
      removeOnWebviewWillAppear();
    };
  }, [refetchFavoriteApartList]);

  return null;
}
