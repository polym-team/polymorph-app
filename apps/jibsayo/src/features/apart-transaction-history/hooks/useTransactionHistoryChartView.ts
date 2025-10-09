import * as d3 from 'd3';
import { useEffect, useMemo, useRef, useState } from 'react';

import { LegendItem, TransactionHistoryChartData } from './useTransactionHistoryChartData';

interface UseTransactionHistoryChartViewProps {
  chartData: TransactionHistoryChartData[];
  legendData: LegendItem[];
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
}

export const useTransactionHistoryChartView = ({
  chartData,
  legendData,
  height,
  margin,
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
  const chartWidth = Math.max(containerWidth - margin.left - margin.right, 0);
  const chartHeight = height - margin.top - margin.bottom;

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
  }, [chartData, chartWidth, containerWidth]);

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
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // 툴팁 생성
    if (!tooltipRef.current) {
      tooltipRef.current = d3
        .select(svgRef.current?.parentElement)
        .append('div')
        .style('position', 'absolute')
        .style('visibility', 'hidden')
        .style('background-color', 'rgba(0, 0, 0, 0.8)')
        .style('color', 'white')
        .style('padding', '8px 12px')
        .style('border-radius', '4px')
        .style('font-size', '12px')
        .style('pointer-events', 'none')
        .style('z-index', '10')
        .style('max-width', '200px')
        .style('word-wrap', 'break-word')
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
    const barMargin = 0.5;
    const barWidth =
      uniqueDates.length > 0
        ? Math.max(
            1,
            (chartWidth - uniqueDates.length * barMargin) / uniqueDates.length
          )
        : 0;

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

      // 데이터 포인트
      const points = g
        .selectAll(`.point-${pyeong}`)
        .data(data)
        .enter()
        .append('circle')
        .attr('class', `point-${pyeong}`)
        .attr('cx', d => xScale(formatDateForScale(d.date)) || 0)
        .attr('cy', d => yPriceScale(d.averagePrice))
        .attr('r', 4)
        .attr('fill', color)
        .attr('stroke', 'white')
        .attr('stroke-width', 2)
        .style('opacity', 0);
    });

    setIsLoading(false);
  }, [
    chartData,
    chartWidth,
    chartHeight,
    xScale,
    yPriceScale,
    yCountScale,
    margin,
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