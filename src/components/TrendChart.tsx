import React, { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Path,
  Rect,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import { TrendPoint } from '../types';
import { colors, font, radius, spacing } from '../theme';

interface Props {
  data: TrendPoint[];
  height?: number;
  /** Y-axis label suffix (e.g. "L" for lakhs) */
  unit?: string;
}

const PAD = { top: 16, bottom: 4, x: 6 };

/** Width comes from onLayout so the chart fits any screen without horizontal overflow. */
export function TrendChart({ data, height = 160, unit = 'L' }: Props) {
  const [width, setWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) =>
    setWidth(e.nativeEvent.layout.width);

  let chartBody: React.ReactNode = null;

  if (width > 0 && data.length > 1) {
    const vals = data.map((d) => d.value);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const span = max - min || 1;

    const drawW = width - PAD.x * 2;
    const drawH = height - PAD.top - PAD.bottom;

    const pts = data.map((d, i) => ({
      x: PAD.x + (i / (data.length - 1)) * drawW,
      y: PAD.top + drawH - ((d.value - min) / span) * drawH,
      value: d.value,
      label: d.label,
    }));

    const linePath = pts
      .map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(' ');

    const first = pts[0]!;
    const last = pts[pts.length - 1]!;
    const areaPath = `${linePath} L${last.x} ${height} L${first.x} ${height} Z`;

    // Grid lines at 25 / 50 / 75 %
    const gridFractions = [0.25, 0.5, 0.75];

    chartBody = (
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.chartFill} stopOpacity="0.28" />
            <Stop offset="1" stopColor={colors.chartFill} stopOpacity="0.01" />
          </LinearGradient>
          {/* Hover/last-point glow */}
          <LinearGradient id="dotGlow" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colors.primaryLight} stopOpacity="1" />
            <Stop offset="1" stopColor={colors.primary} stopOpacity="1" />
          </LinearGradient>
        </Defs>

        {/* Grid lines */}
        {gridFractions.map((f) => (
          <Line
            key={f}
            x1={0}
            x2={width}
            y1={PAD.top + drawH * (1 - f)}
            y2={PAD.top + drawH * (1 - f)}
            stroke={colors.border}
            strokeDasharray="3 5"
            strokeWidth={0.8}
          />
        ))}

        {/* Area fill */}
        <Path d={areaPath} fill="url(#areaFill)" />

        {/* Line stroke */}
        <Path
          d={linePath}
          stroke={colors.chartLine}
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data dots — small secondary */}
        {pts.slice(0, -1).map((p, i) => (
          <Circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={3}
            fill={colors.surface}
            stroke={colors.borderStrong}
            strokeWidth={1.5}
          />
        ))}

        {/* Last / latest point highlight */}
        <Circle
          cx={last.x}
          cy={last.y}
          r={7}
          fill="url(#dotGlow)"
          opacity={0.18}
        />
        <Circle
          cx={last.x}
          cy={last.y}
          r={4.5}
          fill={colors.surface}
          stroke={colors.chartLine}
          strokeWidth={2.5}
        />

        {/* Last-point value label */}
        <Rect
          x={last.x - 22}
          y={last.y - 22}
          width={44}
          height={17}
          rx={5}
          fill={colors.primary}
        />
        <SvgText
          x={last.x}
          y={last.y - 10}
          textAnchor="middle"
          fill="#fff"
          fontSize={9}
          fontWeight="700"
        >
          {last.value.toFixed(2)} {unit}
        </SvgText>
      </Svg>
    );
  }

  return (
    <View
      onLayout={onLayout}
      accessible
      accessibilityLabel="Revenue trend chart for the last 7 days"
    >
      <View style={{ height }}>{chartBody}</View>

      {/* X-axis labels */}
      <View style={styles.xLabels}>
        {data.map((d) => (
          <Text key={d.label} style={styles.xLabel}>
            {d.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  xLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingHorizontal: PAD.x - 2,
  },
  xLabel: {
    fontSize: font.caption,
    color: colors.inkFaint,
    fontWeight: '500',
  },
});
