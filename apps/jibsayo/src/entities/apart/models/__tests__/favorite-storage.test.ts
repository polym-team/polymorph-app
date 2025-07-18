import { STORAGE_KEY } from '@/shared/consts/storageKey';

import * as api from '../../services/api';
import {
  addFavoriteApartToLocal,
  addFavoriteApartToServer,
  loadFavoriteApartListFromLocal,
  loadFavoriteApartListFromServer,
  removeFavoriteApartFromLocal,
  removeFavoriteApartFromServer,
  removeFromLocalStateOnly,
  updateLocalStateOnly,
} from '../favorite-storage';
import { ApartItem, FavoriteApartItem } from '../types';

// API 모듈 모킹
jest.mock('../../services/api');
const mockedApi = api as jest.Mocked<typeof api>;

// IndexedDB 모킹
const mockGetItem = jest.fn();
const mockSetItem = jest.fn();
jest.mock('@/shared/lib/indexedDB', () => ({
  getItem: async (...args: any[]) => mockGetItem(...args),
  setItem: async (...args: any[]) => mockSetItem(...args),
}));

describe('FavoriteStorage - 즐겨찾기 아파트 관리', () => {
  const mockApartItem: ApartItem = {
    apartName: '테스트아파트',
    address: '서울시 강남구',
  };

  const mockFavoriteApartList: FavoriteApartItem[] = [
    {
      regionCode: '11680',
      apartItems: [
        { apartName: '강남아파트', address: '서울시 강남구 역삼동' },
        { apartName: '역삼타워', address: '서울시 강남구 역삼동' },
      ],
    },
    {
      regionCode: '11650',
      apartItems: [
        { apartName: '서초아파트', address: '서울시 서초구 서초동' },
      ],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetItem.mockReturnValue(null);
    mockSetItem.mockImplementation(() => {});
  });

  describe('서버 기반 즐겨찾기 관리', () => {
    describe('loadFavoriteApartListFromServer', () => {
      it('서버에서 즐겨찾기 목록을 성공적으로 로드해야 한다', async () => {
        const mockServerData = [
          {
            regionCode: '11680',
            apartName: '강남아파트',
            address: '서울시 강남구 역삼동',
            deviceId: 'device123',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];

        mockedApi.fetchFavoriteApartList.mockResolvedValue(mockServerData);

        const result = await loadFavoriteApartListFromServer('device123');

        expect(mockedApi.fetchFavoriteApartList).toHaveBeenCalledWith(
          'device123'
        );
        expect(result).toHaveLength(1);
        expect(result[0].regionCode).toBe('11680');
        expect(result[0].apartItems).toHaveLength(1);
        expect(result[0].apartItems[0].apartName).toBe('강남아파트');
      });

      it('서버 로드 실패 시 에러를 던져야 한다', async () => {
        const error = new Error('Network error');
        mockedApi.fetchFavoriteApartList.mockRejectedValue(error);

        await expect(
          loadFavoriteApartListFromServer('device123')
        ).rejects.toThrow('Network error');
      });
    });

    describe('addFavoriteApartToServer', () => {
      it('서버에 즐겨찾기를 성공적으로 추가해야 한다', async () => {
        const mockResult = {
          regionCode: '11680',
          apartName: '테스트아파트',
          address: '서울시 강남구',
          deviceId: 'device123',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockedApi.addFavoriteApart.mockResolvedValue(mockResult);

        await addFavoriteApartToServer('device123', '11680', mockApartItem);

        expect(mockedApi.addFavoriteApart).toHaveBeenCalledWith(
          'device123',
          '11680',
          mockApartItem
        );
      });

      it('서버 추가 실패 시 에러를 던져야 한다', async () => {
        const error = new Error('Server error');
        mockedApi.addFavoriteApart.mockRejectedValue(error);

        await expect(
          addFavoriteApartToServer('device123', '11680', mockApartItem)
        ).rejects.toThrow('Server error');
      });
    });

    describe('removeFavoriteApartFromServer', () => {
      it('서버에서 즐겨찾기를 성공적으로 삭제해야 한다', async () => {
        mockedApi.removeFavoriteApart.mockResolvedValue(undefined);

        await removeFavoriteApartFromServer(
          'device123',
          '11680',
          mockApartItem
        );

        expect(mockedApi.removeFavoriteApart).toHaveBeenCalledWith(
          'device123',
          '11680',
          mockApartItem
        );
      });
    });
  });

  describe('로컬 기반 즐겨찾기 관리', () => {
    describe('loadFavoriteApartListFromLocal', () => {
      it('로컬스토리지에서 즐겨찾기 목록을 로드해야 한다', () => {
        const mockLocalData = [
          {
            regionCode: '11680',
            apartName: '강남아파트',
            address: '서울시 강남구 역삼동',
          },
        ];
        mockGetItem.mockReturnValue(mockLocalData);

        const result = loadFavoriteApartListFromLocal();

        expect(mockGetItem).toHaveBeenCalledWith(
          STORAGE_KEY.FAVORITE_APART_LIST
        );
        expect(result).toHaveLength(1);
        expect(result[0].regionCode).toBe('11680');
        expect(result[0].apartItems[0].apartName).toBe('강남아파트');
      });

      it('로컬스토리지가 비어있으면 빈 배열을 반환해야 한다', () => {
        mockGetItem.mockReturnValue(null);

        const result = loadFavoriteApartListFromLocal();

        expect(result).toEqual([]);
      });

      it('기존 FavoriteApartItem[] 형태 데이터를 마이그레이션해야 한다', () => {
        const oldFormatData = [
          {
            regionCode: '11680',
            apartItems: [
              { apartName: '강남아파트', address: '서울시 강남구 역삼동' },
            ],
          },
        ];
        mockGetItem.mockReturnValue(oldFormatData);

        const result = loadFavoriteApartListFromLocal();

        expect(mockSetItem).toHaveBeenCalledWith(
          STORAGE_KEY.FAVORITE_APART_LIST,
          [
            {
              regionCode: '11680',
              apartName: '강남아파트',
              address: '서울시 강남구 역삼동',
            },
          ]
        );
        expect(result[0].regionCode).toBe('11680');
      });
    });

    describe('addFavoriteApartToLocal', () => {
      it('새로운 지역에 첫 번째 아파트를 추가해야 한다', () => {
        const result = addFavoriteApartToLocal([], '11680', mockApartItem);

        expect(result).toHaveLength(1);
        expect(result[0].regionCode).toBe('11680');
        expect(result[0].apartItems).toHaveLength(1);
        expect(result[0].apartItems[0]).toEqual(mockApartItem);
        expect(mockSetItem).toHaveBeenCalled();
      });

      it('기존 지역에 새로운 아파트를 추가해야 한다', () => {
        const existingList = [
          {
            regionCode: '11680',
            apartItems: [{ apartName: '기존아파트', address: '서울시 강남구' }],
          },
        ];

        const result = addFavoriteApartToLocal(
          existingList,
          '11680',
          mockApartItem
        );

        expect(result[0].apartItems).toHaveLength(2);
        expect(result[0].apartItems[1]).toEqual(mockApartItem);
      });

      it('이미 존재하는 아파트는 중복 추가하지 않아야 한다', () => {
        const existingList = [
          {
            regionCode: '11680',
            apartItems: [mockApartItem],
          },
        ];

        const result = addFavoriteApartToLocal(
          existingList,
          '11680',
          mockApartItem
        );

        expect(result[0].apartItems).toHaveLength(1);
      });

      it('추가 후 지역코드 순서대로 정렬되어야 한다', () => {
        const existingList = [
          {
            regionCode: '11680',
            apartItems: [{ apartName: '강남아파트', address: '서울시 강남구' }],
          },
        ];

        const result = addFavoriteApartToLocal(
          existingList,
          '11650',
          mockApartItem
        );

        expect(result).toHaveLength(2);
        expect(result[0].regionCode).toBe('11650'); // 더 작은 지역코드가 먼저
        expect(result[1].regionCode).toBe('11680');
      });
    });

    describe('removeFavoriteApartFromLocal', () => {
      it('지정된 아파트를 삭제해야 한다', () => {
        const result = removeFavoriteApartFromLocal(
          mockFavoriteApartList,
          '11680',
          {
            apartName: '강남아파트',
            address: '서울시 강남구 역삼동',
          }
        );

        expect(result[0].apartItems).toHaveLength(1);
        expect(result[0].apartItems[0].apartName).toBe('역삼타워');
      });

      it('지역의 마지막 아파트 삭제 시 해당 지역을 제거해야 한다', () => {
        const result = removeFavoriteApartFromLocal(
          mockFavoriteApartList,
          '11650',
          {
            apartName: '서초아파트',
            address: '서울시 서초구 서초동',
          }
        );

        expect(result).toHaveLength(1);
        expect(result[0].regionCode).toBe('11680');
      });

      it('존재하지 않는 지역에서 삭제 시도 시 변경사항이 없어야 한다', () => {
        const result = removeFavoriteApartFromLocal(
          mockFavoriteApartList,
          '99999',
          mockApartItem
        );

        expect(result).toEqual(mockFavoriteApartList);
      });
    });
  });

  describe('서버 전용 모드 (로컬 상태만 업데이트)', () => {
    describe('updateLocalStateOnly', () => {
      it('로컬스토리지에 저장하지 않고 상태만 업데이트해야 한다', () => {
        const result = updateLocalStateOnly([], '11680', mockApartItem);

        expect(result).toHaveLength(1);
        expect(result[0].apartItems[0]).toEqual(mockApartItem);
        expect(mockSetItem).not.toHaveBeenCalled();
      });

      it('기존 지역에 아파트를 추가해야 한다', () => {
        const existingList = [
          {
            regionCode: '11680',
            apartItems: [{ apartName: '기존아파트', address: '서울시 강남구' }],
          },
        ];

        const result = updateLocalStateOnly(
          existingList,
          '11680',
          mockApartItem
        );

        expect(result[0].apartItems).toHaveLength(2);
        expect(mockSetItem).not.toHaveBeenCalled();
      });
    });

    describe('removeFromLocalStateOnly', () => {
      it('로컬스토리지에 저장하지 않고 상태에서만 삭제해야 한다', () => {
        const result = removeFromLocalStateOnly(
          mockFavoriteApartList,
          '11680',
          {
            apartName: '강남아파트',
            address: '서울시 강남구 역삼동',
          }
        );

        expect(result[0].apartItems).toHaveLength(1);
        expect(mockSetItem).not.toHaveBeenCalled();
      });

      it('마지막 아파트 삭제 시 지역을 제거해야 한다', () => {
        const result = removeFromLocalStateOnly(
          mockFavoriteApartList,
          '11650',
          {
            apartName: '서초아파트',
            address: '서울시 서초구 서초동',
          }
        );

        expect(result).toHaveLength(1);
        expect(result[0].regionCode).toBe('11680');
        expect(mockSetItem).not.toHaveBeenCalled();
      });
    });
  });

  describe('에러 처리 및 예외 상황', () => {
    it('잘못된 데이터 형식에 대해 안전하게 처리해야 한다', () => {
      mockGetItem.mockReturnValue('invalid data');

      const result = loadFavoriteApartListFromLocal();

      expect(result).toEqual([]);
    });

    it('빈 apartItems 배열을 가진 지역은 자동으로 제거되어야 한다', () => {
      const listWithEmptyRegion = [
        {
          regionCode: '11680',
          apartItems: [],
        },
      ];

      const result = addFavoriteApartToLocal(
        listWithEmptyRegion,
        '11650',
        mockApartItem
      );

      expect(result).toHaveLength(1);
      expect(result[0].regionCode).toBe('11650');
    });
  });
});
