'use client';

import { ApartDetailResponse } from '@/app/api/apart/types';

import * as d3 from 'd3';
import { subMonths } from 'date-fns';
import {
  MutableRefObject,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { CHART_COLORS } from '../consts/colors';
import { calculatePyeong } from '../services/calculator';

export interface CountChartData {
  date: Date;
  count: number;
  size: number; // 실제 면적 값 (㎡)
  sizes?: number[];
  pyeong: number;
}

export interface LegendItem {
  pyeong: number;
  color: string;
  sizes: number[];
}

interface Props {
  items: ApartDetailResponse['tradeItems'];
  svgRef: RefObject<SVGSVGElement>;
  tooltipRef: MutableRefObject<HTMLDivElement | null>;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
  period: number;
}

export function useCountChart({
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
  const [selectedPyeongs, setSelectedPyeongs] = useState<Set<number>>(
    new Set()
  );

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
    bottom: 30,
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

    // 선택된 평형만 필터링
    const selectedItems =
      selectedPyeongs.size > 0
        ? filteredItems.filter(item =>
            selectedPyeongs.has(calculatePyeong(item.size))
          )
        : filteredItems;

    // 월별로 그룹화
    const monthlyData = d3.group(selectedItems, d =>
      d3.timeMonth(new Date(d.tradeDate))
    );

    const result: CountChartData[] = [];

    // 각 월별로 평형대별 거래건수를 분리하여 데이터 생성
    Array.from(monthlyData, ([date, items]) => {
      if (items.length > 0) {
        // 평형대별로 그룹화
        const pyeongGroups = d3.group(items, d => calculatePyeong(d.size));

        // 평형대별로 데이터 생성
        Array.from(pyeongGroups, ([pyeong, pyeongItems]) => {
          const allSizes = Array.from(
            new Set(pyeongItems.map(item => item.size))
          ).sort((a, b) => a - b);

          result.push({
            date: date,
            count: pyeongItems.length,
            size: allSizes[0], // 대표 면적 값 (첫 번째 값 사용)
            sizes: allSizes,
            pyeong: pyeong, // 평형 정보 추가
          });
        });
      }
    });

    // 날짜순으로 정렬
    return result.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [items, period, selectedPyeongs]);

  // 차트 영역 크기 계산
  const chartWidth = Math.max(containerWidth - margin.left - margin.right, 0);
  const chartHeight = containerHeight - margin.top - margin.bottom;

  // 색상 스케일 생성 (범례와 차트에서 공유)
  const colorScale = useMemo(() => {
    if (!items.length) return d3.scaleOrdinal(d3.schemeCategory10);

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
    const sortedPyeongs = Array.from(sizeGroups.keys()).sort((a, b) => a - b);

    return d3
      .scaleOrdinal<string, string>()
      .domain(sortedPyeongs.map(p => p.toString()))
      .range(CHART_COLORS);
  }, [items, period]);

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
      .range([10, chartWidth - 10])
      .padding(0.5)
      .align(0);
  }, [chartData, chartWidth]);

  const yScale = useMemo(() => {
    if (!chartData.length) {
      return d3.scaleLinear().domain([0, 10]).nice().range([chartHeight, 0]);
    }

    // 월별로 그룹화하여 각 월의 총 거래건수 계산
    const monthlyGroups = d3.group(
      chartData,
      d => `${d.date.getFullYear()}-${d.date.getMonth()}`
    );

    // 각 월의 총 거래건수 계산
    const monthlyTotals = Array.from(monthlyGroups, ([monthKey, monthData]) => {
      return monthData.reduce((sum, data) => sum + data.count, 0);
    });

    const maxCount = d3.max(monthlyTotals) as number;
    return d3
      .scaleLinear()
      .domain([0, maxCount])
      .nice()
      .range([chartHeight, 0]);
  }, [chartData, chartHeight]);

  // 데이터가 변경될 때마다 로딩 상태 초기화
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [items]);

  // 범례 데이터 계산
  const legendData = useMemo(() => {
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

    // 평수 기준으로 오름차순 정렬
    const sortedPyeongs = Array.from(sizeGroups.keys()).sort((a, b) => a - b);

    return sortedPyeongs.map((pyeong, index) => {
      const data = sizeGroups.get(pyeong)!;
      // 해당 평형의 모든 면적 값들을 수집 (중복 제거)
      const sizes = Array.from(new Set(data.map(d => d.size))).sort(
        (a, b) => a - b
      );

      return {
        pyeong,
        color: CHART_COLORS[index % CHART_COLORS.length],
        sizes,
      };
    });
  }, [items, period]);

  // 선택된 평형이 없으면 모든 평형을 선택
  useEffect(() => {
    if (legendData.length > 0 && selectedPyeongs.size === 0) {
      setSelectedPyeongs(new Set(legendData.map(item => item.pyeong)));
    }
  }, [legendData, selectedPyeongs.size]);

  // 평형 선택/해제 토글 함수
  const togglePyeong = (pyeong: number) => {
    setSelectedPyeongs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pyeong)) {
        newSet.delete(pyeong);
      } else {
        newSet.add(pyeong);
      }
      return newSet;
    });
  };

  // 모든 평형 선택/해제 토글 함수
  const toggleAllPyeongs = () => {
    if (selectedPyeongs.size === legendData.length) {
      setSelectedPyeongs(new Set());
    } else {
      setSelectedPyeongs(new Set(legendData.map(item => item.pyeong)));
    }
  };

  const updateChart = useCallback(() => {
    if (!svgRef.current || !chartData.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // SVG의 실제 너비를 가져오기 위해 부모 요소의 너비 사용
    const parentElement = svgRef.current.parentElement;
    const containerWidth = parentElement ? parentElement.clientWidth : 1024;
    const margin = { ...initialMargin };

    // SVG 크기 업데이트
    svg
      .style('width', '100%')
      .style('height', '100%')
      .attr('viewBox', `0 0 ${containerWidth} ${containerHeight}`)
      .attr('preserveAspectRatio', 'xMinYMid meet');

    // 차트 영역 설정
    const chartWidth = containerWidth - margin.left - margin.right;
    const chartHeight = containerHeight - margin.top - margin.bottom;

    // xScale을 현재 chartWidth로 다시 계산
    const currentXScale = (() => {
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
        .range([10, chartWidth - 10])
        .padding(0.5)
        .align(0);
    })();

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
          .axisBottom(currentXScale)
          .ticks(5)
          .tickSize(-chartHeight)
          .tickFormat(() => '')
      )
      .style('stroke-dasharray', '2,2');

    // X축 생성
    const xAxis = d3
      .axisBottom(currentXScale)
      .tickFormat((domainValue: string) => {
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
      .each(function (d: any) {
        const value = +d;
        // y축 맨 아래 틱(0값) 제거
        if (value === 0) {
          d3.select(this).select('line').remove();
        }
      });

    // Y축 생성
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(5)
      .tickFormat((domainValue: d3.NumberValue) => {
        const value = +domainValue;
        return value === 0 ? '' : `${value}건`;
      });

    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .attr('color', '#475569')
      .selectAll('.tick')
      .each(function (d: any) {
        const value = +d;
        // y축 맨 아래 틱(0값) 제거
        if (value === 0) {
          d3.select(this).select('line').remove();
        }
      });

    // x축 첫 번째 틱과 y축 사이의 빈틈을 메우는 가짜 선 추가
    const firstTickX =
      currentXScale.domain().length > 0
        ? currentXScale(currentXScale.domain()[0])!
        : 0;
    if (firstTickX > 0) {
      g.append('line')
        .attr('x1', 0)
        .attr('x2', firstTickX)
        .attr('y1', chartHeight)
        .attr('y2', chartHeight)
        .attr('stroke', '#475569')
        .attr('stroke-width', 1);
    }

    if (chartData.length) {
      const chartContainer = g
        .append('g')
        .attr('class', 'chart-container')
        .style('opacity', 0);

      // 바 너비 동적 계산
      const totalBars = chartData.filter(d => d.count > 0).length;
      const availableWidth = chartWidth;
      const maxBarWidth = windowWidth <= 640 ? 8 : 20; // 모바일에서는 얇게
      const minBarWidth = 2; // 최소 바 너비

      // xScale의 step을 사용하여 바 너비 계산 (간격은 xScale의 padding으로 처리)
      const step = currentXScale.step();
      const dynamicBarWidth = Math.max(
        minBarWidth,
        Math.min(maxBarWidth, step * 0.8) // step의 80%를 바 너비로 사용
      );

      // 월별로 데이터 그룹화하여 스택 바 생성
      const monthlyGroups = d3.group(
        chartData,
        d => `${d.date.getFullYear()}-${d.date.getMonth()}`
      );

      // 각 월별로 스택 바 생성
      monthlyGroups.forEach((monthData, monthKey) => {
        // 평형대별로 정렬
        const sortedData = monthData
          .filter(d => d.count > 0)
          .sort((a, b) => a.pyeong - b.pyeong);

        if (sortedData.length === 0) return;

        // 스택 계산
        let currentY = 0;
        const [year, month] = monthKey.split('-').map(Number);
        const date = new Date(year, month);

        // 각 평형대별로 바 세그먼트 생성
        sortedData.forEach((data, index) => {
          const segmentHeight =
            yScale(currentY) - yScale(currentY + data.count);

          // legendData에서 해당 평형의 색상 찾기
          const legendItem = legendData.find(
            item => item.pyeong === data.pyeong
          );
          const color = legendItem
            ? legendItem.color
            : CHART_COLORS[index % CHART_COLORS.length];

          chartContainer
            .append('rect')
            .attr('class', `bar-segment-${data.pyeong}`)
            .attr(
              'x',
              currentXScale(`${date.getFullYear()}-${date.getMonth()}`)! -
                dynamicBarWidth / 2
            )
            .attr('y', yScale(currentY + data.count))
            .attr('width', dynamicBarWidth)
            .attr('height', segmentHeight)
            .attr('fill', color)
            .attr('opacity', 0.8)
            .style('cursor', 'pointer');

          currentY += data.count;
        });
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

      // 웹에서는 hover 이벤트, 모바일에서는 드래그 이벤트
      if (windowWidth > 640) {
        // 웹: 월별 hover 이벤트
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

        let lastSelectedDate: string | null = null;

        mouseArea
          .on('mouseenter', () => {
            tooltip.style('opacity', 1);
          })
          .on('mousemove', event => {
            const [x] = d3.pointer(event);
            const selectedDate = updateTooltip(x);
            if (selectedDate) {
              lastSelectedDate = selectedDate;
            }
          })
          .on('mouseleave', () => {
            // 마우스가 영역을 벗어나도 마지막 선택된 데이터 계속 표시
            if (lastSelectedDate) {
              updateTooltipByDate(lastSelectedDate);
            } else {
              // 마지막 선택된 데이터가 없으면 초기 상태로
              showInitialTooltip();
            }
          });

        // 툴팁 업데이트 함수
        const updateTooltip = (x: number): string | null => {
          const domain = currentXScale.domain();
          const step = currentXScale.step();
          const index = Math.min(
            Math.max(0, Math.round(x / step)),
            domain.length - 1
          );
          const dateStr = domain[index];
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
            const lineX = currentXScale(dateStr)!;
            verticalLine
              .attr('x1', lineX)
              .attr('x2', lineX)
              .attr('y1', 0)
              .attr('y2', chartHeight)
              .style('opacity', 1);

            // 평형대별로 정렬
            const sortedData = monthData.sort((a, b) => a.pyeong - b.pyeong);

            const totalCount = sortedData.reduce(
              (sum, data) => sum + data.count,
              0
            );
            const tooltipContent = `
              <div class="space-y-1">
                <div>${d3.timeFormat('%Y년 %m월')(date)} <strong>(${totalCount}건)</strong></div>
                ${sortedData
                  .map(
                    data => `
                  <div>· ${data.pyeong}평 ${data.count}건</div>
                `
                  )
                  .join('')}
              </div>
            `;

            // 툴팁 위치 계산
            const rect = svgRef.current!.getBoundingClientRect();
            const chartAreaWidth = containerWidth - margin.left - margin.right;
            const chartCenter = chartAreaWidth / 2;
            const tooltipWidth = 200;

            // 차트 중앙을 기준으로 세로선 위치에 따라 툴팁 위치 결정
            let tooltipX: number;

            if (lineX < chartCenter) {
              // 세로선이 차트 중앙보다 좌측에 있으면 툴팁을 우측에 표시
              tooltipX = lineX + margin.left + 10;
            } else {
              // 세로선이 차트 중앙보다 우측에 있으면 툴팁을 좌측에 표시
              tooltipX = lineX + margin.left - tooltipWidth + 45;
            }

            tooltip
              .style('opacity', 1)
              .style('position', 'absolute')
              .style('left', `${tooltipX}px`)
              .style('top', `${margin.top + 10}px`)
              .style('z-index', '1000')
              .html(tooltipContent);

            return dateStr;
          }
          return null;
        };

        // 날짜로 툴팁 업데이트하는 함수
        const updateTooltipByDate = (dateStr: string) => {
          const [year, month] = dateStr.split('-').map(Number);
          const date = new Date(year, month);

          const monthData = chartData.filter(
            d =>
              d.date.getFullYear() === date.getFullYear() &&
              d.date.getMonth() === date.getMonth() &&
              d.count > 0
          );

          if (monthData.length > 0) {
            const lineX = currentXScale(dateStr)!;
            verticalLine
              .attr('x1', lineX)
              .attr('x2', lineX)
              .attr('y1', 0)
              .attr('y2', chartHeight)
              .style('opacity', 1);

            const sortedData = monthData.sort((a, b) => a.pyeong - b.pyeong);
            const totalCount = sortedData.reduce(
              (sum, data) => sum + data.count,
              0
            );
            const tooltipContent = `
              <div class="space-y-1">
                <div>${d3.timeFormat('%Y년 %m월')(date)} <strong>(${totalCount}건)</strong></div>
                ${sortedData
                  .map(
                    data => `
                  <div>· ${data.pyeong}평 ${data.count}건</div>
                `
                  )
                  .join('')}
              </div>
            `;

            const chartAreaWidth = containerWidth - margin.left - margin.right;
            const chartCenter = chartAreaWidth / 2;
            const tooltipWidth = 200;

            let tooltipX: number;
            if (lineX < chartCenter) {
              tooltipX = lineX + margin.left + 10;
            } else {
              tooltipX = lineX + margin.left - tooltipWidth + 45;
            }

            tooltip
              .style('opacity', 1)
              .style('position', 'absolute')
              .style('left', `${tooltipX}px`)
              .style('top', `${margin.top + 10}px`)
              .style('z-index', '1000')
              .html(tooltipContent);
          }
        };

        // 초기 상태 설정 (가장 최근 데이터 표시)
        const showInitialTooltip = () => {
          if (chartData.length > 0) {
            const lastData = chartData[chartData.length - 1];
            const dateStr = `${lastData.date.getFullYear()}-${lastData.date.getMonth()}`;
            lastSelectedDate = dateStr;
            updateTooltipByDate(dateStr);
          }
        };

        // 초기 상태 표시
        showInitialTooltip();
      } else {
        // 모바일: 드래그 이벤트
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

        let isDragging = false;
        let lastSelectedDate: string | null = null;

        mouseArea
          .style('touch-action', 'none')
          .on('touchstart', event => {
            event.preventDefault();
            isDragging = true;
            const touch = event.touches[0];
            const rect = svg.node()!.getBoundingClientRect();
            const x = touch.clientX - rect.left - margin.left;
            const selectedDate = updateTooltip(x);
            if (selectedDate) {
              lastSelectedDate = selectedDate;
            }
          })
          .on('touchmove', event => {
            event.preventDefault();
            if (!isDragging) return;
            const touch = event.touches[0];
            const rect = svg.node()!.getBoundingClientRect();
            const x = touch.clientX - rect.left - margin.left;
            const selectedDate = updateTooltip(x);
            if (selectedDate) {
              lastSelectedDate = selectedDate;
            }
          })
          .on('touchend', event => {
            event.preventDefault();
            isDragging = false;
            // 터치 종료 후에도 마지막 선택된 데이터 계속 표시
            if (lastSelectedDate) {
              updateTooltipByDate(lastSelectedDate);
            }
          })
          .on('touchcancel', event => {
            event.preventDefault();
            isDragging = false;
            // 터치 취소 후에도 마지막 선택된 데이터 계속 표시
            if (lastSelectedDate) {
              updateTooltipByDate(lastSelectedDate);
            }
          });

        // 툴팁 업데이트 함수
        const updateTooltip = (x: number): string | null => {
          const domain = currentXScale.domain();
          const step = currentXScale.step();
          const index = Math.min(
            Math.max(0, Math.round(x / step)),
            domain.length - 1
          );
          const dateStr = domain[index];
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
            const lineX = currentXScale(dateStr)!;
            verticalLine
              .attr('x1', lineX)
              .attr('x2', lineX)
              .attr('y1', 0)
              .attr('y2', chartHeight)
              .style('opacity', 1);

            // 평형대별로 정렬
            const sortedData = monthData.sort((a, b) => a.pyeong - b.pyeong);

            const totalCount = sortedData.reduce(
              (sum, data) => sum + data.count,
              0
            );
            const tooltipContent = `
              <div class="space-y-1">
                <div>${d3.timeFormat('%Y년 %m월')(date)} <strong>(${totalCount}건)</strong></div>
                ${sortedData
                  .map(
                    data => `
                  <div>· ${data.pyeong}평 ${data.count}건</div>
                `
                  )
                  .join('')}
              </div>
            `;

            // 툴팁 위치 계산
            const tooltipWidth = 200;
            const chartAreaWidth = containerWidth - margin.left - margin.right;
            const chartCenter = chartAreaWidth / 2;

            // 차트 중앙을 기준으로 세로선 위치에 따라 툴팁 위치 결정
            let tooltipX: number;

            if (lineX < chartCenter) {
              // 세로선이 차트 중앙보다 좌측에 있으면 툴팁을 우측에 표시
              tooltipX = lineX + margin.left + 10;
            } else {
              // 세로선이 차트 중앙보다 우측에 있으면 툴팁을 좌측에 표시
              tooltipX = lineX + margin.left - tooltipWidth + 25;
            }

            tooltip
              .style('opacity', 1)
              .style('position', 'absolute')
              .style('left', `${tooltipX}px`)
              .style('top', `${margin.top + 10}px`)
              .style('z-index', '1000')
              .html(tooltipContent);

            return dateStr;
          }
          return null;
        };

        // 날짜로 툴팁 업데이트하는 함수
        const updateTooltipByDate = (dateStr: string) => {
          const [year, month] = dateStr.split('-').map(Number);
          const date = new Date(year, month);

          const monthData = chartData.filter(
            d =>
              d.date.getFullYear() === date.getFullYear() &&
              d.date.getMonth() === date.getMonth() &&
              d.count > 0
          );

          if (monthData.length > 0) {
            const lineX = currentXScale(dateStr)!;
            verticalLine
              .attr('x1', lineX)
              .attr('x2', lineX)
              .attr('y1', 0)
              .attr('y2', chartHeight)
              .style('opacity', 1);

            const sortedData = monthData.sort((a, b) => a.pyeong - b.pyeong);
            const totalCount = sortedData.reduce(
              (sum, data) => sum + data.count,
              0
            );
            const tooltipContent = `
              <div class="space-y-1">
                <div>${d3.timeFormat('%Y년 %m월')(date)} <strong>(${totalCount}건)</strong></div>
                ${sortedData
                  .map(
                    data => `
                  <div>· ${data.pyeong}평 ${data.count}건</div>
                `
                  )
                  .join('')}
              </div>
            `;

            const tooltipWidth = 200;
            const chartAreaWidth = containerWidth - margin.left - margin.right;
            const chartCenter = chartAreaWidth / 2;

            let tooltipX: number;
            if (lineX < chartCenter) {
              tooltipX = lineX + margin.left + 10;
            } else {
              tooltipX = lineX + margin.left - tooltipWidth + 25;
            }

            tooltip
              .style('opacity', 1)
              .style('position', 'absolute')
              .style('left', `${tooltipX}px`)
              .style('top', `${margin.top + 10}px`)
              .style('z-index', '1000')
              .html(tooltipContent);
          }
        };

        // 초기 상태 설정 (가장 최근 데이터 표시)
        if (chartData.length > 0) {
          const lastData = chartData[chartData.length - 1];
          const dateStr = `${lastData.date.getFullYear()}-${lastData.date.getMonth()}`;
          lastSelectedDate = dateStr;
          updateTooltipByDate(dateStr);
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
    legendData,
  ]);

  // D3 차트 렌더링
  useEffect(() => {
    if (!svgRef.current || isLoading) return;
    updateChart();
  }, [chartData, isLoading, updateChart]);

  return {
    isLoading,
    legendData,
    selectedPyeongs,
    togglePyeong,
    toggleAllPyeongs,
  };
}
