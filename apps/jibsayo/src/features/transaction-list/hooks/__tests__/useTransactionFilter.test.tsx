import * as transactionEntity from '@/entities/transaction';
import { STORAGE_KEY } from '@/shared/consts/storageKey';
import * as sessionStorage from '@/shared/lib/sessionStorage';
import { act, renderHook } from '@testing-library/react';

import { useTransactionFilter } from '../useTransactionFilter';

// Mock dependencies
jest.mock('@/shared/lib/sessionStorage');
jest.mock('@/entities/transaction');

const mockedSessionStorage = sessionStorage as jest.Mocked<
  typeof sessionStorage
>;
const mockedTransactionEntity = transactionEntity as jest.Mocked<
  typeof transactionEntity
>;

describe('useTransactionFilter - 거래 필터 Hook', () => {
  const mockSearchParams = {
    regionCode: '11680',
    tradeDate: '2024-01',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // useSearchParams mock 설정
    mockedTransactionEntity.useSearchParams.mockReturnValue({
      searchParams: mockSearchParams,
      setSearchParams: jest.fn(),
    });

    // sessionStorage mock 설정
    mockedSessionStorage.getItem.mockReturnValue(null);
    mockedSessionStorage.setItem.mockImplementation(() => {});
  });

  describe('초기 상태', () => {
    it('기본 필터 상태로 초기화되어야 한다', () => {
      const { result } = renderHook(() => useTransactionFilter());

      expect(result.current.filter).toEqual({
        apartName: '',
        isNationalSizeOnly: false,
        isFavoriteOnly: false,
        isNewTransactionOnly: false,
      });
    });

    it('세션스토리지에서 저장된 필터를 로드해야 한다', () => {
      const savedFilter = {
        apartName: '강남',
        isNationalSizeOnly: true,
        isFavoriteOnly: false,
        isNewTransactionOnly: true,
      };

      mockedSessionStorage.getItem.mockReturnValue(savedFilter);

      const { result } = renderHook(() => useTransactionFilter());

      expect(mockedSessionStorage.getItem).toHaveBeenCalledWith(
        STORAGE_KEY.TRANSACTION_LIST_FILTER
      );
      expect(result.current.filter).toEqual(savedFilter);
    });
  });

  describe('필터 업데이트', () => {
    it('부분 필터 업데이트가 가능해야 한다', () => {
      const { result } = renderHook(() => useTransactionFilter());

      act(() => {
        result.current.setFilter({ apartName: '강남아파트' });
      });

      expect(result.current.filter.apartName).toBe('강남아파트');
      expect(result.current.filter.isNationalSizeOnly).toBe(false); // 다른 필터는 유지
      expect(mockedSessionStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEY.TRANSACTION_LIST_FILTER,
        expect.objectContaining({ apartName: '강남아파트' })
      );
    });

    it('여러 필터를 동시에 업데이트할 수 있어야 한다', () => {
      const { result } = renderHook(() => useTransactionFilter());

      act(() => {
        result.current.setFilter({
          apartName: '역삼타워',
          isNationalSizeOnly: true,
          isFavoriteOnly: true,
        });
      });

      expect(result.current.filter).toEqual({
        apartName: '역삼타워',
        isNationalSizeOnly: true,
        isFavoriteOnly: true,
        isNewTransactionOnly: false,
      });
    });

    it('필터 변경 시 세션스토리지에 저장되어야 한다', () => {
      const { result } = renderHook(() => useTransactionFilter());

      const newFilter = {
        apartName: '테스트',
        isNationalSizeOnly: true,
      };

      act(() => {
        result.current.setFilter(newFilter);
      });

      expect(mockedSessionStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEY.TRANSACTION_LIST_FILTER,
        {
          apartName: '테스트',
          isNationalSizeOnly: true,
          isFavoriteOnly: false,
          isNewTransactionOnly: false,
        }
      );
    });
  });

  describe('검색 파라미터 변경 감지', () => {
    it('지역코드가 변경되면 필터를 초기화해야 한다', () => {
      const savedFilter = {
        apartName: '강남',
        isNationalSizeOnly: true,
        isFavoriteOnly: true,
        isNewTransactionOnly: true,
      };

      mockedSessionStorage.getItem.mockReturnValue(savedFilter);

      const { result, rerender } = renderHook(() => useTransactionFilter());

      // 초기 로드 시 저장된 필터 적용
      expect(result.current.filter).toEqual(savedFilter);

      // 지역코드 변경
      mockedTransactionEntity.useSearchParams.mockReturnValue({
        searchParams: {
          regionCode: '11650', // 다른 지역
          tradeDate: '2024-01',
        },
        setSearchParams: jest.fn(),
      });

      rerender();

      // 필터 초기화 확인
      expect(result.current.filter).toEqual({
        apartName: '',
        isNationalSizeOnly: false,
        isFavoriteOnly: false,
        isNewTransactionOnly: false,
      });

      expect(mockedSessionStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEY.TRANSACTION_LIST_FILTER,
        {
          apartName: '',
          isNationalSizeOnly: false,
          isFavoriteOnly: false,
          isNewTransactionOnly: false,
        }
      );
    });

    it('거래일이 변경되면 필터를 초기화해야 한다', () => {
      const savedFilter = {
        apartName: '강남',
        isNationalSizeOnly: true,
        isFavoriteOnly: true,
        isNewTransactionOnly: true,
      };

      mockedSessionStorage.getItem.mockReturnValue(savedFilter);

      const { result, rerender } = renderHook(() => useTransactionFilter());

      expect(result.current.filter).toEqual(savedFilter);

      // 거래일 변경
      mockedTransactionEntity.useSearchParams.mockReturnValue({
        searchParams: {
          regionCode: '11680',
          tradeDate: '2024-02', // 다른 월
        },
        setSearchParams: jest.fn(),
      });

      rerender();

      expect(result.current.filter).toEqual({
        apartName: '',
        isNationalSizeOnly: false,
        isFavoriteOnly: false,
        isNewTransactionOnly: false,
      });
    });

    it('지역코드와 거래일이 모두 변경되면 필터를 초기화해야 한다', () => {
      const savedFilter = {
        apartName: '강남',
        isNationalSizeOnly: true,
        isFavoriteOnly: true,
        isNewTransactionOnly: true,
      };

      mockedSessionStorage.getItem.mockReturnValue(savedFilter);

      const { result, rerender } = renderHook(() => useTransactionFilter());

      expect(result.current.filter).toEqual(savedFilter);

      // 지역코드와 거래일 모두 변경
      mockedTransactionEntity.useSearchParams.mockReturnValue({
        searchParams: {
          regionCode: '11650',
          tradeDate: '2024-02',
        },
        setSearchParams: jest.fn(),
      });

      rerender();

      expect(result.current.filter).toEqual({
        apartName: '',
        isNationalSizeOnly: false,
        isFavoriteOnly: false,
        isNewTransactionOnly: false,
      });
    });

    it('검색 파라미터가 변경되지 않으면 필터를 유지해야 한다', () => {
      const savedFilter = {
        apartName: '강남',
        isNationalSizeOnly: true,
        isFavoriteOnly: true,
        isNewTransactionOnly: true,
      };

      mockedSessionStorage.getItem.mockReturnValue(savedFilter);

      const { result, rerender } = renderHook(() => useTransactionFilter());

      expect(result.current.filter).toEqual(savedFilter);

      // 같은 검색 파라미터로 다시 렌더링
      rerender();

      expect(result.current.filter).toEqual(savedFilter);
    });
  });

  describe('개별 필터 테스트', () => {
    it('아파트명 필터를 설정할 수 있어야 한다', () => {
      const { result } = renderHook(() => useTransactionFilter());

      act(() => {
        result.current.setFilter({ apartName: '강남아파트' });
      });

      expect(result.current.filter.apartName).toBe('강남아파트');
    });

    it('국민평수 필터를 토글할 수 있어야 한다', () => {
      const { result } = renderHook(() => useTransactionFilter());

      act(() => {
        result.current.setFilter({ isNationalSizeOnly: true });
      });

      expect(result.current.filter.isNationalSizeOnly).toBe(true);

      act(() => {
        result.current.setFilter({ isNationalSizeOnly: false });
      });

      expect(result.current.filter.isNationalSizeOnly).toBe(false);
    });

    it('즐겨찾기 전용 필터를 토글할 수 있어야 한다', () => {
      const { result } = renderHook(() => useTransactionFilter());

      act(() => {
        result.current.setFilter({ isFavoriteOnly: true });
      });

      expect(result.current.filter.isFavoriteOnly).toBe(true);

      act(() => {
        result.current.setFilter({ isFavoriteOnly: false });
      });

      expect(result.current.filter.isFavoriteOnly).toBe(false);
    });

    it('신규 거래 필터를 토글할 수 있어야 한다', () => {
      const { result } = renderHook(() => useTransactionFilter());

      act(() => {
        result.current.setFilter({ isNewTransactionOnly: true });
      });

      expect(result.current.filter.isNewTransactionOnly).toBe(true);

      act(() => {
        result.current.setFilter({ isNewTransactionOnly: false });
      });

      expect(result.current.filter.isNewTransactionOnly).toBe(false);
    });
  });

  describe('복합 시나리오', () => {
    it('필터 설정 후 검색 파라미터 변경 시 초기화되어야 한다', () => {
      const { result, rerender } = renderHook(() => useTransactionFilter());

      // 필터 설정
      act(() => {
        result.current.setFilter({
          apartName: '강남아파트',
          isNationalSizeOnly: true,
          isFavoriteOnly: true,
        });
      });

      expect(result.current.filter.apartName).toBe('강남아파트');

      // 검색 파라미터 변경
      mockedTransactionEntity.useSearchParams.mockReturnValue({
        searchParams: {
          regionCode: '11650',
          tradeDate: '2024-02',
        },
        setSearchParams: jest.fn(),
      });

      rerender();

      // 필터 초기화 확인
      expect(result.current.filter).toEqual({
        apartName: '',
        isNationalSizeOnly: false,
        isFavoriteOnly: false,
        isNewTransactionOnly: false,
      });
    });

    it('여러 번의 필터 변경이 누적되어야 한다', () => {
      const { result } = renderHook(() => useTransactionFilter());

      act(() => {
        result.current.setFilter({ apartName: '강남' });
      });

      act(() => {
        result.current.setFilter({ isNationalSizeOnly: true });
      });

      act(() => {
        result.current.setFilter({ isFavoriteOnly: true });
      });

      expect(result.current.filter).toEqual({
        apartName: '강남',
        isNationalSizeOnly: true,
        isFavoriteOnly: true,
        isNewTransactionOnly: false,
      });
    });
  });

  describe('에러 처리', () => {
    it('세션스토리지 접근 실패 시 기본값을 사용해야 한다', () => {
      mockedSessionStorage.getItem.mockImplementation(() => {
        throw new Error('SessionStorage access denied');
      });

      const { result } = renderHook(() => useTransactionFilter());

      expect(result.current.filter).toEqual({
        apartName: '',
        isNationalSizeOnly: false,
        isFavoriteOnly: false,
        isNewTransactionOnly: false,
      });
    });

    it('세션스토리지 저장 실패 시에도 상태는 업데이트되어야 한다', () => {
      mockedSessionStorage.setItem.mockImplementation(() => {
        throw new Error('SessionStorage save failed');
      });

      const { result } = renderHook(() => useTransactionFilter());

      act(() => {
        result.current.setFilter({ apartName: '강남아파트' });
      });

      expect(result.current.filter.apartName).toBe('강남아파트');
    });
  });
});
