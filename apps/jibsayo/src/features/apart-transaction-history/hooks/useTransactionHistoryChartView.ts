import { formatKoreanAmountSimpleText } from '@/shared/utils/formatters';

import * as d3 from 'd3';
import { useEffect, useMemo, useRef, useState } from 'react';

import {
  LegendItem,
  TransactionHistoryChartData,
} from './useTransactionHistoryChartData';

interface UseTransactionHistoryChartViewProps {
  chartData: TransactionHistoryChartData[];
  legendData: LegendItem[];
  height: number;
}

const MARGIN = { top: 20, right: 35, bottom: 30, left: 30 };

export const useTransactionHistoryChartView = ({
  chartData,
  legendData,
  height,
}: UseTransactionHistoryChartViewProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [containerWidth, setContainerWidth] = useState(1024);

  // 컨테이너 너비 감지
  useEffect(() => {
    if (!svgRef.current?.parentElement) return;

    const updateWidth = () => {
      const parentElement = svgRef.current?.parentElement;
      if (parentElement) {
        const parentWidth = parentElement.clientWidth;
        setContainerWidth(parentWidth);
      }
    };

    updateWidth();
    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(svgRef.current.parentElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, [svgRef]);

  // 차트 영역 크기 계산
  const chartWidth = Math.max(containerWidth - MARGIN.left - MARGIN.right, 0);
  const chartHeight = height - MARGIN.top - MARGIN.bottom;

  // 스케일 계산
  const xScale = useMemo(() => {
    if (!chartData.length) {
      return d3.scalePoint().domain([]).range([0, chartWidth]);
    }

    // 실제 데이터가 있는 날짜들만 추출하고 정렬
    const uniqueDates = Array.from(
      new Set(chartData.map(d => d.date.getTime()))
    )
      .map(time => new Date(time))
      .sort((a, b) => a.getTime() - b.getTime());

    // 날짜를 문자열로 변환하여 도메인으로 사용
    const dateStrings = uniqueDates.map(date => d3.timeFormat('%Y-%m')(date));

    // 바의 너비 계산
    const barMargin = 0.5;
    const barWidth =
      dateStrings.length > 0
        ? Math.max(
            1,
            (chartWidth - dateStrings.length * barMargin) / dateStrings.length
          )
        : 0;

    // 바가 차트 영역을 벗어나지 않도록 range 조정
    const marginPadding = Math.max(barWidth / 2, 10);

    return d3
      .scalePoint()
      .domain(dateStrings)
      .range([marginPadding, chartWidth - marginPadding])
      .padding(0);
  }, [chartData, chartWidth]);

  const yPriceScale = useMemo(() => {
    if (!chartData.length) {
      return d3.scaleLinear().domain([0, 100000]).range([chartHeight, 0]);
    }

    const maxPrice = d3.max(chartData, d => d.averagePrice) || 0;
    return d3
      .scaleLinear()
      .domain([0, maxPrice * 1.1])
      .range([chartHeight, 0]);
  }, [chartData, chartHeight]);

  const yCountScale = useMemo(() => {
    if (!chartData.length) {
      return d3.scaleLinear().domain([0, 10]).range([chartHeight, 0]);
    }

    // 날짜별 거래건수 합산하여 최대값 계산
    const dateCountMap = new Map<string, number>();
    chartData.forEach(d => {
      const dateKey = d3.timeFormat('%Y-%m')(d.date);
      dateCountMap.set(dateKey, (dateCountMap.get(dateKey) || 0) + d.count);
    });

    const maxCount = Math.max(...Array.from(dateCountMap.values())) || 0;
    return d3
      .scaleLinear()
      .domain([0, maxCount * 1.1])
      .range([chartHeight, 0]);
  }, [chartData, chartHeight]);

  // 날짜를 문자열로 변환하는 헬퍼 함수
  const formatDateForScale = (date: Date) => d3.timeFormat('%Y-%m')(date);

  // 차트 렌더링
  useEffect(() => {
    if (
      !svgRef.current ||
      !chartData.length ||
      chartWidth <= 0 ||
      chartHeight <= 0
    ) {
      setIsLoading(false);
      return;
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg
      .append('g')
      .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

    // 툴팁 생성
    if (!tooltipRef.current) {
      tooltipRef.current = d3
        .select(svgRef.current?.parentElement)
        .append('div')
        .style('position', 'absolute')
        .style('visibility', 'hidden')
        .style('background-color', '#404040')
        .style('color', 'white')
        .style('padding', '12px 16px')
        .style('border-radius', '8px')
        .style('font-size', '13px')
        .style('pointer-events', 'none')
        .style('z-index', '10')
        .style('box-shadow', '0 4px 6px rgba(0, 0, 0, 0.1)')
        .style('max-height', '300px')
        .style('overflow-y', 'auto')
        .node() as HTMLDivElement;
    }

    // x축
    const allDates = xScale.domain();
    const yearFirstDates = new Map<string, string>();
    allDates.forEach(dateString => {
      const year = dateString.split('-')[0];
      if (!yearFirstDates.has(year)) {
        yearFirstDates.set(year, dateString);
      }
    });

    const yearTicks = Array.from(yearFirstDates.values()).sort();
    const displayTicks = yearTicks.filter((_, index) => index % 2 === 0);

    const xAxis = g
      .append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(
        d3
          .axisBottom(xScale)
          .tickValues(displayTicks)
          .tickFormat(dateString => {
            return dateString.split('-')[0];
          })
      );

    xAxis
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-0.8em')
      .attr('dy', '0.15em')
      .attr('transform', 'rotate(-45)');

    // 왼쪽 y축 (가격)
    g.append('g').call(
      d3
        .axisLeft(yPriceScale)
        .tickFormat(d => `${Math.round(Number(d) / 100000000)}억`)
        .tickValues(yPriceScale.ticks().filter(tick => tick > 0))
    );

    // 오른쪽 y축 (건수)
    g.append('g')
      .attr('transform', `translate(${chartWidth},0)`)
      .call(d3.axisRight(yCountScale).tickFormat(d => `${d}건`));

    // 평형별로 그룹화
    const pyeongGroups = d3.group(chartData, d => d.pyeong);

    // 날짜별 거래건수 합산 (바 차트용)
    const dateCountMap = new Map<string, number>();
    chartData.forEach(d => {
      const dateKey = formatDateForScale(d.date);
      dateCountMap.set(dateKey, (dateCountMap.get(dateKey) || 0) + d.count);
    });

    const uniqueDates = Array.from(dateCountMap.keys()).sort();
    const barWidth = 2;

    // 거래건수 바 차트
    uniqueDates.forEach(dateString => {
      const totalCount = dateCountMap.get(dateString) || 0;
      const xPos = xScale(dateString) || 0;

      const bar = g
        .append('rect')
        .attr('class', 'count-bar')
        .attr('x', xPos - barWidth / 2)
        .attr('width', barWidth)
        .attr('fill', '#e5e7eb')
        .attr('opacity', 0.7);

      bar
        .attr('y', chartHeight)
        .attr('height', 0)
        .transition()
        .duration(500)
        .delay((_, i) => i * 30)
        .attr('y', yCountScale(totalCount))
        .attr('height', chartHeight - yCountScale(totalCount));
    });

    // 평형별 실거래가 라인 차트
    Array.from(pyeongGroups, ([pyeong, data]) => {
      const color =
        legendData.findIndex(l => l.pyeong === pyeong) % legendData.length >= 0
          ? legendData[
              legendData.findIndex(l => l.pyeong === pyeong) % legendData.length
            ]?.color || '#3b82f6'
          : '#3b82f6';

      const line = d3
        .line<TransactionHistoryChartData>()
        .x(d => xScale(formatDateForScale(d.date)) || 0)
        .y(d => yPriceScale(d.averagePrice))
        .curve(d3.curveMonotoneX);

      const path = g
        .append('path')
        .datum(data.sort((a, b) => a.date.getTime() - b.date.getTime()))
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 2)
        .attr('d', line);

      path
        .attr('stroke-dasharray', function () {
          return this.getTotalLength();
        })
        .attr('stroke-dashoffset', function () {
          return this.getTotalLength();
        })
        .transition()
        .duration(600)
        .delay((_, i) => i * 100)
        .attr('stroke-dashoffset', 0);
    });

    // 인터랙션용 수직선 생성
    const verticalLine = g
      .append('line')
      .attr('class', 'vertical-guide-line')
      .attr('stroke', '#000000')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '2 2')
      .style('opacity', 0)
      .attr('y1', 0)
      .attr('y2', chartHeight);

    // 인터랙션 레이어 추가
    const interactionLayer = g
      .append('rect')
      .attr('class', 'interaction-layer')
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .attr('fill', 'transparent')
      .style('cursor', 'crosshair');

    // 가장 가까운 날짜 찾기 함수
    const findNearestDate = (mouseX: number): string | null => {
      let nearestDate: string | null = null;
      let minDistance = Infinity;

      uniqueDates.forEach(dateString => {
        const xPos = xScale(dateString) || 0;
        const distance = Math.abs(mouseX - xPos);
        if (distance < minDistance) {
          minDistance = distance;
          nearestDate = dateString;
        }
      });

      return nearestDate;
    };

    // 툴팁 표시 함수
    const showTooltip = (dateString: string) => {
      const xPos = xScale(dateString) || 0;

      // y축 구분선 표시
      verticalLine.attr('x1', xPos).attr('x2', xPos).style('opacity', 1);

      // 날짜 포맷 (YYYY-MM -> YYYY년 M월)
      const [year, month] = dateString.split('-');
      const formattedDate = `${year}년 ${parseInt(month)}월`;

      // 해당 날짜의 평형별 데이터 가져오기
      const dataForDate = chartData.filter(
        d => formatDateForScale(d.date) === dateString
      );

      // 평형별로 그룹화하고 정렬
      const pyeongDataMap = new Map<
        number,
        { count: number; totalPrice: number }
      >();
      dataForDate.forEach(d => {
        const existing = pyeongDataMap.get(d.pyeong) || {
          count: 0,
          totalPrice: 0,
        };
        pyeongDataMap.set(d.pyeong, {
          count: existing.count + d.count,
          totalPrice: existing.totalPrice + d.averagePrice * d.count,
        });
      });

      // 평형 오름차순 정렬
      const sortedPyeongData = Array.from(pyeongDataMap.entries()).sort(
        (a, b) => a[0] - b[0]
      );

      // 평형별 데이터 HTML 생성
      const pyeongDataHTML = sortedPyeongData
        .map(([pyeong, data]) => {
          const avgPrice = data.totalPrice / data.count;
          const formattedPrice = formatKoreanAmountSimpleText(avgPrice).replace(
            '원',
            ''
          );
          return `
            <div style="font-size: 12px; margin-top: 2px;">- <strong>${pyeong}평</strong>: ${data.count}건 / 평균 ${formattedPrice}</div>
          `;
        })
        .join('');

      // 툴팁 내용
      const tooltipContent = `
        <div style="line-height: 1.6;">
          <div style="font-weight: 600; margin-bottom: 4px;">${formattedDate}</div>
          ${pyeongDataHTML}
        </div>
      `;

      if (tooltipRef.current) {
        tooltipRef.current.innerHTML = tooltipContent;
        tooltipRef.current.style.visibility = 'visible';

        // 툴팁 위치 계산 (차트 컨테이너 기준 상대 좌표)
        const tooltipWidth = tooltipRef.current.offsetWidth;
        const chartCenter = chartWidth / 2;
        const tooltipOffset = 12; // 구분선과 툴팁 사이 간격

        // 좌측/우측 판단
        const isLeftSide = xPos < chartCenter;

        let tooltipLeft: number;
        if (isLeftSide) {
          // 좌측: 구분선 우측에 배치
          tooltipLeft = MARGIN.left + xPos + tooltipOffset;
        } else {
          // 우측: 구분선 좌측에 배치
          tooltipLeft = MARGIN.left + xPos - tooltipWidth - tooltipOffset;
        }

        // 툴팁이 차트 영역을 벗어나지 않도록 제한
        const minLeft = MARGIN.left + 8;
        const maxLeft = MARGIN.left + chartWidth - tooltipWidth - 8;
        tooltipLeft = Math.max(minLeft, Math.min(maxLeft, tooltipLeft));

        tooltipRef.current.style.left = `${tooltipLeft}px`;
        tooltipRef.current.style.top = `${MARGIN.top + 10}px`;
      }
    };

    // 툴팁 숨김 함수
    const hideTooltip = () => {
      verticalLine.style('opacity', 0);
      if (tooltipRef.current) {
        tooltipRef.current.style.visibility = 'hidden';
      }
    };

    // 이벤트 핸들러
    let isInteracting = false;

    const handlePointerMove = (event: PointerEvent) => {
      if (!isInteracting) return;

      const svgRect = svgRef.current?.getBoundingClientRect();
      if (!svgRect) return;

      const mouseX = event.clientX - svgRect.left - MARGIN.left;
      const nearestDate = findNearestDate(mouseX);

      if (nearestDate) {
        showTooltip(nearestDate);
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      isInteracting = true;
      handlePointerMove(event);
    };

    const handlePointerUp = () => {
      isInteracting = false;
      hideTooltip();
    };

    const handlePointerLeave = () => {
      if (isInteracting) {
        isInteracting = false;
        hideTooltip();
      }
    };

    // 이벤트 리스너 등록
    const interactionNode = interactionLayer.node();
    if (interactionNode) {
      interactionNode.addEventListener('pointerdown', handlePointerDown);
      interactionNode.addEventListener('pointermove', handlePointerMove);
      interactionNode.addEventListener('pointerup', handlePointerUp);
      interactionNode.addEventListener('pointerleave', handlePointerLeave);
      interactionNode.addEventListener('pointercancel', handlePointerUp);
    }

    setIsLoading(false);

    // 최초 진입 시 가장 우측 툴팁 자동 노출
    if (uniqueDates.length > 0) {
      const lastDate = uniqueDates[uniqueDates.length - 1];
      // 애니메이션 완료 후 툴팁 표시
      setTimeout(() => {
        showTooltip(lastDate);
      }, 800);
    }

    // 클린업
    return () => {
      if (interactionNode) {
        interactionNode.removeEventListener('pointerdown', handlePointerDown);
        interactionNode.removeEventListener('pointermove', handlePointerMove);
        interactionNode.removeEventListener('pointerup', handlePointerUp);
        interactionNode.removeEventListener('pointerleave', handlePointerLeave);
        interactionNode.removeEventListener('pointercancel', handlePointerUp);
      }
    };
  }, [
    chartData,
    chartWidth,
    chartHeight,
    xScale,
    yPriceScale,
    yCountScale,
    containerWidth,
    legendData,
  ]);

  return {
    svgRef,
    isLoading,
    containerWidth,
    chartWidth,
    chartHeight,
  };
};
