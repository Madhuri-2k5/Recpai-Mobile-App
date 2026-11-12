import Svg, { Defs, LinearGradient, Path, Rect, Stop, Text as SvgText } from 'react-native-svg';

import { NutriColors } from '@/constants/nutri';
import { formatNumber, WEEK_DAYS, type WeeklySeries } from '@/data/dashboardMockData';

type WeeklyBarChartProps = {
  series: WeeklySeries;
  width: number;
  height: number;
  scale: number;
};

export function WeeklyBarChart({ series, width, height, scale }: WeeklyBarChartProps) {
  const yAxisWidth = 38 * scale;
  const xLabelHeight = 20 * scale;
  const topPad = 7 * scale;
  const plotWidth = width - yAxisWidth;
  const plotHeight = height - xLabelHeight - topPad;
  const barWidth = 19 * scale;
  const slot = plotWidth / series.values.length;
  const lineCount = Math.round(series.max / series.step);
  const radius = Math.min(4.5 * scale, barWidth / 2);

  const gridLines = Array.from({ length: lineCount + 1 }, (_, i) => i * series.step);

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id="weekly-bar" x1="0" y1="1" x2="0" y2="0">
          <Stop offset="0" stopColor="#2E7CF6" />
          <Stop offset="0.55" stopColor="#6D5BF8" />
          <Stop offset="1" stopColor="#A05CFF" />
        </LinearGradient>
      </Defs>
      {gridLines.map((value) => {
        const y = topPad + plotHeight - (value / series.max) * plotHeight;
        return (
          <Rect
            key={`grid-${value}`}
            x={yAxisWidth}
            y={y}
            width={plotWidth}
            height={1}
            fill="#182B4B"
          />
        );
      })}
      {gridLines.map((value) => {
        const y = topPad + plotHeight - (value / series.max) * plotHeight;
        return (
          <SvgText
            key={`label-${value}`}
            x={yAxisWidth - 7 * scale}
            y={y + 3.5 * scale}
            fontSize={10.5 * scale}
            fill={NutriColors.textFaint}
            textAnchor="end">
            {formatNumber(value)}
          </SvgText>
        );
      })}
      {series.values.map((value, index) => {
        const barHeight = (value / series.max) * plotHeight;
        const x = yAxisWidth + slot * index + (slot - barWidth) / 2;
        const y = topPad + plotHeight - barHeight;
        const r = Math.min(radius, barHeight);
        const baseline = topPad + plotHeight;
        const path = [
          `M ${x} ${baseline}`,
          `L ${x} ${y + r}`,
          `Q ${x} ${y} ${x + r} ${y}`,
          `L ${x + barWidth - r} ${y}`,
          `Q ${x + barWidth} ${y} ${x + barWidth} ${y + r}`,
          `L ${x + barWidth} ${baseline}`,
          'Z',
        ].join(' ');
        return (
          <Path
            key={`bar-${WEEK_DAYS[index]}`}
            d={path}
            fill="url(#weekly-bar)"
          />
        );
      })}
      {series.values.map((value, index) => {
        const x = yAxisWidth + slot * index + slot / 2;
        return (
          <SvgText
            key={`day-${WEEK_DAYS[index]}`}
            x={x}
            y={topPad + plotHeight + 15 * scale}
            fontSize={10 * scale}
            fill={NutriColors.textFaint}
            textAnchor="middle">
            {WEEK_DAYS[index]}
          </SvgText>
        );
      })}
    </Svg>
  );
}
