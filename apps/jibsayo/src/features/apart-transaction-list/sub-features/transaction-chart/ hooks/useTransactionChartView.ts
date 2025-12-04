import { formatKoreanAmountText } from '@/shared/utils/formatter';

import * as d3 from 'd3';
import { useEffect, useMemo, useRef, useState } from 'react';

import { ChartLegendItem, TransactionChartData } from '../type';

interface UseTransactionHistoryChartViewProps {
  chartData: TransactionChartData[];
  legendData: ChartLegendItem[];
  height: number;
}

const MARGIN = { top: 20, right: 0, bottom: 30, left: 30 };

export const useTransactionChartView = ({
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

  // 차트 영역 크기 계산 (상하로 분리)
  const chartWidth = Math.max(containerWidth - MARGIN.left - MARGIN.right, 0);
  const totalHeight = height - MARGIN.top - MARGIN.bottom;
  const chartGap = 20; // 상하 차트 사이 간격
  const priceChartHeight = Math.floor(((totalHeight - chartGap) * 3) / 4);
  const countChartHeight = Math.floor(((totalHeight - chartGap) * 1) / 4);

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
      return d3.scaleLinear().domain([0, 100000]).range([priceChartHeight, 0]);
    }

    const maxPrice = d3.max(chartData, d => d.averagePrice) || 0;
    return d3
      .scaleLinear()
      .domain([0, maxPrice * 1.1])
      .range([priceChartHeight, 0]);
  }, [chartData, priceChartHeight]);

  const yCountScale = useMemo(() => {
    if (!chartData.length) {
      return d3.scaleLinear().domain([0, 10]).range([countChartHeight, 0]);
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
      .range([countChartHeight, 0]);
  }, [chartData, countChartHeight]);

  // 날짜를 문자열로 변환하는 헬퍼 함수
  const formatDateForScale = (date: Date) => d3.timeFormat('%Y-%m')(date);

  // 차트 렌더링
  useEffect(() => {
    if (
      !svgRef.current ||
      !chartData.length ||
      chartWidth <= 0 ||
      priceChartHeight <= 0 ||
      countChartHeight <= 0
    ) {
      setIsLoading(false);
      return;
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // 상단 차트 그룹 (가격)
    const priceGroup = svg
      .append('g')
      .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

    // 하단 차트 그룹 (건수)
    const countGroup = svg
      .append('g')
      .attr(
        'transform',
        `translate(${MARGIN.left},${MARGIN.top + priceChartHeight + chartGap})`
      );

    // 툴팁 생성
    if (!tooltipRef.current) {
      tooltipRef.current = d3
        .select(svgRef.current?.parentElement)
        .append('div')
        .attr(
          'class',
          'absolute bg-white border shadow pointer-events-none z-10 max-h-[300px] overflow-y-auto min-w-[150px] p-4 rounded-lg transition-all duration-200 ease-out'
        )
        .style('opacity', '0')
        .node() as HTMLDivElement;
    }

    // x축 (하단 차트에만)
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

    const xAxis = countGroup
      .append('g')
      .attr('transform', `translate(0,${countChartHeight})`)
      .call(
        d3
          .axisBottom(xScale)
          .tickValues(displayTicks)
          .tickFormat(dateString => {
            const [year, month] = dateString.split('-');
            return `${year.slice(-2)}.${month}`; // 2024-01 -> 24.01
          })
          .tickSize(0)
      );

    // x축 도메인 라인 제거
    xAxis.select('.domain').remove();

    xAxis.selectAll('text').style('text-anchor', 'middle').attr('dy', '1em');

    // 왼쪽 y축 (상단: 가격) - 5억 단위로 8개 틱
    const maxPrice = yPriceScale.domain()[1];
    const minPrice = yPriceScale.domain()[0];

    // 5억 단위로 조정
    const tickInterval = 500000000; // 5억
    const startTick = Math.ceil(minPrice / tickInterval) * tickInterval;
    const endTick = Math.floor(maxPrice / tickInterval) * tickInterval;

    const priceTickValues = [];
    for (let tick = startTick; tick <= endTick; tick += tickInterval) {
      priceTickValues.push(tick);
    }

    // 8개를 초과하면 간격을 늘려서 조정
    if (priceTickValues.length > 8) {
      const adjustedInterval =
        Math.ceil((endTick - startTick) / (8 - 1) / tickInterval) *
        tickInterval;
      priceTickValues.length = 0;
      for (let tick = startTick; tick <= endTick; tick += adjustedInterval) {
        priceTickValues.push(tick);
      }
    }

    const priceAxis = priceGroup.append('g').call(
      d3
        .axisLeft(yPriceScale)
        .tickFormat(d => `${Math.round(Number(d) / 100000000)}억`)
        .tickValues(priceTickValues)
        .tickSize(0)
    );

    // 가격 그리드 라인 추가 (연한 수평선) - 자동 계산된 틱 값 사용
    priceAxis.selectAll('.tick').each(function () {
      const tickValue = d3.select(this).datum() as number;
      priceGroup
        .append('line')
        .attr('x1', 0)
        .attr('x2', chartWidth)
        .attr('y1', yPriceScale(tickValue))
        .attr('y2', yPriceScale(tickValue))
        .attr('stroke', '#e5e7eb')
        .attr('stroke-width', 1)
        .attr('opacity', 0.5);
    });

    // y축 도메인 라인 제거
    priceAxis.select('.domain').remove();

    // 왼쪽 y축 (하단: 건수) - 최대 5개 tick
    const maxCount = yCountScale.domain()[1];
    const countTickValues = [];
    const tickCount = 5;
    const interval = Math.ceil(maxCount / (tickCount - 1) / 5) * 5; // 5의 배수로 올림

    for (let i = interval; i <= maxCount; i += interval) {
      if (countTickValues.length < tickCount - 1) {
        countTickValues.push(i);
      }
    }

    // 건수 그리드 라인 추가 (연한 수평선)
    countTickValues.forEach(value => {
      countGroup
        .append('line')
        .attr('x1', 0)
        .attr('x2', chartWidth)
        .attr('y1', yCountScale(value))
        .attr('y2', yCountScale(value))
        .attr('stroke', '#e5e7eb')
        .attr('stroke-width', 1)
        .attr('opacity', 0.5);
    });

    const countAxis = countGroup.append('g').call(
      d3
        .axisLeft(yCountScale)
        .tickFormat(d => `${d}건`)
        .tickValues(countTickValues)
        .tickSize(0)
    );

    // y축 도메인 라인 제거
    countAxis.select('.domain').remove();

    // 평형별로 그룹화
    const pyeongGroups = d3.group(chartData, d => d.pyeong);

    // 날짜별 거래건수 합산 (바 차트용)
    const dateCountMap = new Map<string, number>();
    chartData.forEach(d => {
      const dateKey = formatDateForScale(d.date);
      dateCountMap.set(dateKey, (dateCountMap.get(dateKey) || 0) + d.count);
    });

    const uniqueDates = Array.from(dateCountMap.keys()).sort();

    // 바 너비 동적 계산 (기본 3px, 간격 최소 1px 유지)
    const defaultBarWidth = 3;
    const minGap = 1;
    const idealSpacePerBar = defaultBarWidth + minGap;
    const totalIdealWidth = uniqueDates.length * idealSpacePerBar;

    let barWidth: number;
    if (totalIdealWidth > chartWidth) {
      // 공간이 부족하면 너비를 줄이되, 최소 1px 간격 유지
      barWidth = Math.max(1, chartWidth / uniqueDates.length - minGap);
    } else {
      // 충분한 공간이 있으면 기본 3px 사용
      barWidth = defaultBarWidth;
    }

    // 거래건수 바 차트 (하단 차트)
    uniqueDates.forEach(dateString => {
      const totalCount = dateCountMap.get(dateString) || 0;
      const xPos = xScale(dateString) || 0;

      const bar = countGroup
        .append('rect')
        .attr('class', 'count-bar')
        .attr('x', xPos - barWidth / 2)
        .attr('width', barWidth)
        .attr('fill', '#9ca3af')
        .attr('opacity', 0.8);

      bar
        .attr('y', countChartHeight)
        .attr('height', 0)
        .transition()
        .duration(300)
        .attr('y', yCountScale(totalCount))
        .attr('height', countChartHeight - yCountScale(totalCount));
    });

    // 평형별 실거래가 라인 차트 (상단 차트)
    Array.from(pyeongGroups, ([pyeong, data]) => {
      const color =
        legendData.findIndex(l => l.pyeong === pyeong) % legendData.length >= 0
          ? legendData[
              legendData.findIndex(l => l.pyeong === pyeong) % legendData.length
            ]?.color || '#3b82f6'
          : '#3b82f6';

      const sortedData = data.sort(
        (a, b) => a.date.getTime() - b.date.getTime()
      );

      const line = d3
        .line<TransactionChartData>()
        .x(d => xScale(formatDateForScale(d.date)) || 0)
        .y(d => yPriceScale(d.averagePrice))
        .curve(d3.curveMonotoneX);

      const path = priceGroup
        .append('path')
        .datum(sortedData)
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
        .duration(300)
        .attr('stroke-dashoffset', 0);

      // 각 데이터 포인트에 점 추가 (원형, 흰색 테두리)
      const pointRadius = 2;
      sortedData.forEach(d => {
        const xPos = xScale(formatDateForScale(d.date)) || 0;
        const yPos = yPriceScale(d.averagePrice);

        const point = priceGroup
          .append('circle')
          .attr('class', 'price-point')
          .attr('cx', xPos)
          .attr('cy', yPos)
          .attr('r', pointRadius)
          .attr('fill', color)
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 1)
          .attr('opacity', 0);

        point.transition().duration(300).delay(300).attr('opacity', 1);
      });
    });

    // 인터랙션용 수직선 생성 (전체 차트를 관통하는 하나의 선)
    const verticalLineGroup = svg
      .append('g')
      .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

    const verticalLine = verticalLineGroup
      .append('line')
      .attr('class', 'vertical-guide-line')
      .attr('stroke', '#000000')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '2 2')
      .style('opacity', 0)
      .attr('y1', 0)
      .attr('y2', priceChartHeight + chartGap + countChartHeight);

    // 인터랙션 레이어 추가 (전체 차트 영역)
    const interactionGroup = svg
      .append('g')
      .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

    const interactionLayer = interactionGroup
      .append('rect')
      .attr('class', 'interaction-layer')
      .attr('width', chartWidth)
      .attr('height', priceChartHeight + chartGap + countChartHeight)
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

      // y축 구분선 표시 (전체 관통)
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

      // 총 거래건수 계산
      const totalCountForDate = sortedPyeongData.reduce(
        (sum, [, data]) => sum + data.count,
        0
      );

      // 평형별 데이터 HTML 생성
      const pyeongDataHTML = sortedPyeongData
        .map(([pyeong, data]) => {
          const avgPrice = data.totalPrice / data.count;
          const formattedPrice = formatKoreanAmountText(avgPrice).replace(
            '원',
            ''
          );
          // 가격에서 숫자 부분만 추출하여 하이라이트
          const priceWithHighlight = formattedPrice.replace(
            /(\d+)/g,
            '<span class="text-primary">$1</span>'
          );
          return `
            <p class="text-sm lg:text-base mt-1 whitespace-nowrap text-gray-900">· ${pyeong}평: <span class="text-primary">${data.count}</span>건 / 평균 ${priceWithHighlight}</p>
          `;
        })
        .join('');

      // 툴팁 내용
      const tooltipContent = `
        <div class="text-sm lg:text-base">
          <span class="text-gray-500">${formattedDate}</span> (<span class="text-primary">${totalCountForDate}</span>건)
        </div>
        <div class="mt-2">
          ${pyeongDataHTML}
        </div>
      `;

      if (tooltipRef.current) {
        tooltipRef.current.innerHTML = tooltipContent;

        // 브라우저가 레이아웃을 다시 계산하도록 강제
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        tooltipRef.current.offsetHeight;

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
        tooltipRef.current.style.opacity = '1';
      }
    };

    // 툴팁 숨김 함수
    const hideTooltip = () => {
      verticalLine.style('opacity', 0);
      if (tooltipRef.current) {
        tooltipRef.current.style.opacity = '0';
      }
    };

    // PC/Mobile 구분
    const isDesktop = () => window.matchMedia('(min-width: 1024px)').matches;

    // 이벤트 핸들러
    let isInteracting = false;

    const handlePointerMove = (event: PointerEvent) => {
      const svgRect = svgRef.current?.getBoundingClientRect();
      if (!svgRect) return;

      let mouseX = event.clientX - svgRect.left - MARGIN.left;

      // 차트 영역을 벗어나면 경계값으로 제한
      if (mouseX < 0) {
        mouseX = 0;
      } else if (mouseX > chartWidth) {
        mouseX = chartWidth;
      }

      const nearestDate = findNearestDate(mouseX);

      if (nearestDate) {
        if (isDesktop()) {
          // PC: 호버 시 즉시 툴팁 표시
          showTooltip(nearestDate);
        } else {
          // Mobile: 터치 중일 때만 툴팁 표시
          if (isInteracting) {
            showTooltip(nearestDate);
          }
        }
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (!isDesktop()) {
        // Mobile: 터치다운 시 툴팁 표시
        isInteracting = true;
        const svgRect = svgRef.current?.getBoundingClientRect();
        if (!svgRect) return;

        const mouseX = event.clientX - svgRect.left - MARGIN.left;
        const nearestDate = findNearestDate(mouseX);

        if (nearestDate) {
          showTooltip(nearestDate);
        }
      }
    };

    const handlePointerUp = () => {
      if (!isDesktop()) {
        // Mobile: 터치 업 시 툴팁 숨김
        isInteracting = false;
        hideTooltip();
      }
    };

    const handlePointerLeave = () => {
      if (isDesktop()) {
        // PC: 차트 영역 벗어나면 툴팁 숨김
        hideTooltip();
      } else {
        // Mobile: 터치 중이면 툴팁 숨김
        if (isInteracting) {
          isInteracting = false;
          hideTooltip();
        }
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

    // 기본적으로 맨 우측 툴팁 노출
    if (uniqueDates.length > 0) {
      const rightmostDate = uniqueDates[uniqueDates.length - 1];
      showTooltip(rightmostDate);
    }

    setIsLoading(false);

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
    priceChartHeight,
    countChartHeight,
    xScale,
    yPriceScale,
    yCountScale,
    containerWidth,
    legendData,
    chartGap,
  ]);

  return {
    svgRef,
    isLoading,
    containerWidth,
    chartWidth,
    chartHeight: totalHeight,
  };
};
