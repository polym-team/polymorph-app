import { ApartDetailResponse } from '@/app/api/apart/types';

import * as d3 from 'd3';
import {
  MutableRefObject,
  RefObject,
  useEffect,
  useMemo,
  useState,
} from 'react';

export interface ChartData {
  date: Date;
  averagePrice: number;
  count: number;
}

interface Props {
  items: ApartDetailResponse['tradeItems'];
  svgRef: RefObject<SVGSVGElement>;
  tooltipRef: MutableRefObject<HTMLDivElement | null>;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
}

export function useTransactionChart({
  items,
  svgRef,
  tooltipRef,
  height: containerHeight,
  margin: initialMargin,
}: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [containerWidth, setContainerWidth] = useState(window.innerWidth);

  // 컨테이너 너비 감지
  useEffect(() => {
    if (!svgRef.current?.parentElement) return;

    const updateWidth = () => {
      const parentElement = svgRef.current?.parentElement;
      if (parentElement) {
        const parentWidth = parentElement.clientWidth;
        // 실제 너비가 1024px 미만일 때만 최소값 적용
        setContainerWidth(parentWidth < 1024 ? 1024 : parentWidth);
      }
    };

    // 초기 너비 설정
    updateWidth();

    // 리사이즈 감지
    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(svgRef.current.parentElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, [svgRef]);

  // margin 설정
  const margin = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 60,
  };

  // 차트 데이터 계산
  const chartData = useMemo(() => {
    if (!items.length) return [];

    const monthlyData = d3.group(items, d =>
      d3.timeMonth(new Date(d.tradeDate))
    );

    return Array.from(monthlyData, ([date, items]) => ({
      date: date,
      averagePrice: d3.mean(items, d => d.tradeAmount) || 0,
      count: items.length,
    }));
  }, [items]);

  // 차트 영역 크기 계산
  const chartWidth = Math.max(containerWidth - margin.left - margin.right, 0);
  const chartHeight = containerHeight - margin.top - margin.bottom;

  // 스케일 계산
  const xScale = useMemo(() => {
    return d3
      .scaleTime()
      .domain(
        chartData.length
          ? (d3.extent(chartData, d => d.date) as [Date, Date])
          : [new Date(2020, 0), new Date(2024, 0)]
      )
      .range([0, chartWidth])
      .nice();
  }, [chartData, chartWidth]);

  const yScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain(
        chartData.length
          ? [0, d3.max(chartData, d => d.averagePrice) as number]
          : [0, 100]
      )
      .nice()
      .range([chartHeight, 0]);
  }, [chartData, chartHeight]);

  // 데이터가 변경될 때마다 로딩 상태 초기화
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [items]);

  // D3 차트 렌더링
  useEffect(() => {
    if (!svgRef.current || isLoading) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg
      .style('width', '100%')
      .style('height', '100%')
      .attr('viewBox', `0 0 ${containerWidth} ${containerHeight}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // 차트 영역 설정
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // 격자 추가
    g.append('g')
      .attr('class', 'grid')
      .attr('opacity', 0.1)
      .call(
        d3
          .axisLeft(yScale)
          .ticks(5)
          .tickSize(-chartWidth)
          .tickFormat(() => '')
      )
      .style('stroke-dasharray', '2,2');

    g.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${chartHeight})`)
      .attr('opacity', 0.1)
      .call(
        d3
          .axisBottom(xScale)
          .ticks(5)
          .tickSize(-chartHeight)
          .tickFormat(() => '')
      )
      .style('stroke-dasharray', '2,2');

    // X축 생성
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(d3.timeYear.every(1))
      .tickFormat((domainValue: Date | d3.NumberValue) => {
        const date =
          domainValue instanceof Date ? domainValue : new Date(+domainValue);
        return `${date.getFullYear()}년`;
      });

    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .attr('class', 'x-axis')
      .call(xAxis)
      .attr('color', '#475569');

    // Y축 생성
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(5)
      .tickFormat((domainValue: d3.NumberValue) => {
        const value = +domainValue;
        return value === 0 ? '' : `${Math.round(value / 100000000)}억원`;
      });

    g.append('g').attr('class', 'y-axis').call(yAxis).attr('color', '#475569');

    if (chartData.length) {
      const chartContainer = g
        .append('g')
        .attr('class', 'chart-container')
        .style('opacity', 0);

      const line = d3
        .line<ChartData>()
        .x(d => xScale(d.date))
        .y(d => yScale(d.averagePrice))
        .curve(d3.curveMonotoneX);

      chartContainer
        .append('path')
        .datum(chartData)
        .attr('fill', 'none')
        .attr('stroke', 'hsl(238 75% 65% / 1)')
        .attr('stroke-width', 2)
        .attr('d', line);

      chartContainer
        .selectAll('circle')
        .data(chartData)
        .join('circle')
        .attr('cx', d => xScale(d.date))
        .attr('cy', d => yScale(d.averagePrice))
        .attr('r', 3)
        .attr('fill', 'hsl(238 75% 65% / 1)');

      // fade-in 애니메이션
      chartContainer.transition().duration(600).style('opacity', 1);

      // 툴크 설정
      if (!tooltipRef.current) {
        tooltipRef.current = d3
          .select(svgRef.current.parentElement!)
          .append('div')
          .attr(
            'class',
            'absolute hidden bg-slate-800 text-white px-3 py-2 rounded-md text-sm shadow-lg'
          )
          .style('pointer-events', 'none')
          .node();
      }

      const tooltip = d3.select(tooltipRef.current);

      // 포인트에 마우스 이벤트 추가
      chartContainer
        .selectAll('circle')
        .on('mouseover', (event: any, d: any) => {
          const [x, y] = d3.pointer(event);
          const tooltipWidth = 150;
          const rightSpace = containerWidth - margin.left - margin.right - x;
          const shouldShowOnLeft = rightSpace < tooltipWidth + 20;

          tooltip
            .style(
              'left',
              shouldShowOnLeft
                ? `${x + margin.left - tooltipWidth + 25}px`
                : `${x + margin.left + 10}px`
            )
            .style('top', `${y + margin.top - 10}px`)
            .html(
              `
              <div class="space-y-1">
                <div>${d3.timeFormat('%Y년 %m월')(d.date)}</div>
                <div>평균 ${Math.round(d.averagePrice / 100000000)}억원</div>
                <div>거래 ${d.count}건</div>
              </div>
              `
            )
            .classed('hidden', false);
        })
        .on('mouseout', () => {
          tooltip.classed('hidden', true);
        });
    }

    return () => {
      if (tooltipRef.current) {
        tooltipRef.current.remove();
        tooltipRef.current = null;
      }
    };
  }, [
    chartData,
    isLoading,
    containerHeight,
    containerWidth,
    margin,
    xScale,
    yScale,
  ]);

  return {
    isLoading,
  };
}
