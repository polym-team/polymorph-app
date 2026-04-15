import { redirectToLogin } from '@/shared/services/auth';
import { useAuthStore } from '@/shared/stores/authStore';
import { useConfirmDialogStore } from '@/shared/stores/confirmDialogStore';
import { useGlobalConfigStore } from '@/shared/stores/globalConfigStore';
import { useMutation } from '@tanstack/react-query';

import { toast } from '@package/ui';

import { addFavoriteApart } from '../services/api';
import { FavoriteApartItem } from '../types/FavoriteApartItem';
import { useFavoriteApartListQuery } from './useFavoriteApartListQuery';

export const useAddFavoriteApartMutation = () => {
  const { refetch: refetchFavoriteApartList } = useFavoriteApartListQuery();

  return useMutation({
    mutationFn: async (item: FavoriteApartItem) => {
      const { isInApp, deviceId } = useGlobalConfigStore.getState();
      const { isAuthenticated } = useAuthStore.getState();

      try {
        // 웹뷰: 기존 deviceId 흐름 (TODO: 네이티브 앱 출시 후 재검토)
        if (isInApp) {
          await addFavoriteApart(deviceId, item);
          toast.success(`${item.apartName} 아파트가 관심목록에 추가됐어요`);
          refetchFavoriteApartList();
          return;
        }

        // 비로그인 웹: 로그인 유도 모달
        if (!isAuthenticated) {
          useConfirmDialogStore.getState().show({
            title: '로그인이 필요합니다',
            description:
              '관심 아파트를 저장하려면 로그인해주세요.\n로그인 후 현재 페이지로 돌아옵니다.',
            confirmText: '로그인',
            cancelText: '취소',
            onConfirm: () => redirectToLogin(),
          });
          return;
        }

        // 로그인 웹: 쿠키 기반
        await addFavoriteApart('', item);
        toast.success(`${item.apartName} 아파트가 관심목록에 추가됐어요`);
        refetchFavoriteApartList();
      } catch {
        toast.error('즐겨찾기 추가에 실패했어요');
      }
    },
  });
};
