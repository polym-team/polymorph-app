'use client';

import { ApartDetailResponse } from '@/app/api/apart/types';

import * as d3 from 'd3';
import { subMonths } from 'date-fns';
import {
  MutableRefObject,
  RefObject,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { calculatePyeong } from '../services/calculator';

export interface ChartData {
  date: Date;
  averagePrice: number;
  count: number;
  size: number; // 실제 면적 값 (㎡)
  sizes?: number[];
}

interface ChartDataResult {
  result: ChartData[];
  allSizes: number[];
}

interface Props {
  items: ApartDetailResponse['tradeItems'];
  svgRef: RefObject<SVGSVGElement>;
  tooltipRef: MutableRefObject<HTMLDivElement | null>;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
  period: number;
}

export function useTransactionChart({
  items,
  svgRef,
  tooltipRef,
  height: containerHeight,
  margin: initialMargin,
  period,
}: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [containerWidth, setContainerWidth] = useState(1024);
  const [windowWidth, setWindowWidth] = useState(1024);

  // 윈도우 너비 감지
  useEffect(() => {
    const updateWindowWidth = () => {
      setWindowWidth(window.innerWidth);
    };

    // 초기 너비 설정
    updateWindowWidth();

    // 리사이즈 감지
    window.addEventListener('resize', updateWindowWidth);

    return () => {
      window.removeEventListener('resize', updateWindowWidth);
    };
  }, []);

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
    bottom: 70,
    left: 35,
  };

  // 차트 데이터 계산
  const chartData = useMemo(() => {
    if (!items.length) return [];

    // 기간 필터링
    const now = new Date();
    const filteredItems =
      period === 0
        ? items
        : items.filter(item => {
            const tradeDate = new Date(item.tradeDate);
            return tradeDate >= subMonths(now, period);
          });

    // 평형별로 그룹화
    const sizeGroups = d3.group(filteredItems, d => calculatePyeong(d.size));
    const result: ChartData[] = [];

    sizeGroups.forEach((items, pyeong) => {
      // 거래가 있는 데이터만 필터링
      const validItems = items.filter(item => item.tradeAmount > 0);

      // 월별로 그룹화
      const monthlyData = d3.group(validItems, d =>
        d3.timeMonth(new Date(d.tradeDate))
      );

      // 해당 평형의 제곱미터 값들을 수집
      const sizes = Array.from(new Set(validItems.map(item => item.size))).sort(
        (a, b) => a - b
      );

      // 거래가 있는 월만 데이터 추가
      Array.from(monthlyData, ([date, items]) => {
        if (items.length > 0) {
          result.push({
            date: date,
            averagePrice: d3.mean(items, d => d.tradeAmount) || 0,
            count: items.length,
            size: sizes[0], // 대표 면적 값 (첫 번째 값 사용)
            sizes: sizes,
          });
        }
      });
    });

    // 날짜순으로 정렬
    return result.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [items, period]);

  // 차트 영역 크기 계산
  const chartWidth = Math.max(containerWidth - margin.left - margin.right, 0);
  const chartHeight = containerHeight - margin.top - margin.bottom;

  // 스케일 계산
  const xScale = useMemo(() => {
    if (!chartData.length) {
      return d3.scalePoint().domain([]).range([0, chartWidth]);
    }

    // 거래가 있는 데이터만 필터링하고 중복 제거
    const uniqueDates = Array.from(
      new Set(
        chartData
          .filter(d => d.count > 0)
          .map(d => `${d.date.getFullYear()}-${d.date.getMonth()}`)
      )
    )
      .map(dateStr => {
        const [year, month] = dateStr.split('-').map(Number);
        return new Date(year, month);
      })
      .sort((a, b) => a.getTime() - b.getTime())
      .map(date => `${date.getFullYear()}-${date.getMonth()}`);

    return d3
      .scalePoint()
      .domain(uniqueDates)
      .range([0, chartWidth])
      .padding(0)
      .align(0);
  }, [chartData, chartWidth]);

  const yScale = useMemo(() => {
    if (!chartData.length) {
      return d3.scaleLinear().domain([0, 100]).nice().range([chartHeight, 0]);
    }

    const maxPrice = d3.max(chartData, d => d.averagePrice) as number;
    const lastPrice = chartData[chartData.length - 1].averagePrice;

    // 마지막 데이터의 가격이 최대값보다 작으면 최대값으로 설정
    const domainMax = Math.max(maxPrice, lastPrice);

    return d3
      .scaleLinear()
      .domain([0, domainMax])
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
      .attr('preserveAspectRatio', 'xMinYMid meet');

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
    const xAxis = d3.axisBottom(xScale).tickFormat((domainValue: string) => {
      const [year, month] = domainValue.split('-').map(Number);
      // 해당 년도의 첫 번째 거래 데이터인지 확인
      const yearData = chartData
        .filter(d => d.date.getFullYear() === year && d.count > 0)
        .sort((a, b) => a.date.getTime() - b.date.getTime());

      if (yearData.length === 0) return '';

      const firstTradeMonth = yearData[0].date.getMonth();

      // 윈도우 너비가 640px 이하일 때
      if (windowWidth <= 640) {
        // 가장 최근 년도는 항상 표시
        const lastYear = chartData[chartData.length - 1].date.getFullYear();
        if (year === lastYear) {
          return month === firstTradeMonth ? `${year}` : '';
        }
        // 그 외는 가장 최근 년도와의 차이가 짝수인 년도만 표시
        return month === firstTradeMonth && (lastYear - year) % 2 === 0
          ? `${year}`
          : '';
      }

      return month === firstTradeMonth ? `${year}` : '';
    });

    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .attr('class', 'x-axis')
      .call(xAxis)
      .attr('color', '#475569')
      .selectAll('.tick')
      .each(function (d) {
        const [year, month] = String(d).split('-').map(Number);
        // 해당 년도의 첫 번째 거래 데이터인지 확인
        const yearData = chartData
          .filter(d => d.date.getFullYear() === year && d.count > 0)
          .sort((a, b) => a.date.getTime() - b.date.getTime());

        if (yearData.length === 0) {
          d3.select(this).select('line').remove();
          return;
        }

        const firstTradeMonth = yearData[0].date.getMonth();
        if (month !== firstTradeMonth) {
          d3.select(this).select('line').remove();
        }

        // 윈도우 너비가 640px 이하일 때 라벨 회전
        if (windowWidth <= 640) {
          d3.select(this)
            .select('text')
            .attr('transform', 'rotate(-45)')
            .attr('text-anchor', 'end')
            .attr('dx', '-.8em')
            .attr('dy', '.15em');
        }
      });

    // Y축 생성
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(5)
      .tickFormat((domainValue: d3.NumberValue) => {
        const value = +domainValue;
        return value === 0 ? '' : `${Math.round(value / 100000000)}억`;
      });

    g.append('g').attr('class', 'y-axis').call(yAxis).attr('color', '#475569');

    if (chartData.length) {
      const chartContainer = g
        .append('g')
        .attr('class', 'chart-container')
        .style('opacity', 0);

      // 평형별로 데이터 그룹화
      const sizeGroups = d3.group(chartData, d =>
        calculatePyeong(d.size)
      ) as Map<number, ChartData[]>;

      // 색상 스케일 생성
      const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

      // 각 평형별로 라인 생성
      sizeGroups.forEach((data, pyeong) => {
        // 해당 평형의 데이터만 필터링하고 날짜순으로 정렬
        const sizeData = data
          .filter(d => d.count > 0)
          .sort((a, b) => a.date.getTime() - b.date.getTime());

        const line = d3
          .line<ChartData>()
          .x(d => xScale(`${d.date.getFullYear()}-${d.date.getMonth()}`)!)
          .y(d => yScale(d.averagePrice))
          .curve(d3.curveLinear);

        // 선 그리기
        chartContainer
          .append('path')
          .datum(sizeData)
          .attr('fill', 'none')
          .attr('stroke', colorScale(pyeong.toString()))
          .attr('stroke-width', 2)
          .attr('d', line);

        // 각 데이터 포인트에 점 추가
        chartContainer
          .selectAll(`.point-${pyeong}`)
          .data(sizeData)
          .enter()
          .append('circle')
          .attr('class', `point-${pyeong}`)
          .attr(
            'cx',
            d => xScale(`${d.date.getFullYear()}-${d.date.getMonth()}`)!
          )
          .attr('cy', d => yScale(d.averagePrice))
          .attr('r', 3) // 선보다 1px 굵게 (선: 2px, 점: 3px)
          .attr('fill', colorScale(pyeong.toString()))
          .attr('stroke', 'white')
          .attr('stroke-width', 1);
      });

      // 범례 간격 계산 (전체 너비를 범례 수로 나누어 균등 분배)
      const legendItemWidth = windowWidth <= 640 ? 45 : 100; // 모바일에서는 간격을 절반으로 줄임
      const legendItemHeight = windowWidth <= 640 ? 20 : 25; // 모바일에서는 더 작게
      const totalLegendWidth = legendItemWidth * sizeGroups.size;
      const chartWidth = containerWidth - margin.left - margin.right;
      const legendStartX = margin.left;

      // 범례 표시 (모바일과 데스크톱 모두)
      const legend = svg
        .append('g')
        .attr('class', 'legend')
        .attr(
          'transform',
          `translate(${legendStartX}, ${containerHeight - margin.bottom + (windowWidth <= 640 ? 50 : 40)})`
        );

      // 범례 아이템들을 담을 그룹 생성 (중앙 정렬용)
      const legendItemsGroup = legend
        .append('g')
        .attr(
          'transform',
          `translate(${(chartWidth - totalLegendWidth) / 2}, 0)`
        );

      // 평수 기준으로 오름차순 정렬
      const sortedPyeongs = Array.from(sizeGroups.keys()).sort((a, b) => a - b);

      sortedPyeongs.forEach((pyeong, index) => {
        const data = sizeGroups.get(pyeong)!;
        const sizes = Array.from(new Set(data.map(d => d.size))).sort(
          (a, b) => a - b
        );

        // 모든 범례를 한 줄에 배치
        const row = 0;
        const col = index;

        const legendItem = legendItemsGroup
          .append('g')
          .attr(
            'transform',
            `translate(${col * legendItemWidth}, ${row * legendItemHeight})`
          );

        legendItem
          .append('rect')
          .attr('width', windowWidth <= 640 ? 8 : 10) // 모바일에서 사각형도 더 작게
          .attr('height', windowWidth <= 640 ? 8 : 10)
          .attr('fill', colorScale(pyeong.toString()));

        // 모바일에서는 텍스트를 더 간단하게
        const legendText =
          windowWidth <= 640
            ? `${pyeong}평`
            : `${pyeong}평 (${sizes.map(s => `${s}㎡`).join(', ')})`;

        legendItem
          .append('text')
          .attr('x', windowWidth <= 640 ? 12 : 15) // 모바일에서 텍스트 간격도 줄임
          .attr('y', windowWidth <= 640 ? 8 : 10) // 모바일에서 세로 위치 조정
          .attr('font-size', windowWidth <= 640 ? '10px' : '12px') // 모바일에서 폰트 크기도 줄임
          .text(legendText);
      });

      // fade-in 애니메이션
      chartContainer.transition().duration(600).style('opacity', 1);

      // 툴팁 설정
      if (!tooltipRef.current) {
        tooltipRef.current = d3
          .select(svgRef.current.parentElement!)
          .append('div')
          .attr(
            'class',
            'absolute bg-white/70 text-gray-800 px-3 py-2 rounded-md text-sm shadow-lg border border-gray-200'
          )
          .style('pointer-events', 'none')
          .style('opacity', 0)
          .style('transition', 'opacity 0.1s')
          .style('backdrop-filter', 'blur(2px)')
          .node();
      }

      const tooltip = d3.select(tooltipRef.current);
      let lastTooltipContent = '';
      let lastMonth: Date | null = null;
      let lastDate: string | null = null;

      // 마우스 이벤트를 위한 투명한 영역 추가
      const mouseArea = g
        .append('rect')
        .attr('width', chartWidth)
        .attr('height', chartHeight)
        .attr('fill', 'transparent')
        .style('cursor', 'crosshair');

      // 세로선 추가
      const verticalLine = g
        .append('line')
        .attr('class', 'vertical-line')
        .attr('stroke', '#94a3b8')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '4,4')
        .style('opacity', 0)
        .style('transition', 'opacity 0.1s');

      let isMouseOver = false;
      let isDragging = false;

      // 모바일 환경에서의 드래그 이벤트 처리
      if (windowWidth <= 640) {
        mouseArea
          .style('touch-action', 'none')
          .on('touchstart', event => {
            event.preventDefault();
            isDragging = true;
            const touch = event.touches[0];
            const rect = svg.node()!.getBoundingClientRect();
            const x = touch.clientX - rect.left - margin.left;
            updateTooltip(x);
          })
          .on('touchmove', event => {
            event.preventDefault();
            if (!isDragging) return;
            const touch = event.touches[0];
            const rect = svg.node()!.getBoundingClientRect();
            const x = touch.clientX - rect.left - margin.left;
            updateTooltip(x);
          })
          .on('touchend', event => {
            event.preventDefault();
            isDragging = false;
            // 터치 종료 후에도 세로선과 툴팁 유지
          })
          .on('touchcancel', event => {
            event.preventDefault();
            isDragging = false;
            // 터치 취소 후에도 세로선과 툴팁 유지
          });
      }

      // 마우스 이벤트 처리
      mouseArea
        .on('mouseenter', () => {
          isMouseOver = true;
          tooltip.style('opacity', 1);
        })
        .on('mousemove', event => {
          if (!isMouseOver) return;
          const [x] = d3.pointer(event);
          updateTooltip(x);
        })
        .on('mouseleave', () => {
          isMouseOver = false;
          // 마우스가 차트 영역을 벗어나도 세로선과 툴팁 유지
          // X축 라벨은 항상 표시되므로 업데이트 제거
        });

      // 툴팁 업데이트 함수
      const updateTooltip = (x: number) => {
        const domain = xScale.domain();
        const step = xScale.step();
        const index = Math.min(
          Math.max(0, Math.round(x / step)),
          domain.length - 1
        );
        const dateStr = domain[index];
        lastDate = dateStr; // 마지막 날짜 저장
        const [year, month] = dateStr.split('-').map(Number);
        const date = new Date(year, month);

        // 해당 월의 데이터 필터링
        const monthData = chartData.filter(
          d =>
            d.date.getFullYear() === date.getFullYear() &&
            d.date.getMonth() === date.getMonth() &&
            d.count > 0
        );

        if (monthData.length > 0) {
          // 세로선 표시
          const lineX = xScale(dateStr)!;
          verticalLine
            .attr('x1', lineX)
            .attr('x2', lineX)
            .attr('y1', 0)
            .attr('y2', chartHeight)
            .style('opacity', 1);

          // 툴팁 내용 생성
          const tooltipContent = `
            <div class="space-y-1">
              <div>${d3.timeFormat('%Y년 %m월')(date)}</div>
              ${monthData
                .map(
                  data => `
                <div>· ${calculatePyeong(data.size)}평 평균 ${Math.round(
                  data.averagePrice / 100000000
                )}억 (${data.count}건)</div>
              `
                )
                .join('')}
            </div>
          `;

          // 툴팁 위치 계산 - 세로선 위치 기준으로 고정
          const tooltipWidth = 200;
          const chartAreaWidth = containerWidth - margin.left - margin.right;
          const chartCenter = chartAreaWidth / 2;
          const rightSpace = chartAreaWidth - lineX;
          const leftSpace = lineX;

          // 차트 중앙을 기준으로 세로선 위치에 따라 툴팁 위치 결정
          let tooltipLeft: number;

          if (lineX < chartCenter) {
            // 세로선이 차트 중앙보다 좌측에 있으면 툴팁을 우측에 표시
            tooltipLeft = lineX + margin.left + 10;
          } else {
            // 세로선이 차트 중앙보다 우측에 있으면 툴팁을 좌측에 표시
            tooltipLeft = lineX + margin.left - tooltipWidth + 25;
          }

          tooltip
            .style('opacity', 1)
            .style('left', `${tooltipLeft}px`)
            .style('top', `${margin.top + 10}px`)
            .html(tooltipContent);

          // X축 라벨은 항상 표시되므로 업데이트 제거
        }
      };

      // 초기 상태 설정 (가장 최근 데이터 표시)
      if (chartData.length > 0) {
        const lastData = chartData[chartData.length - 1];
        const dateStr = `${lastData.date.getFullYear()}-${lastData.date.getMonth()}`;
        const monthData = chartData.filter(
          d =>
            d.date.getFullYear() === lastData.date.getFullYear() &&
            d.date.getMonth() === lastData.date.getMonth() &&
            d.count > 0
        );

        if (monthData.length > 0) {
          // 세로선 표시
          verticalLine
            .attr('x1', xScale(dateStr)!)
            .attr('x2', xScale(dateStr)!)
            .attr('y1', 0)
            .attr('y2', chartHeight)
            .style('opacity', 1);

          // 툴팁 내용 생성
          const tooltipContent = `
            <div class="space-y-1">
              <div>${d3.timeFormat('%Y년 %m월')(lastData.date)}</div>
              ${monthData
                .map(
                  data => `
                <div>· ${calculatePyeong(data.size)}평 평균 ${Math.round(
                  data.averagePrice / 100000000
                )}억 (${data.count}건)</div>
              `
                )
                .join('')}
            </div>
          `;

          // 툴팁 위치 계산
          const tooltipWidth = 200;
          const x = xScale(dateStr)!;
          const rightSpace = containerWidth - margin.left - margin.right - x;
          const shouldShowOnLeft = rightSpace < tooltipWidth + 20;

          tooltip
            .style('opacity', 1)
            .style(
              'left',
              shouldShowOnLeft
                ? `${x + margin.left - tooltipWidth + 25}px`
                : `${x + margin.left + 10}px`
            )
            .style('top', `${margin.top + 10}px`)
            .html(tooltipContent);

          // X축 라벨은 항상 표시되므로 업데이트 제거

          lastTooltipContent = tooltipContent;
          lastMonth = lastData.date;
        }
      }
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
    windowWidth,
  ]);

  return {
    isLoading,
  };
}
