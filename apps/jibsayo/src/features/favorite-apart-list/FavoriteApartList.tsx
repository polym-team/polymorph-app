'use client';

import { useAuthStore } from '@/shared/stores/authStore';
import { useGlobalConfigStore } from '@/shared/stores/globalConfigStore';

import { EmptyList } from './ui/EmptyList';
import { NotLoggedIn } from './ui/NotLoggedIn';
import { RegionItem } from './ui/RegionItem';
import { RegionTabs } from './ui/RegionTabs';
import { useFavoriteApartList } from './useFavoriteApartList';

export function FavoriteApartList() {
  const isInApp = useGlobalConfigStore(s => s.isInApp);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const authReady = useAuthStore(s => s.isReady);

  const {
    regionTabs,
    selectedRegionCode,
    regionItems,
    toggleFavoriteApart,
    clickApartItem,
    isApartLoading,
    setSelectedRegionCode,
  } = useFavoriteApartList();

  // 웹뷰는 deviceId 기반이라 인증 체크 안 함 (TODO: 네이티브 앱 출시 후 재검토)
  if (!isInApp && authReady && !isAuthenticated) {
    return <NotLoggedIn />;
  }

  if (!regionTabs.length) {
    return <EmptyList />;
  }

  return (
    <div className="flex w-full flex-col gap-y-3 py-2">
      <RegionTabs
        tabs={regionTabs}
        activeTab={selectedRegionCode}
        onTabChange={setSelectedRegionCode}
      />

      {regionItems.map(item => (
        <RegionItem
          key={item.code}
          item={item}
          isLoading={isApartLoading}
          onToggleFavorite={toggleFavoriteApart}
          onClickApart={clickApartItem}
        />
      ))}
    </div>
  );
}
