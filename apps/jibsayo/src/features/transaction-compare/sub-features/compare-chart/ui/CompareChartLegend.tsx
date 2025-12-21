import { PageContainer } from '@/shared/ui/PageContainer';

import { X } from 'lucide-react';

import { Button } from '@package/ui';

import { ChartLegendItem } from '../types';

interface CompareChartLegendProps {
  legendData: ChartLegendItem[];
  onRemoveApartId: (apartId: number) => void;
}

export function CompareChartLegend({
  legendData,
  onRemoveApartId,
}: CompareChartLegendProps) {
  if (legendData.length === 0) return null;

  return (
    <PageContainer className="flex flex-col gap-y-2">
      <span className="text-sm text-gray-500">비교중 아파트</span>
      <div className="flex flex-wrap gap-2">
        {legendData.map(item => (
          <Button
            key={item.apartId}
            size="sm"
            className="flex items-center gap-x-2"
            style={{
              backgroundColor: item.color,
              color: 'white',
            }}
            onClick={() => onRemoveApartId(item.apartId)}
          >
            {item.apartName}
            <X size={14} />
          </Button>
        ))}
      </div>
    </PageContainer>
  );
}
