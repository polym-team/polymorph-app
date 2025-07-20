import * as transactionEntity from '@/entities/transaction';
import { act, renderHook } from '@testing-library/react';

import { useTransactionFilter } from '../useTransactionFilter';

// Mock dependencies
jest.mock('@/entities/transaction');

const mockedTransactionEntity = transactionEntity as jest.Mocked<
  typeof transactionEntity
>;

// Mock window.location
const mockLocation = {
  search: '',
};

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

describe('useTransactionFilter - 거래 필터 Hook (쿼리파라미터 기반)', () => {
  const mockSetSearchParams = jest.fn();
  const mockSearchParams = {
    regionCode: '11680',
    tradeDate: '2024-01',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocation.search = '';

    // useSearchParams mock 설정
    mockedTransactionEntity.useSearchParams.mockReturnValue({
      searchParams: mockSearchParams,
      setSearchParams: mockSetSearchParams,
    });
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

    it('URL 쿼리파라미터에서 필터를 로드해야 한다', () => {
      // URL에 필터 쿼리파라미터 설정
      mockLocation.search =
        '?regionCode=11680&tradeDate=2024-01&apartName=강남&nationalSizeOnly=true&favoriteOnly=true&newTransactionOnly=false';

      const { result } = renderHook(() => useTransactionFilter());

      expect(result.current.filter).toEqual({
        apartName: '강남',
        isNationalSizeOnly: true,
        isFavoriteOnly: true,
        isNewTransactionOnly: false,
      });
    });

    it('일부 필터만 URL에 있을 때 나머지는 기본값이어야 한다', () => {
      mockLocation.search =
        '?regionCode=11680&apartName=강남&favoriteOnly=true';

      const { result } = renderHook(() => useTransactionFilter());

      expect(result.current.filter).toEqual({
        apartName: '강남',
        isNationalSizeOnly: false,
        isFavoriteOnly: true,
        isNewTransactionOnly: false,
      });
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

      expect(mockSetSearchParams).toHaveBeenCalledWith({
        regionCode: '11680',
        tradeDate: '2024-01',
        apartName: '강남아파트',
      });
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

      expect(mockSetSearchParams).toHaveBeenCalledWith({
        regionCode: '11680',
        tradeDate: '2024-01',
        apartName: '역삼타워',
        nationalSizeOnly: 'true',
        favoriteOnly: 'true',
      });
    });

    it('필터 변경 시 쿼리파라미터가 업데이트되어야 한다', () => {
      const { result } = renderHook(() => useTransactionFilter());

      act(() => {
        result.current.setFilter({
          apartName: '테스트',
          isNationalSizeOnly: true,
          isNewTransactionOnly: true,
        });
      });

      expect(mockSetSearchParams).toHaveBeenCalledWith({
        regionCode: '11680',
        tradeDate: '2024-01',
        apartName: '테스트',
        nationalSizeOnly: 'true',
        newTransactionOnly: 'true',
      });
    });

    it('false인 boolean 필터는 쿼리파라미터에 포함되지 않아야 한다', () => {
      const { result } = renderHook(() => useTransactionFilter());

      act(() => {
        result.current.setFilter({
          apartName: '테스트',
          isNationalSizeOnly: false,
          isFavoriteOnly: false,
          isNewTransactionOnly: false,
        });
      });

      expect(mockSetSearchParams).toHaveBeenCalledWith({
        regionCode: '11680',
        tradeDate: '2024-01',
        apartName: '테스트',
      });
    });

    it('빈 문자열인 apartName은 쿼리파라미터에 포함되지 않아야 한다', () => {
      const { result } = renderHook(() => useTransactionFilter());

      act(() => {
        result.current.setFilter({
          apartName: '',
          isNationalSizeOnly: true,
        });
      });

      expect(mockSetSearchParams).toHaveBeenCalledWith({
        regionCode: '11680',
        tradeDate: '2024-01',
        nationalSizeOnly: 'true',
      });
    });
  });

  describe('검색 파라미터 변경 감지', () => {
    it('지역코드가 변경되면 필터를 초기화해야 한다', () => {
      // 초기 필터 설정
      mockLocation.search = '?apartName=강남&nationalSizeOnly=true';
      const { result, rerender } = renderHook(() => useTransactionFilter());

      expect(result.current.filter.apartName).toBe('강남');

      // 지역코드 변경
      mockedTransactionEntity.useSearchParams.mockReturnValue({
        searchParams: {
          regionCode: '11650', // 다른 지역
          tradeDate: '2024-01',
        },
        setSearchParams: mockSetSearchParams,
      });

      rerender();

      // 필터 초기화 확인
      expect(result.current.filter).toEqual({
        apartName: '',
        isNationalSizeOnly: false,
        isFavoriteOnly: false,
        isNewTransactionOnly: false,
      });

      expect(mockSetSearchParams).toHaveBeenCalledWith({
        regionCode: '11650',
        tradeDate: '2024-01',
      });
    });

    it('거래일이 변경되면 필터를 초기화해야 한다', () => {
      // 초기 필터 설정
      mockLocation.search = '?apartName=강남&nationalSizeOnly=true';
      const { result, rerender } = renderHook(() => useTransactionFilter());

      expect(result.current.filter.apartName).toBe('강남');

      // 거래일 변경
      mockedTransactionEntity.useSearchParams.mockReturnValue({
        searchParams: {
          regionCode: '11680',
          tradeDate: '2024-02', // 다른 월
        },
        setSearchParams: mockSetSearchParams,
      });

      rerender();

      expect(result.current.filter).toEqual({
        apartName: '',
        isNationalSizeOnly: false,
        isFavoriteOnly: false,
        isNewTransactionOnly: false,
      });

      expect(mockSetSearchParams).toHaveBeenCalledWith({
        regionCode: '11680',
        tradeDate: '2024-02',
      });
    });

    it('검색 파라미터가 변경되지 않으면 필터를 유지해야 한다', () => {
      mockLocation.search = '?apartName=강남&nationalSizeOnly=true';
      const { result, rerender } = renderHook(() => useTransactionFilter());

      const initialFilter = result.current.filter;

      // 같은 검색 파라미터로 다시 렌더링
      rerender();

      expect(result.current.filter).toEqual(initialFilter);
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
        setSearchParams: mockSetSearchParams,
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

  describe('쿼리파라미터 파싱', () => {
    it('boolean 값이 올바르게 파싱되어야 한다', () => {
      mockLocation.search =
        '?nationalSizeOnly=true&favoriteOnly=false&newTransactionOnly=true';

      const { result } = renderHook(() => useTransactionFilter());

      expect(result.current.filter.isNationalSizeOnly).toBe(true);
      expect(result.current.filter.isFavoriteOnly).toBe(false);
      expect(result.current.filter.isNewTransactionOnly).toBe(true);
    });

    it('잘못된 boolean 값은 false로 처리되어야 한다', () => {
      mockLocation.search =
        '?nationalSizeOnly=invalid&favoriteOnly=&newTransactionOnly=1';

      const { result } = renderHook(() => useTransactionFilter());

      expect(result.current.filter.isNationalSizeOnly).toBe(false);
      expect(result.current.filter.isFavoriteOnly).toBe(false);
      expect(result.current.filter.isNewTransactionOnly).toBe(false);
    });
  });
});
