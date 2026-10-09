import React, { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop } from 'react-native-svg';
import { TrendPoint } from '../types';
import { colors, font } from '../theme';

interface Props { data: TrendPoint[]; height?: number }
const PAD = { top: 12, bottom: 4, x: 8 };

/** Width comes from onLayout, so the chart fits any screen with no horizontal overflow. */
export function TrendChart({ data, height = 150 }: Props) {
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
    body = (
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.primary} stopOpacity="0.22" />
            <Stop offset="1" stopColor={colors.primary} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        {[0.25, 0.5, 0.75].map((f) => <Line key={f} x1={0} x2={width} y1={PAD.top + h * f} y2={PAD.top + h * f} stroke={colors.border} strokeDasharray="4 4" />)}
        <Path d={area} fill="url(#fill)" />
        <Path d={line} stroke={colors.primary} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx={last.x} cy={last.y} r={5} fill={colors.surface} stroke={colors.primary} strokeWidth={2.5} />
      </Svg>
    );
  }
  return (
    <View onLayout={onLayout} accessible accessibilityLabel="Revenue trend chart for the last 7 days">
      <View style={{ height, justifyContent: 'center' }}>{data.length < 2 ? <Text style={styles.label}>Not enough data yet</Text> : body}</View>
      <View style={styles.labels}>{data.map((d) => <Text key={d.label} style={styles.label}>{d.label}</Text>)}</View>
    </View>
  );
}
const styles = StyleSheet.create({
  labels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, paddingHorizontal: PAD.x - 4 },
  label: { fontSize: font.caption, color: colors.inkMuted },
});
