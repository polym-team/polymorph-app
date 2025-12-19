import { formatKoreanAmountText } from '@/shared/utils/formatter';

import * as d3 from 'd3';
import { useEffect, useMemo, useRef, useState } from 'react';

import { CompareChartData } from '../types';

interface UseCompareChartViewProps {
  chartData: CompareChartData[];
  height: number;
}

const MARGIN = { top: 20, right: 0, bottom: 30, left: 30 };

export const useCompareChartView = ({
  chartData,
  height,
}: UseCompareChartViewProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [containerWidth, setContainerWidth] = useState(1024);

  useEffect(() => {
    if (!svgRef.current) return;

    const container = svgRef.current.parentElement;
    if (!container) return;

    const updateWidth = () => {
      if (container) {
        const width = container.clientWidth;
        if (width > 0) {
          setContainerWidth(width);
        }
      }
    };

    updateWidth();
    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [chartData]);

  const chartWidth = Math.max(containerWidth - MARGIN.left - MARGIN.right, 0);
  const chartHeight = height - MARGIN.top - MARGIN.bottom;

  const xScale = useMemo(() => {
    if (!chartData.length) {
      return d3.scalePoint().domain([]).range([0, chartWidth]);
    }

    const uniqueDates = Array.from(
      new Set(chartData.map(d => d.date.getTime()))
    )
      .map(time => new Date(time))
      .sort((a, b) => a.getTime() - b.getTime());

    const dateStrings = uniqueDates.map(date => d3.timeFormat('%Y-%m')(date));

    const marginPadding = 10;

    return d3
      .scalePoint()
      .domain(dateStrings)
      .range([marginPadding, chartWidth - marginPadding])
      .padding(0);
  }, [chartData, chartWidth]);

  const yScale = useMemo(() => {
    const bottomPadding = 50;

    if (!chartData.length) {
      return d3
        .scaleLinear()
        .domain([0, 100000])
        .range([chartHeight - bottomPadding, 0]);
    }

    const minPrice = d3.min(chartData, d => d.averagePrice) || 0;
    const maxPrice = d3.max(chartData, d => d.averagePrice) || 0;

    const eok = 100000000;

    const minDomain = Math.floor(minPrice / eok) * eok;
    const maxDomain = (Math.ceil(maxPrice / eok) + 1) * eok;

    return d3
      .scaleLinear()
      .domain([minDomain, maxDomain])
      .range([chartHeight - bottomPadding, 0]);
  }, [chartData, chartHeight]);

  const formatDateForScale = (date: Date) => d3.timeFormat('%Y-%m')(date);

  useEffect(() => {
    if (!svgRef.current || !chartData.length || chartWidth <= 0 || chartHeight <= 0) {
      setIsLoading(false);
      return;
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const chartGroup = svg
      .append('g')
      .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

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

    const allDates = xScale.domain();
    const januaryDates = allDates.filter(dateString => dateString.endsWith('-01'));

    const isDesktopView = window.matchMedia('(min-width: 1024px)').matches;
    const displayTicks = isDesktopView
      ? januaryDates
      : januaryDates.filter((_, index) => index % 2 === 0);

    const xAxis = chartGroup
      .append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(
        d3
          .axisBottom(xScale)
          .tickValues(displayTicks)
          .tickFormat(dateString => {
            const [year, month] = dateString.split('-');
            return `${year.slice(-2)}.${month}`;
          })
          .tickSize(0)
      );

    xAxis.selectAll('text').style('text-anchor', 'middle').attr('dy', '1em');
    xAxis.select('.domain').remove();

    displayTicks.forEach(dateString => {
      const xPos = xScale(dateString) || 0;
      chartGroup
        .append('line')
        .attr('x1', xPos)
        .attr('x2', xPos)
        .attr('y1', 0)
        .attr('y2', chartHeight)
        .attr('stroke', '#e5e7eb')
        .attr('stroke-width', 1)
        .attr('opacity', 0.5);
    });

    const maxPrice = yScale.domain()[1];
    const minPrice = yScale.domain()[0];

    const priceTickValues = [];
    const tickCount = 5;
    const interval = (maxPrice - minPrice) / (tickCount - 1);

    for (let i = 0; i < tickCount; i++) {
      priceTickValues.push(minPrice + interval * i);
    }

    const yAxis = chartGroup.append('g').call(
      d3
        .axisLeft(yScale)
        .tickFormat(d => `${Math.round(Number(d) / 100000000)}억`)
        .tickValues(priceTickValues)
        .tickSize(0)
    );

    yAxis.selectAll('.tick').each(function () {
      const tickValue = d3.select(this).datum() as number;
      chartGroup
        .append('line')
        .attr('x1', 0)
        .attr('x2', chartWidth)
        .attr('y1', yScale(tickValue))
        .attr('y2', yScale(tickValue))
        .attr('stroke', '#e5e7eb')
        .attr('stroke-width', 1)
        .attr('opacity', 0.5);
    });

    yAxis.select('.domain').remove();

    const apartGroups = d3.group(chartData, d => d.apartId);

    Array.from(apartGroups, ([, data]) => {
      const color = data[0]?.color || '#3b82f6';

      const sortedData = data.sort((a, b) => a.date.getTime() - b.date.getTime());

      const line = d3
        .line<CompareChartData>()
        .x(d => xScale(formatDateForScale(d.date)) || 0)
        .y(d => yScale(d.averagePrice))
        .curve(d3.curveMonotoneX);

      const path = chartGroup
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

      const pointRadius = 2;
      sortedData.forEach(d => {
        const xPos = xScale(formatDateForScale(d.date)) || 0;
        const yPos = yScale(d.averagePrice);

        const point = chartGroup
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
      .attr('y2', chartHeight);

    const interactionGroup = svg
      .append('g')
      .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

    const interactionLayer = interactionGroup
      .append('rect')
      .attr('class', 'interaction-layer')
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .attr('fill', 'transparent')
      .style('cursor', 'crosshair');

    const uniqueDates = Array.from(
      new Set(chartData.map(d => formatDateForScale(d.date)))
    ).sort();

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

    const showTooltip = (dateString: string) => {
      const xPos = xScale(dateString) || 0;

      verticalLine.attr('x1', xPos).attr('x2', xPos).style('opacity', 1);

      const [year, month] = dateString.split('-');
      const formattedDate = `${year}년 ${parseInt(month)}월`;

      const dataForDate = chartData.filter(
        d => formatDateForScale(d.date) === dateString
      );

      const apartDataHTML = dataForDate
        .map(d => {
          const formattedPrice = formatKoreanAmountText(d.averagePrice).replace(
            '원',
            ''
          );
          const priceWithHighlight = formattedPrice.replace(
            /(\d+)/g,
            '<span class="text-primary">$1</span>'
          );
          return `
            <p class="text-sm lg:text-base mt-1 whitespace-nowrap text-gray-900">
              <span class="block h-2 w-2 rounded-sm inline-block mr-1" style="background-color: ${d.color}"></span>
              ${d.apartName}: 평균 ${priceWithHighlight}
            </p>
          `;
        })
        .join('');

      const tooltipContent = `
        <div class="text-sm lg:text-base">
          <span class="text-gray-500">${formattedDate}</span>
        </div>
        <div class="mt-2">
          ${apartDataHTML}
        </div>
      `;

      if (tooltipRef.current) {
        tooltipRef.current.innerHTML = tooltipContent;

        tooltipRef.current.offsetHeight;

        const tooltipWidth = tooltipRef.current.offsetWidth;
        const chartCenter = chartWidth / 2;
        const tooltipOffset = 12;

        const isLeftSide = xPos < chartCenter;

        let tooltipLeft: number;
        if (isLeftSide) {
          tooltipLeft = MARGIN.left + xPos + tooltipOffset;
        } else {
          tooltipLeft = MARGIN.left + xPos - tooltipWidth - tooltipOffset;
        }

        const minLeft = MARGIN.left + 8;
        const maxLeft = MARGIN.left + chartWidth - tooltipWidth - 8;
        tooltipLeft = Math.max(minLeft, Math.min(maxLeft, tooltipLeft));

        tooltipRef.current.style.left = `${tooltipLeft}px`;
        tooltipRef.current.style.top = `${MARGIN.top + 10}px`;
        tooltipRef.current.style.opacity = '1';
      }
    };

    const hideTooltip = () => {
      verticalLine.style('opacity', 0);
      if (tooltipRef.current) {
        tooltipRef.current.style.opacity = '0';
      }
    };

    const isDesktop = () => window.matchMedia('(min-width: 1024px)').matches;

    let isInteracting = false;

    const handlePointerMove = (event: PointerEvent) => {
      const svgRect = svgRef.current?.getBoundingClientRect();
      if (!svgRect) return;

      let mouseX = event.clientX - svgRect.left - MARGIN.left;

      if (mouseX < 0) {
        mouseX = 0;
      } else if (mouseX > chartWidth) {
        mouseX = chartWidth;
      }

      const nearestDate = findNearestDate(mouseX);

      if (nearestDate) {
        if (isDesktop()) {
          showTooltip(nearestDate);
        } else {
          if (isInteracting) {
            showTooltip(nearestDate);
          }
        }
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (!isDesktop()) {
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
        isInteracting = false;
        hideTooltip();
      }
    };

    const handlePointerLeave = () => {
      if (isDesktop()) {
        hideTooltip();
      } else {
        if (isInteracting) {
          isInteracting = false;
          hideTooltip();
        }
      }
    };

    const interactionNode = interactionLayer.node();
    if (interactionNode) {
      interactionNode.addEventListener('pointerdown', handlePointerDown);
      interactionNode.addEventListener('pointermove', handlePointerMove);
      interactionNode.addEventListener('pointerup', handlePointerUp);
      interactionNode.addEventListener('pointerleave', handlePointerLeave);
      interactionNode.addEventListener('pointercancel', handlePointerUp);
    }

    if (uniqueDates.length > 0) {
      const rightmostDate = uniqueDates[uniqueDates.length - 1];
      showTooltip(rightmostDate);
    }

    setIsLoading(false);

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
    yScale,
    containerWidth,
  ]);

  return {
    svgRef,
    isLoading,
  };
};
