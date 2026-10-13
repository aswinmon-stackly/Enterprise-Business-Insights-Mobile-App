import React, { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Rect, Stop, Text as SvgText } from 'react-native-svg';
import { TrendPoint } from '../types';
import { colors, font } from '../theme';

interface Props {
  data: TrendPoint[];
  height?: number;
  /** When provided, a tooltip with the latest value is drawn above the last point. */
  formatValue?: (n: number) => string;
}

const PAD = { top: 46, bottom: 6, x: 14 };

/** Width comes from onLayout, so the chart fits any screen with no horizontal overflow. */
export function TrendChart({ data, height = 190, formatValue }: Props) {
  const [width, setWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  let body: React.ReactNode = null;
  if (width > 0 && data.length > 1) {
    const vals = data.map((d) => d.value);
    const min = Math.min(...vals), max = Math.max(...vals);
    const span = max - min || 1;
    const w = width - PAD.x * 2, h = height - PAD.top - PAD.bottom;
    const pts = data.map((d, i) => ({ x: PAD.x + (i / (data.length - 1)) * w, y: PAD.top + h - ((d.value - min) / span) * h }));
    const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    const first = pts[0]!, last = pts[pts.length - 1]!;
    const area = `${line} L${last.x} ${height} L${first.x} ${height} Z`;

    const tip = formatValue ? formatValue(data[data.length - 1]!.value) : null;
    const tipW = tip ? tip.length * 7.6 + 20 : 0;
    const tipX = Math.min(Math.max(last.x - tipW / 2, 0), width - tipW); // clamped: never clipped at the edge
    const tipY = Math.max(last.y - 42, 2);

    body = (
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.primary} stopOpacity="0.22" />
            <Stop offset="1" stopColor={colors.primary} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        {[0.2, 0.5, 0.8].map((f) => (
          <Line key={f} x1={0} x2={width} y1={PAD.top + h * f} y2={PAD.top + h * f} stroke={colors.border} strokeDasharray="5 5" />
        ))}
        <Path d={area} fill="url(#fill)" />
        <Path d={line} stroke={colors.primary} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {pts.slice(0, -1).map((p, i) => <Circle key={i} cx={p.x} cy={p.y} r={4} fill={colors.surface} stroke="#B9C8EC" strokeWidth={2} />)}
        <Circle cx={last.x} cy={last.y} r={7} fill={colors.surface} stroke={colors.primary} strokeWidth={3.5} />
        {tip ? (
          <>
            <Rect x={tipX} y={tipY} width={tipW} height={28} rx={9} fill={colors.primaryDark} />
            <SvgText x={tipX + tipW / 2} y={tipY + 19} fontSize={13} fontWeight="700" fill="#FFFFFF" textAnchor="middle">{tip}</SvgText>
          </>
        ) : null}
      </Svg>
    );
  }
  return (
    <View onLayout={onLayout} accessible accessibilityLabel="Revenue trend chart for the last 7 days">
      <View style={{ height, justifyContent: 'center' }}>
        {data.length < 2 ? <Text style={styles.label}>Not enough data yet</Text> : body}
      </View>
      <View style={styles.labels}>{data.map((d) => <Text key={d.label} style={styles.label}>{d.label}</Text>)}</View>
    </View>
  );
}
const styles = StyleSheet.create({
  labels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingHorizontal: PAD.x - 6 },
  label: { fontSize: font.caption + 1, color: colors.inkMuted, fontWeight: '500' },
});
