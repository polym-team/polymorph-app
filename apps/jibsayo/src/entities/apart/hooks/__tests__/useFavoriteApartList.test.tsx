import * as deviceLib from '@/shared/lib/device';
import { act, renderHook } from '@testing-library/react';

import * as favoriteStorage from '../../models/favorite-storage';
import { ApartItem, FavoriteApartItem } from '../../models/types';
import { useFavoriteApartList } from '../useFavoriteApartList';

// Mock dependencies
jest.mock('../../models/favorite-storage');
jest.mock('@/shared/lib/device');
jest.mock('@package/ui', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockedFavoriteStorage = favoriteStorage as jest.Mocked<
  typeof favoriteStorage
>;
const mockedDeviceLib = deviceLib as jest.Mocked<typeof deviceLib>;

describe('useFavoriteApartList - 즐겨찾기 아파트 Hook', () => {
  const mockApartItem: ApartItem = {
    apartName: '테스트아파트',
    address: '서울시 강남구',
  };

  const mockFavoriteApartList: FavoriteApartItem[] = [
    {
      regionCode: '11680',
      apartItems: [
        { apartName: '강남아파트', address: '서울시 강남구 역삼동' },
      ],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('초기 로딩', () => {
    it('디바이스 ID가 있을 때 서버에서 데이터를 로드해야 한다', async () => {
      mockedDeviceLib.getDeviceId.mockReturnValue('device123');
      mockedFavoriteStorage.loadFavoriteApartListFromServer.mockResolvedValue(
        mockFavoriteApartList
      );

      const { result } = renderHook(() => useFavoriteApartList());

      await act(async () => {
        // useEffect가 실행될 때까지 대기
      });

      expect(
        mockedFavoriteStorage.loadFavoriteApartListFromServer
      ).toHaveBeenCalledWith('device123');
      expect(result.current.favoriteApartList).toEqual(mockFavoriteApartList);
    });

    it('디바이스 ID가 없을 때 로컬에서 데이터를 로드해야 한다', async () => {
      mockedDeviceLib.getDeviceId.mockReturnValue(null);
      mockedFavoriteStorage.loadFavoriteApartListFromLocal.mockReturnValue(
        mockFavoriteApartList
      );

      const { result } = renderHook(() => useFavoriteApartList());

      await act(async () => {
        // useEffect가 실행될 때까지 대기
      });

      expect(
        mockedFavoriteStorage.loadFavoriteApartListFromLocal
      ).toHaveBeenCalled();
      expect(result.current.favoriteApartList).toEqual(mockFavoriteApartList);
    });

    it('서버 로드 실패 시 로컬 데이터로 폴백해야 한다', async () => {
      mockedDeviceLib.getDeviceId.mockReturnValue('device123');
      mockedFavoriteStorage.loadFavoriteApartListFromServer.mockRejectedValue(
        new Error('Network error')
      );
      mockedFavoriteStorage.loadFavoriteApartListFromLocal.mockReturnValue(
        mockFavoriteApartList
      );

      const { result } = renderHook(() => useFavoriteApartList());

      await act(async () => {
        // useEffect가 실행될 때까지 대기
      });

      expect(
        mockedFavoriteStorage.loadFavoriteApartListFromServer
      ).toHaveBeenCalledWith('device123');
      expect(
        mockedFavoriteStorage.loadFavoriteApartListFromLocal
      ).toHaveBeenCalled();
      expect(result.current.favoriteApartList).toEqual(mockFavoriteApartList);
    });
  });

  describe('즐겨찾기 추가 (서버 전용 모드)', () => {
    it('디바이스 ID가 있을 때 서버에 저장 후 로컬 상태만 업데이트해야 한다', async () => {
      mockedDeviceLib.getDeviceId.mockReturnValue('device123');
      mockedFavoriteStorage.loadFavoriteApartListFromLocal.mockReturnValue([]);
      mockedFavoriteStorage.addFavoriteApartToServer.mockResolvedValue();
      mockedFavoriteStorage.updateLocalStateOnly.mockReturnValue([
        {
          regionCode: '11680',
          apartItems: [mockApartItem],
        },
      ]);

      const { result } = renderHook(() => useFavoriteApartList());

      await act(async () => {
        await result.current.addFavoriteApart('11680', mockApartItem);
      });

      expect(
        mockedFavoriteStorage.addFavoriteApartToServer
      ).toHaveBeenCalledWith('device123', '11680', mockApartItem);
      expect(mockedFavoriteStorage.updateLocalStateOnly).toHaveBeenCalledWith(
        [],
        '11680',
        mockApartItem
      );
      expect(
        mockedFavoriteStorage.addFavoriteApartToLocal
      ).not.toHaveBeenCalled();
      expect(result.current.favoriteApartList).toHaveLength(1);
    });

    it('디바이스 ID가 없을 때 로컬에만 저장해야 한다', async () => {
      mockedDeviceLib.getDeviceId.mockReturnValue(null);
      mockedFavoriteStorage.loadFavoriteApartListFromLocal.mockReturnValue([]);
      mockedFavoriteStorage.addFavoriteApartToLocal.mockReturnValue([
        {
          regionCode: '11680',
          apartItems: [mockApartItem],
        },
      ]);

      const { result } = renderHook(() => useFavoriteApartList());

      await act(async () => {
        await result.current.addFavoriteApart('11680', mockApartItem);
      });

      expect(
        mockedFavoriteStorage.addFavoriteApartToServer
      ).not.toHaveBeenCalled();
      expect(
        mockedFavoriteStorage.addFavoriteApartToLocal
      ).toHaveBeenCalledWith([], '11680', mockApartItem);
      expect(result.current.favoriteApartList).toHaveLength(1);
    });

    it('서버 저장 실패 시 로컬 상태를 업데이트하지 않아야 한다', async () => {
      mockedDeviceLib.getDeviceId.mockReturnValue('device123');
      mockedFavoriteStorage.loadFavoriteApartListFromLocal.mockReturnValue([]);
      mockedFavoriteStorage.addFavoriteApartToServer.mockRejectedValue(
        new Error('Server error')
      );

      const { result } = renderHook(() => useFavoriteApartList());

      await act(async () => {
        await result.current.addFavoriteApart('11680', mockApartItem);
      });

      expect(
        mockedFavoriteStorage.addFavoriteApartToServer
      ).toHaveBeenCalledWith('device123', '11680', mockApartItem);
      expect(mockedFavoriteStorage.updateLocalStateOnly).not.toHaveBeenCalled();
      expect(result.current.favoriteApartList).toHaveLength(0); // 상태 변경 없음
    });
  });

  describe('즐겨찾기 삭제 (서버 전용 모드)', () => {
    beforeEach(() => {
      mockedFavoriteStorage.loadFavoriteApartListFromLocal.mockReturnValue(
        mockFavoriteApartList
      );
    });

    it('디바이스 ID가 있을 때 서버에서 삭제 후 로컬 상태만 업데이트해야 한다', async () => {
      mockedDeviceLib.getDeviceId.mockReturnValue('device123');
      mockedFavoriteStorage.removeFavoriteApartFromServer.mockResolvedValue();
      mockedFavoriteStorage.removeFromLocalStateOnly.mockReturnValue([]);

      const { result } = renderHook(() => useFavoriteApartList());

      await act(async () => {
        await result.current.removeFavoriteApart('11680', mockApartItem);
      });

      expect(
        mockedFavoriteStorage.removeFavoriteApartFromServer
      ).toHaveBeenCalledWith('device123', '11680', mockApartItem);
      expect(
        mockedFavoriteStorage.removeFromLocalStateOnly
      ).toHaveBeenCalledWith(mockFavoriteApartList, '11680', mockApartItem);
      expect(
        mockedFavoriteStorage.removeFavoriteApartFromLocal
      ).not.toHaveBeenCalled();
      expect(result.current.favoriteApartList).toHaveLength(0);
    });

    it('디바이스 ID가 없을 때 로컬에서만 삭제해야 한다', async () => {
      mockedDeviceLib.getDeviceId.mockReturnValue(null);
      mockedFavoriteStorage.removeFavoriteApartFromLocal.mockReturnValue([]);

      const { result } = renderHook(() => useFavoriteApartList());

      await act(async () => {
        await result.current.removeFavoriteApart('11680', mockApartItem);
      });

      expect(
        mockedFavoriteStorage.removeFavoriteApartFromServer
      ).not.toHaveBeenCalled();
      expect(
        mockedFavoriteStorage.removeFavoriteApartFromLocal
      ).toHaveBeenCalledWith(mockFavoriteApartList, '11680', mockApartItem);
      expect(result.current.favoriteApartList).toHaveLength(0);
    });

    it('서버 삭제 실패 시 로컬 상태를 업데이트하지 않아야 한다', async () => {
      mockedDeviceLib.getDeviceId.mockReturnValue('device123');
      mockedFavoriteStorage.removeFavoriteApartFromServer.mockRejectedValue(
        new Error('Server error')
      );

      const { result } = renderHook(() => useFavoriteApartList());

      await act(async () => {
        await result.current.removeFavoriteApart('11680', mockApartItem);
      });

      expect(
        mockedFavoriteStorage.removeFavoriteApartFromServer
      ).toHaveBeenCalledWith('device123', '11680', mockApartItem);
      expect(
        mockedFavoriteStorage.removeFromLocalStateOnly
      ).not.toHaveBeenCalled();
      expect(result.current.favoriteApartList).toEqual(mockFavoriteApartList); // 상태 변경 없음
    });
  });

  describe('토스트 메시지', () => {
    const { toast } = require('@package/ui');

    it('즐겨찾기 추가 성공 시 성공 토스트를 표시해야 한다', async () => {
      mockedDeviceLib.getDeviceId.mockReturnValue('device123');
      mockedFavoriteStorage.addFavoriteApartToServer.mockResolvedValue();
      mockedFavoriteStorage.updateLocalStateOnly.mockReturnValue([]);

      const { result } = renderHook(() => useFavoriteApartList());

      await act(async () => {
        await result.current.addFavoriteApart('11680', mockApartItem);
      });

      expect(toast.success).toHaveBeenCalledWith(
        '즐겨찾기에 추가되었습니다. (테스트아파트)'
      );
    });

    it('즐겨찾기 추가 실패 시 에러 토스트를 표시해야 한다', async () => {
      mockedDeviceLib.getDeviceId.mockReturnValue('device123');
      mockedFavoriteStorage.addFavoriteApartToServer.mockRejectedValue(
        new Error('Server error')
      );

      const { result } = renderHook(() => useFavoriteApartList());

      await act(async () => {
        await result.current.addFavoriteApart('11680', mockApartItem);
      });

      expect(toast.error).toHaveBeenCalledWith('즐겨찾기 추가에 실패했습니다.');
    });

    it('즐겨찾기 삭제 성공 시 성공 토스트를 표시해야 한다', async () => {
      mockedDeviceLib.getDeviceId.mockReturnValue('device123');
      mockedFavoriteStorage.removeFavoriteApartFromServer.mockResolvedValue();
      mockedFavoriteStorage.removeFromLocalStateOnly.mockReturnValue([]);

      const { result } = renderHook(() => useFavoriteApartList());

      await act(async () => {
        await result.current.removeFavoriteApart('11680', mockApartItem);
      });

      expect(toast.success).toHaveBeenCalledWith(
        '즐겨찾기에서 삭제되었습니다. (테스트아파트)'
      );
    });

    it('즐겨찾기 삭제 실패 시 에러 토스트를 표시해야 한다', async () => {
      mockedDeviceLib.getDeviceId.mockReturnValue('device123');
      mockedFavoriteStorage.removeFavoriteApartFromServer.mockRejectedValue(
        new Error('Server error')
      );

      const { result } = renderHook(() => useFavoriteApartList());

      await act(async () => {
        await result.current.removeFavoriteApart('11680', mockApartItem);
      });

      expect(toast.error).toHaveBeenCalledWith('즐겨찾기 삭제에 실패했습니다.');
    });
  });

  describe('상태 관리', () => {
    it('초기 상태는 빈 배열이어야 한다', () => {
      const { result } = renderHook(() => useFavoriteApartList());

      expect(result.current.favoriteApartList).toEqual([]);
    });

    it('여러 번의 추가/삭제 작업이 올바르게 상태를 업데이트해야 한다', async () => {
      mockedDeviceLib.getDeviceId.mockReturnValue(null);
      mockedFavoriteStorage.loadFavoriteApartListFromLocal.mockReturnValue([]);

      let currentList: FavoriteApartItem[] = [];
      mockedFavoriteStorage.addFavoriteApartToLocal.mockImplementation(
        (list, regionCode, apartItem) => {
          currentList = [
            ...list,
            {
              regionCode,
              apartItems: [apartItem],
            },
          ];
          return currentList;
        }
      );

      mockedFavoriteStorage.removeFavoriteApartFromLocal.mockImplementation(
        () => {
          currentList = [];
          return currentList;
        }
      );

      const { result } = renderHook(() => useFavoriteApartList());

      // 추가
      await act(async () => {
        await result.current.addFavoriteApart('11680', mockApartItem);
      });

      expect(result.current.favoriteApartList).toHaveLength(1);

      // 삭제
      await act(async () => {
        await result.current.removeFavoriteApart('11680', mockApartItem);
      });

      expect(result.current.favoriteApartList).toHaveLength(0);
    });
  });
});
