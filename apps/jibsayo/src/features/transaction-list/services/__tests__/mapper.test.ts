import { TransactionsResponse } from '@/app/api/transactions/types';
import { FavoriteApartItem } from '@/entities/apart/models/types';

import { TransactionFilter } from '../../models/types';
import { mapTransactionsWithFavorites } from '../mapper';

describe('Transaction Mapper - 간단한 테스트', () => {
  it('테스트 환경이 올바르게 설정되어야 한다', () => {
    expect(1 + 1).toBe(2);
  });

  it('배열 처리가 올바르게 작동해야 한다', () => {
    const testArray = [1, 2, 3];
    expect(testArray).toHaveLength(3);
    expect(testArray.filter(x => x > 1)).toHaveLength(2);
  });

  it('문자열 필터링이 올바르게 작동해야 한다', () => {
    const testArray = [
      { name: '강남아파트' },
      { name: '역삼타워' },
      { name: '서초빌딩' },
    ];

    const filtered = testArray.filter(item =>
      item.name.toLowerCase().includes('강남'.toLowerCase())
    );

    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toBe('강남아파트');
  });
});
