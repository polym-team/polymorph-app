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

  const [isFirstRender, setIsFirstRender] = useState(true);
  const [prevChartDataKey, setPrevChartDataKey] = useState<string>('');

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
    const barWidth =
      dateStrings.length > 0
        ? Math.max(
            1,
            (chartWidth - dateStrings.length * 4) / dateStrings.length
          )
        : 0;

    // 바가 차트 영역을 벗어나지 않도록 range 조정
    const margin = Math.max(barWidth / 2, 10); // 최소 10px 여백

    return d3
      .scalePoint()
      .domain(dateStrings)
      .range([margin, chartWidth - margin])
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
    const yearTicks = xScale
      .domain()
      .filter(dateString => dateString.endsWith('-01'))
      .map(dateString => dateString.split('-')[0]);

    // 모바일에서는 2년마다 하나씩만 표시
    const displayTicks =
      containerWidth <= 640
        ? yearTicks.filter((_, index) => index % 2 === 0)
        : yearTicks;

    const xAxis = g
      .append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(
        d3
          .axisBottom(xScale)
          .tickValues(displayTicks.map(year => `${year}-01`))
          .tickFormat(dateString => {
            if (dateString.endsWith('-01')) {
              return dateString.split('-')[0]; // 년도만 추출
            }
            return '';
          })
      );

    // 모바일에서 틱 텍스트 기울이기
    if (containerWidth <= 640) {
      xAxis
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-0.8em')
        .attr('dy', '0.15em')
        .attr('transform', 'rotate(-45)');
    }

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

    // 유니크한 날짜들 추출
    const uniqueDates = Array.from(dateCountMap.keys()).sort();

    // 바의 너비 계산 (스케일 계산과 동일한 로직)
    const barWidth =
      uniqueDates.length > 0
        ? Math.max(
            1,
            (chartWidth - uniqueDates.length * 4) / uniqueDates.length
          )
        : 0;

    // 거래건수 바 차트 (날짜별로 합산된 데이터) - x축 선보다 먼저 그리기
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

      if (isFirstRender) {
        // 첫 번째 렌더링일 때만 애니메이션 실행
        bar
          .attr('y', chartHeight) // 시작 위치를 차트 하단으로
          .attr('height', 0) // 시작 높이를 0으로
          .transition()
          .duration(500)
          .delay((_, i) => i * 30) // 순차적으로 애니메이션
          .attr('y', yCountScale(totalCount))
          .attr('height', chartHeight - yCountScale(totalCount));
      } else {
        // 데이터가 변경되지 않았으면 바로 최종 위치에 배치
        bar
          .attr('y', yCountScale(totalCount))
          .attr('height', chartHeight - yCountScale(totalCount));
      }
    });

    // 평형별 실거래가 라인 차트
    Array.from(pyeongGroups, ([pyeong, data]) => {
      const color =
        CHART_COLORS[
          legendData.findIndex(l => l.pyeong === pyeong) % CHART_COLORS.length
        ];

      // 실거래가 라인 차트
      const line = d3
        .line<CombinedChartData>()
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

      if (isFirstRender) {
        // 첫 번째 렌더링일 때만 애니메이션 실행
        path
          .attr('stroke-dasharray', function () {
            return this.getTotalLength();
          })
          .attr('stroke-dashoffset', function () {
            return this.getTotalLength();
          })
          .transition()
          .duration(600)
          .delay((_, i) => i * 100) // 평형별로 순차 애니메이션
          .attr('stroke-dashoffset', 0);
      }

      // 데이터 포인트 (기본적으로 숨김)
      const points = g
        .selectAll(`.point-${pyeong}`)
        .data(data)
        .enter()
        .append('circle')
        .attr('class', `point-${pyeong}`)
        .attr('cx', d => xScale(formatDateForScale(d.date)) || 0)
        .attr('r', 4)
        .attr('fill', color)
        .attr('stroke', 'white')
        .attr('stroke-width', 2)
        .style('opacity', 0); // 기본적으로 숨김

      if (isFirstRender) {
        // 첫 번째 렌더링일 때만 애니메이션 실행
        points
          .attr('cy', chartHeight) // 시작 위치를 차트 하단으로
          .transition()
          .duration(400)
          .delay((_, i) => i * 50 + 200) // 라인 애니메이션 후 시작
          .attr('cy', d => yPriceScale(d.averagePrice));
      } else {
        // 데이터가 변경되지 않았으면 바로 최종 위치에 배치
        points.attr('cy', d => yPriceScale(d.averagePrice));
      }
    });

    // x축과 y축 사이의 빈틈을 메우는 실선 (바 차트보다 나중에 그려서 위에 표시)
    const xRange = xScale.range();
    const leftGap = xRange[0]; // 왼쪽 빈틈
    const rightGap = chartWidth - xRange[1]; // 오른쪽 빈틈

    // 왼쪽 실선 (왼쪽 y축에서 x축 시작점까지)
    if (leftGap > 0) {
      g.append('line')
        .attr('x1', 0)
        .attr('x2', xRange[0])
        .attr('y1', chartHeight + 0.5)
        .attr('y2', chartHeight + 0.5)
        .attr('stroke', '#000')
        .attr('stroke-width', 1);
    }

    // 오른쪽 실선 (x축 끝점에서 오른쪽 y축까지)
    if (rightGap > 0) {
      g.append('line')
        .attr('x1', xRange[1])
        .attr('x2', chartWidth)
        .attr('y1', chartHeight + 0.5)
        .attr('y2', chartHeight + 0.5)
        .attr('stroke', '#000')
        .attr('stroke-width', 1);
    }

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

      // Point scale에서는 invert가 없으므로 가장 가까운 점을 찾는 방식 사용
      const domain = xScale.domain();
      const range = xScale.range();
      const step = (range[1] - range[0]) / (domain.length - 1);

      const index = Math.round(mouseX / step);
      const closestDateString =
        domain[Math.max(0, Math.min(index, domain.length - 1))];

      if (!closestDateString) return;

      // 해당 날짜 문자열과 일치하는 데이터 찾기
      const dateData = chartData.filter(
        d => formatDateForScale(d.date) === closestDateString
      );

      if (dateData.length === 0) return;

      // 모든 데이터 포인트 숨기기
      g.selectAll('[class*="point-"]').style('opacity', 0);

      // 해당 월의 데이터 포인트만 표시
      dateData.forEach(d => {
        g.selectAll(`.point-${d.pyeong}`)
          .filter(
            pointData =>
              formatDateForScale((pointData as CombinedChartData).date) ===
              closestDateString
          )
          .style('opacity', 1);
      });

      // 툴팁 내용 생성
      const formatPrice = (price: number) =>
        `${Math.round(price / 100000000)}억`;

      // 해당 날짜의 총 거래건수 계산
      const totalCount = dateData.reduce((sum, d) => sum + d.count, 0);

      // 날짜 형식을 "2025년 1월" 형태로 변환
      const [year, month] = closestDateString.split('-');
      const formattedDate = `${year}년 ${parseInt(month)}월`;

      let tooltipContent = `<div style=\"font-weight: bold; margin-bottom: 4px;\">${formattedDate}(총 ${totalCount}건)</div>`;

      dateData
        .sort((a, b) => a.pyeong - b.pyeong)
        .forEach(d => {
          const legendItem = legendData.find(l => l.pyeong === d.pyeong);
          const color = legendItem
            ? legendItem.color
            : CHART_COLORS[d.pyeong % CHART_COLORS.length];
          tooltipContent += `
            <div style=\"display: flex; align-items: center; margin: 2px 0;\">
              <div style=\"width: 12px; height: 12px; background-color: ${color}; margin-right: 6px; border-radius: 2px;\"></div>
              <span style=\"margin-right: 8px;\">${d.pyeong}평:</span>
              <span style=\"margin-right: 8px;\">${formatPrice(d.averagePrice)}</span>
              <span style=\"color: #999;\">(${d.count}건)</span>
            </div>
          `;
        });

      tooltipRef.current.innerHTML = tooltipContent;

      // 수직선 표시
      g.selectAll('.hover-line').remove();
      const lineX = xScale(closestDateString) || 0;
      g.append('line')
        .attr('class', 'hover-line')
        .attr('x1', lineX)
        .attr('x2', lineX)
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
          const containerRect =
            svgRef.current?.parentElement?.getBoundingClientRect();

          if (containerRect) {
            // 세로선 위치를 정확히 계산
            const domain = xScale.domain();
            const range = xScale.range();
            const step = (range[1] - range[0]) / (domain.length - 1);
            const index = Math.round(mouseX / step);
            const closestDateString =
              domain[Math.max(0, Math.min(index, domain.length - 1))];
            const lineX = xScale(closestDateString) || 0;

            // 차트 컨테이너 내에서의 상대적 위치 계산
            const relativeLineX = margin.left + lineX;
            const chartCenter = margin.left + chartWidth / 2;
            const isLeftSide = relativeLineX < chartCenter;

            let left: number;
            if (isLeftSide) {
              // 세로선이 좌측이면 툴팁을 우측에 배치
              left = relativeLineX + 20;
            } else {
              // 세로선이 우측이면 툴팁을 좌측에 배치
              left = relativeLineX - tooltipWidth - 10;
            }

            // 컨테이너 경계 체크
            const maxLeft = containerRect.width - tooltipWidth - 10;
            left = Math.max(10, Math.min(left, maxLeft));

            // 세로 위치는 차트 상단에서 약간 아래
            const top = margin.top + 20;

            d3.select(tooltipRef.current)
              .style('left', `${left}px`)
              .style('top', `${top}px`)
              .style('transform', 'none');
          }
        }
      })
      .on('mouseout', () => {
        // 마우스가 차트 영역을 벗어나도 툴팁과 세로선을 유지
        // 툴팁과 세로선은 그대로 두고, 데이터 포인트만 숨김
        g.selectAll('[class*="point-"]').style('opacity', 0);
      });

    // PC 버전에서 기본적으로 가장 오른쪽 데이터에 세로선과 툴팁 노출
    if (chartData.length > 0) {
      const domain = xScale.domain();
      const lastDateString = domain[domain.length - 1];

      if (lastDateString) {
        // 가장 오른쪽 데이터에 대한 툴팁 업데이트
        const lastDateData = chartData.filter(
          d => formatDateForScale(d.date) === lastDateString
        );

        if (lastDateData.length > 0) {
          // 모든 데이터 포인트 숨기기
          g.selectAll('[class*="point-"]').style('opacity', 0);

          // 해당 월의 데이터 포인트만 표시
          lastDateData.forEach(d => {
            g.selectAll(`.point-${d.pyeong}`)
              .filter(
                pointData =>
                  formatDateForScale((pointData as CombinedChartData).date) ===
                  lastDateString
              )
              .style('opacity', 1);
          });

          // 툴팁 내용 생성
          const formatPrice = (price: number) =>
            `${Math.round(price / 100000000)}억`;

          const totalCount = lastDateData.reduce((sum, d) => sum + d.count, 0);
          const [year, month] = lastDateString.split('-');
          const formattedDate = `${year}년 ${parseInt(month)}월`;

          let tooltipContent = `<div style=\"font-weight: bold; margin-bottom: 4px;\">${formattedDate}(총 ${totalCount}건)</div>`;

          lastDateData
            .sort((a, b) => a.pyeong - b.pyeong)
            .forEach(d => {
              const legendItem = legendData.find(l => l.pyeong === d.pyeong);
              const color = legendItem
                ? legendItem.color
                : CHART_COLORS[d.pyeong % CHART_COLORS.length];
              tooltipContent += `
                <div style=\"display: flex; align-items: center; margin: 2px 0;\">
                  <div style=\"width: 12px; height: 12px; background-color: ${color}; margin-right: 6px; border-radius: 2px;\"></div>
                  <span style=\"margin-right: 8px;\">${d.pyeong}평:</span>
                  <span style=\"margin-right: 8px;\">${formatPrice(d.averagePrice)}</span>
                  <span style=\"color: #999;\">(${d.count}건)</span>
                </div>
              `;
            });

          if (tooltipRef.current) {
            tooltipRef.current.innerHTML = tooltipContent;
            d3.select(tooltipRef.current).style('visibility', 'visible');

            // 툴팁 위치 계산
            const tooltipWidth = tooltipRef.current.offsetWidth;
            const containerRect =
              svgRef.current?.parentElement?.getBoundingClientRect();

            if (containerRect) {
              const lineX = xScale(lastDateString) || 0;
              const relativeLineX = margin.left + lineX;
              const chartCenter = margin.left + chartWidth / 2;
              const isLeftSide = relativeLineX < chartCenter;

              let left: number;
              if (isLeftSide) {
                left = relativeLineX + 20;
              } else {
                left = relativeLineX - tooltipWidth - 10;
              }

              const maxLeft = containerRect.width - tooltipWidth - 10;
              left = Math.max(10, Math.min(left, maxLeft));

              const top = margin.top + 20;

              d3.select(tooltipRef.current)
                .style('left', `${left}px`)
                .style('top', `${top}px`)
                .style('transform', 'none');
            }
          }

          // 수직선 표시
          g.selectAll('.hover-line').remove();
          const lineX = xScale(lastDateString) || 0;
          g.append('line')
            .attr('class', 'hover-line')
            .attr('x1', lineX)
            .attr('x2', lineX)
            .attr('y1', 0)
            .attr('y2', chartHeight)
            .attr('stroke', '#999')
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', '3,3');
        }
      }
    }

    setIsLoading(false);

    // 첫 번째 렌더링 완료 후 상태 업데이트
    if (isFirstRender) {
      setIsFirstRender(false);
    }

    // 데이터 변경 감지를 위한 키 업데이트
    const chartDataKey = JSON.stringify(
      chartData.map(d => ({ date: d.date, pyeong: d.pyeong }))
    );
    setPrevChartDataKey(chartDataKey);
  }, [
    chartData,
    chartWidth,
    chartHeight,
    xScale,
    yPriceScale,
    yCountScale,
    margin,
    isFirstRender,
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

  const togglePyeong = useCallback((pyeong: number) => {
    setSelectedPyeongs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pyeong)) {
        newSet.delete(pyeong);
      } else {
        newSet.add(pyeong);
      }
      return newSet;
    });
  }, []);

  const toggleAllPyeongs = useCallback(() => {
    if (selectedPyeongs.size === legendData.length) {
      setSelectedPyeongs(new Set());
    } else {
      setSelectedPyeongs(new Set(legendData.map(item => item.pyeong)));
    }
  }, [selectedPyeongs.size, legendData]);

  // 모바일용 툴팁 업데이트 함수
  const updateTooltipForMobile = useCallback(
    (touchX: number) => {
      if (!tooltipRef.current) return;

      // Point scale에서는 invert가 없으므로 가장 가까운 점을 찾는 방식 사용
      const domain = xScale.domain();
      const range = xScale.range();
      const step = (range[1] - range[0]) / (domain.length - 1);

      const index = Math.round(touchX / step);
      const closestDateString =
        domain[Math.max(0, Math.min(index, domain.length - 1))];

      if (!closestDateString) return;

      // 해당 날짜 문자열과 일치하는 데이터 찾기
      const dateData = chartData.filter(
        d => formatDateForScale(d.date) === closestDateString
      );

      if (dateData.length === 0) return;

      // 모든 데이터 포인트 숨기기
      const g = d3.select(svgRef.current).select('g');
      g.selectAll('[class*="point-"]').style('opacity', 0);

      // 해당 월의 데이터 포인트만 표시
      dateData.forEach(d => {
        g.selectAll(`.point-${d.pyeong}`)
          .filter(
            pointData =>
              formatDateForScale((pointData as CombinedChartData).date) ===
              closestDateString
          )
          .style('opacity', 1);
      });

      // 툴팁 내용 생성
      const formatPrice = (price: number) =>
        `${Math.round(price / 100000000)}억`;

      // 해당 날짜의 총 거래건수 계산
      const totalCount = dateData.reduce((sum, d) => sum + d.count, 0);

      // 날짜 형식을 "2025년 1월" 형태로 변환
      const [year, month] = closestDateString.split('-');
      const formattedDate = `${year}년 ${parseInt(month)}월`;

      let tooltipContent = `<div style=\"font-weight: bold; margin-bottom: 4px;\">${formattedDate}(총 ${totalCount}건)</div>`;

      dateData
        .sort((a, b) => a.pyeong - b.pyeong)
        .forEach(d => {
          const legendItem = legendData.find(l => l.pyeong === d.pyeong);
          const color = legendItem
            ? legendItem.color
            : CHART_COLORS[d.pyeong % CHART_COLORS.length];
          tooltipContent += `
            <div style=\"display: flex; align-items: center; margin: 2px 0;\">
              <div style=\"width: 12px; height: 12px; background-color: ${color}; margin-right: 6px; border-radius: 2px;\"></div>
              <span style=\"margin-right: 8px;\">${d.pyeong}평:</span>
              <span style=\"margin-right: 8px;\">${formatPrice(d.averagePrice)}</span>
              <span style=\"color: #999;\">(${d.count}건)</span>
            </div>
          `;
        });

      tooltipRef.current.innerHTML = tooltipContent;

      // 수직선 표시
      g.selectAll('.hover-line').remove();
      const lineX = xScale(closestDateString) || 0;
      g.append('line')
        .attr('class', 'hover-line')
        .attr('x1', lineX)
        .attr('x2', lineX)
        .attr('y1', 0)
        .attr('y2', chartHeight)
        .attr('stroke', '#999')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '3,3');

      // 모바일 툴팁 위치 계산
      const tooltipWidth = tooltipRef.current.offsetWidth;
      const containerRect =
        svgRef.current?.parentElement?.getBoundingClientRect();

      if (containerRect) {
        // 차트 컨테이너 내에서의 상대적 위치 계산
        const relativeLineX = margin.left + lineX;
        const chartCenter = margin.left + chartWidth / 2;
        const isLeftSide = relativeLineX < chartCenter;

        let left: number;
        if (isLeftSide) {
          // 세로선이 좌측이면 툴팁을 우측에 배치
          left = relativeLineX + 20;
        } else {
          // 세로선이 우측이면 툴팁을 좌측에 배치
          left = relativeLineX - tooltipWidth - 10;
        }

        // 컨테이너 경계 체크
        const maxLeft = containerRect.width - tooltipWidth - 10;
        left = Math.max(10, Math.min(left, maxLeft));

        // 세로 위치는 차트 상단에서 약간 아래
        const top = margin.top + 20;

        d3.select(tooltipRef.current)
          .style('left', `${left}px`)
          .style('top', `${top}px`)
          .style('transform', 'none');
      }
    },
    [chartData, xScale, chartWidth, chartHeight, margin.bottom]
  );

  // 모바일 터치 이벤트 핸들러들
  const handleMobileTouchStart = useCallback(
    (event: TouchEvent) => {
      if (!tooltipRef.current || !svgRef.current) return;

      const touch = event.touches[0];
      const containerRect =
        svgRef.current.parentElement?.getBoundingClientRect();
      if (!containerRect) return;

      const touchX = touch.clientX - containerRect.left - margin.left;

      // 툴팁 표시
      d3.select(tooltipRef.current).style('visibility', 'visible');
      updateTooltipForMobile(touchX);
    },
    [updateTooltipForMobile, margin.left]
  );

  const handleMobileTouchMove = useCallback(
    (event: TouchEvent) => {
      if (!tooltipRef.current || !svgRef.current) return;

      const touch = event.touches[0];
      const containerRect =
        svgRef.current.parentElement?.getBoundingClientRect();
      if (!containerRect) return;

      const touchX = touch.clientX - containerRect.left - margin.left;

      updateTooltipForMobile(touchX);
    },
    [updateTooltipForMobile, margin.left]
  );

  const handleMobileTouchEnd = useCallback(() => {
    if (!tooltipRef.current) return;

    // 툴팁 숨기기
    d3.select(tooltipRef.current).style('visibility', 'hidden');

    // 모든 데이터 포인트 숨기기
    const g = d3.select(svgRef.current).select('g');
    g.selectAll('[class*="point-"]').style('opacity', 0);
    g.selectAll('.hover-line').remove();
  }, []);

  return {
    chartData,
    legendData,
    isLoading,
    selectedPyeongs,
    togglePyeong,
    toggleAllPyeongs,
    updateTooltipForMobile,
    handleMobileTouchStart,
    handleMobileTouchMove,
    handleMobileTouchEnd,
  };
}
