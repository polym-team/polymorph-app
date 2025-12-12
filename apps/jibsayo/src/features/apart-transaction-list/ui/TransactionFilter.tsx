import { calculateAreaPyeong } from '@/entities/transaction';
import { HorizontalScrollContainer } from '@/shared/ui/HorizontalScrollContainer';
import { formatPyeongText } from '@/shared/utils/formatter';

import { Button, Card } from '@package/ui';

import { CHART_COLORS, PERIODS } from '../consts';
import { PeriodValue, SizesValue } from '../types';

interface TransactionFilterProps {
  allSizes: SizesValue;
  selectedPeriod: PeriodValue;
  selectedSizes: SizesValue;
  onChangePeriod: (value: PeriodValue) => void;
  onChangeSizes: (value: SizesValue) => void;
}

export function TransactionFilter({
  allSizes,
  selectedPeriod,
  selectedSizes,
  onChangePeriod,
  onChangeSizes,
}: TransactionFilterProps) {
  return (
    <Card className="flex flex-col">
      <div className="<spa flex flex-col gap-y-2 p-2 lg:p-4">
        {/* <span className="m-1 text-sm text-gray-500">기간 선택</span> */}
        <HorizontalScrollContainer className="gap-x-1">
          {PERIODS.map(p => (
            <Button
              key={p.value}
              size="sm"
              className="lg:text-base"
              variant={selectedPeriod === p.value ? 'primary-light' : 'ghost'}
              onClick={() => onChangePeriod(p.value)}
            >
              {p.label}
            </Button>
          ))}
        </HorizontalScrollContainer>
      </div>
      <hr className="border-gray-100" />
      <div className="flex flex-col gap-y-2 p-2 lg:p-4">
        {/* <span className="m-1 text-sm text-gray-500">평형 선택</span> */}
        <HorizontalScrollContainer className="gap-x-1">
          {allSizes.map((size, index) => {
            const isSelected = selectedSizes.some(
              selectedSize =>
                selectedSize[0] === size[0] && selectedSize[1] === size[1]
            );
            const minPyeong = calculateAreaPyeong(size[0]);
            const maxPyeong = calculateAreaPyeong(size[1]);

            return (
              <Button
                key={`${size[0]}-${size[1]}`}
                size="sm"
                rounded
                variant="outline"
                style={{
                  ...(isSelected && {
                    borderColor: CHART_COLORS[index % CHART_COLORS.length],
                    backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                    color: 'white',
                  }),
                }}
                onClick={() =>
                  onChangeSizes(
                    isSelected
                      ? selectedSizes.filter(
                          s => !(s[0] === size[0] && s[1] === size[1])
                        )
                      : [...selectedSizes, size]
                  )
                }
              >
                <span
                  className="block h-2 w-2 rounded-sm"
                  style={{
                    ...(isSelected
                      ? {
                          backgroundColor: 'white',
                        }
                      : {
                          backgroundColor:
                            CHART_COLORS[index % CHART_COLORS.length],
                        }),
                  }}
                />
                {minPyeong !== maxPyeong ? (
                  <>
                    {formatPyeongText(minPyeong)} ~{' '}
                    {formatPyeongText(maxPyeong)}
                  </>
                ) : (
                  formatPyeongText(minPyeong)
                )}
              </Button>
            );
          })}
        </HorizontalScrollContainer>
      </div>
    </Card>
  );
}
