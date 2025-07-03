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

import { CHART_COLORS } from '../consts/colors';
import { calculatePyeong } from '../services/calculator';

export interface CombinedChartData {
  date: Date;
  averagePrice: number;
  count: number;
  size: number;
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

export function useCombinedChart({
  items,
  svgRef,
  tooltipRef,
  height: containerHeight,
  margin,
  period,
}: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [containerWidth, setContainerWidth] = useState(1024);
  const [selectedPyeongs, setSelectedPyeongs] = useState<Set<number>>(
    new Set()
  );

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

    const result: CombinedChartData[] = [];

    // 각 월별로 평형대별 데이터 생성
    Array.from(monthlyData, ([date, items]) => {
      if (items.length > 0) {
        // 평형대별로 그룹화
        const pyeongGroups = d3.group(items, d => calculatePyeong(d.size));

        Array.from(pyeongGroups, ([pyeong, pyeongItems]) => {
          const validItems = pyeongItems.filter(item => item.tradeAmount > 0);

          if (validItems.length > 0) {
            const allSizes = Array.from(
              new Set(validItems.map(item => item.size))
            ).sort((a, b) => a - b);

            result.push({
              date: date,
              averagePrice: d3.mean(validItems, d => d.tradeAmount) || 0,
              count: validItems.length,
              size: allSizes[0],
              sizes: allSizes,
              pyeong: pyeong,
            });
          }
        });
      }
    });

    return result.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [items, period, selectedPyeongs]);

  // 범례 데이터 계산
  const legendData = useMemo(() => {
    if (!items.length) return [];

    const now = new Date();
    const filteredItems =
      period === 0
        ? items
        : items.filter(item => {
            const tradeDate = new Date(item.tradeDate);
            return tradeDate >= subMonths(now, period);
          });

    const sizeGroups = d3.group(filteredItems, d => calculatePyeong(d.size));
    const sortedPyeongs = Array.from(sizeGroups.keys()).sort((a, b) => a - b);

    return sortedPyeongs.map((pyeong, index) => {
      const items = sizeGroups.get(pyeong) || [];
      const allSizes = Array.from(new Set(items.map(item => item.size))).sort(
        (a, b) => a - b
      );

      return {
        pyeong,
        color: CHART_COLORS[index % CHART_COLORS.length],
        sizes: allSizes,
      };
    });
  }, [items, period]);

  // 차트 영역 크기 계산
  const chartWidth = Math.max(containerWidth - margin.left - margin.right, 0);
  const chartHeight = containerHeight - margin.top - margin.bottom;

  // 스케일 계산
  const xScale = useMemo(() => {
    if (!chartData.length) {
      return d3
        .scaleTime()
        .domain([new Date(), new Date()])
        .range([0, chartWidth]);
    }

    const dates = Array.from(new Set(chartData.map(d => d.date.getTime())))
      .map(time => new Date(time))
      .sort((a, b) => a.getTime() - b.getTime());

    return d3
      .scaleTime()
      .domain(d3.extent(dates) as [Date, Date])
      .range([0, chartWidth]);
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

    const maxCount = d3.max(chartData, d => d.count) || 0;
    return d3
      .scaleLinear()
      .domain([0, maxCount * 1.1])
      .range([chartHeight, 0]);
  }, [chartData, chartHeight]);

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
        .select('body')
        .append('div')
        .style('position', 'absolute')
        .style('visibility', 'hidden')
        .style('background-color', 'rgba(0, 0, 0, 0.8)')
        .style('color', 'white')
        .style('padding', '8px 12px')
        .style('border-radius', '4px')
        .style('font-size', '12px')
        .style('pointer-events', 'none')
        .style('z-index', '1000')
        .node() as HTMLDivElement;
    }

    // x축
    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(
        d3.axisBottom(xScale).tickFormat(domainValue => {
          if (domainValue instanceof Date) {
            return d3.timeFormat('%Y-%m')(domainValue);
          }
          return '';
        })
      );

    // 왼쪽 y축 (가격)
    g.append('g').call(
      d3
        .axisLeft(yPriceScale)
        .tickFormat(d => `${Math.round(Number(d) / 100000000)}억`)
    );

    // 오른쪽 y축 (건수)
    g.append('g')
      .attr('transform', `translate(${chartWidth},0)`)
      .call(d3.axisRight(yCountScale).tickFormat(d => `${d}건`));

    // 평형별로 그룹화
    const pyeongGroups = d3.group(chartData, d => d.pyeong);

    Array.from(pyeongGroups, ([pyeong, data]) => {
      const color =
        CHART_COLORS[
          legendData.findIndex(l => l.pyeong === pyeong) % CHART_COLORS.length
        ];

      // 거래건수 바 차트
      g.selectAll(`.bar-${pyeong}`)
        .data(data)
        .enter()
        .append('rect')
        .attr('class', `bar-${pyeong}`)
        .attr('x', d => xScale(d.date) - 10)
        .attr('y', d => yCountScale(d.count))
        .attr('width', 20)
        .attr('height', d => chartHeight - yCountScale(d.count))
        .attr('fill', '#e5e7eb')
        .attr('opacity', 0.7);

      // 실거래가 라인 차트
      const line = d3
        .line<CombinedChartData>()
        .x(d => xScale(d.date))
        .y(d => yPriceScale(d.averagePrice))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(data.sort((a, b) => a.date.getTime() - b.date.getTime()))
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 2)
        .attr('d', line);

      // 데이터 포인트
      g.selectAll(`.point-${pyeong}`)
        .data(data)
        .enter()
        .append('circle')
        .attr('class', `point-${pyeong}`)
        .attr('cx', d => xScale(d.date))
        .attr('cy', d => yPriceScale(d.averagePrice))
        .attr('r', 4)
        .attr('fill', color)
        .attr('stroke', 'white')
        .attr('stroke-width', 2);
    });

    // 마우스 인터랙션을 위한 투명한 오버레이
    const overlay = g
      .append('rect')
      .attr('class', 'overlay')
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .style('fill', 'none')
      .style('pointer-events', 'all');

    // 툴팁 업데이트 함수
    const updateTooltip = (mouseX: number) => {
      if (!tooltipRef.current) return;

      // 마우스 위치에서 가장 가까운 날짜 찾기
      const mouseDate = xScale.invert(mouseX);
      const sortedDates = Array.from(
        new Set(chartData.map(d => d.date.getTime()))
      )
        .map(time => new Date(time))
        .sort((a, b) => a.getTime() - b.getTime());

      const closestDate = sortedDates.reduce((prev, curr) => {
        return Math.abs(curr.getTime() - mouseDate.getTime()) <
          Math.abs(prev.getTime() - mouseDate.getTime())
          ? curr
          : prev;
      });

      // 해당 날짜의 모든 평형 데이터 수집
      const dateData = chartData.filter(
        d => d.date.getTime() === closestDate.getTime()
      );

      if (dateData.length === 0) return;

      // 툴팁 내용 생성
      const formatDate = d3.timeFormat('%Y년 %m월');
      const formatPrice = (price: number) =>
        `${Math.round(price / 100000000)}억`;

      let tooltipContent = `<div style="font-weight: bold; margin-bottom: 4px;">${formatDate(closestDate)}</div>`;

      dateData
        .sort((a, b) => a.pyeong - b.pyeong)
        .forEach(d => {
          const color =
            CHART_COLORS[
              legendData.findIndex(l => l.pyeong === d.pyeong) %
                CHART_COLORS.length
            ];
          tooltipContent += `
            <div style="display: flex; align-items: center; margin: 2px 0;">
              <div style="width: 12px; height: 12px; background-color: ${color}; margin-right: 6px; border-radius: 2px;"></div>
              <span style="margin-right: 8px;">${d.pyeong}평:</span>
              <span style="margin-right: 8px;">${formatPrice(d.averagePrice)}</span>
              <span style="color: #999;">(${d.count}건)</span>
            </div>
          `;
        });

      tooltipRef.current.innerHTML = tooltipContent;

      // 수직선 표시
      g.selectAll('.hover-line').remove();
      g.append('line')
        .attr('class', 'hover-line')
        .attr('x1', xScale(closestDate))
        .attr('x2', xScale(closestDate))
        .attr('y1', 0)
        .attr('y2', chartHeight)
        .attr('stroke', '#999')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '3,3');
    };

    // 마우스 이벤트 처리
    overlay
      .on('mouseover', () => {
        if (tooltipRef.current) {
          d3.select(tooltipRef.current).style('visibility', 'visible');
        }
      })
      .on('mousemove', event => {
        const [mouseX] = d3.pointer(event);
        updateTooltip(mouseX);

        if (tooltipRef.current) {
          const tooltipWidth = tooltipRef.current.offsetWidth;
          const tooltipHeight = tooltipRef.current.offsetHeight;

          d3.select(tooltipRef.current)
            .style(
              'left',
              `${Math.min(event.pageX + 10, window.innerWidth - tooltipWidth - 10)}px`
            )
            .style(
              'top',
              `${Math.max(event.pageY - tooltipHeight - 10, 10)}px`
            );
        }
      })
      .on('mouseout', () => {
        if (tooltipRef.current) {
          d3.select(tooltipRef.current).style('visibility', 'hidden');
        }
        g.selectAll('.hover-line').remove();
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
    legendData,
  ]);

  // 초기 선택 상태 설정
  useEffect(() => {
    if (legendData.length > 0 && selectedPyeongs.size === 0) {
      setSelectedPyeongs(new Set(legendData.map(item => item.pyeong)));
    }
  }, [legendData]);

  // 컴포넌트 언마운트 시 툴팁 정리
  useEffect(() => {
    return () => {
      if (tooltipRef.current) {
        d3.select(tooltipRef.current).remove();
        tooltipRef.current = null;
      }
    };
  }, []);

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

  const toggleAllPyeongs = () => {
    if (selectedPyeongs.size === legendData.length) {
      setSelectedPyeongs(new Set());
    } else {
      setSelectedPyeongs(new Set(legendData.map(item => item.pyeong)));
    }
  };

  return {
    isLoading,
    legendData,
    selectedPyeongs,
    togglePyeong,
    toggleAllPyeongs,
  };
}
