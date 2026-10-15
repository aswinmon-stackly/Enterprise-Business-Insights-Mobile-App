import React, { useEffect, useState } from 'react';
import { GestureResponderEvent, LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Rect, Stop, Text as SvgText } from 'react-native-svg';
import { TrendPoint } from '../types';
import { colors, font } from '../theme';
import { labelWidthFor, nearestIndex, pickLabelIndices } from '../utils/chart';

interface Props {
  data: TrendPoint[];
  height?: number;
  /** Money formatter. Enables the tooltip (and the y-axis labels when showYAxis is set). */
  formatValue?: (n: number) => string;
  showYAxis?: boolean;
  /** Start the scale at 0 so a quiet day does not look like a collapse. */
  zeroBaseline?: boolean;
  tooltipWithLabel?: boolean;
  /** Shown over the chart when every value is 0. */
  emptyMessage?: string;
  accessibilityLabel?: string;
}

const PAD = { top: 46, bottom: 6, x: 14 };
const MAX_DOTS = 31;
const GRID = [0.2, 0.5, 0.8];

/**
 * Width comes from onLayout, so the chart fits any screen. X labels are thinned to what fits and positioned inside the
 * chart width (never overflow). Tapping the chart selects the nearest point; a single point is drawn as a bar.
 */
export function TrendChart({ data, height = 190, formatValue, showYAxis = false, zeroBaseline = false, tooltipWithLabel = false,
  emptyMessage, accessibilityLabel = 'Trend chart' }: Props) {
  const [width, setWidth] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  useEffect(() => setSelected(null), [data]);

  const n = data.length;
  const values = data.map((d) => d.value);
  const max = n ? Math.max(...values) : 0;
  const min = zeroBaseline || !n ? 0 : Math.min(...values);
  const span = max - min || 1;
  const allZero = n > 0 && max === 0;
  const plotW = Math.max(width - PAD.x * 2, 0);
  const plotH = height - PAD.top - PAD.bottom;
  const xAt = (i: number) => (n === 1 ? width / 2 : PAD.x + (i / (n - 1)) * plotW);
  const pts = width > 0 && n > 0 ? data.map((d, i) => ({ x: xAt(i), y: PAD.top + plotH - ((d.value - min) / span) * plotH })) : [];

  const active = selected !== null && selected < n ? selected : n - 1;
  const labelW = labelWidthFor(data.map((d) => d.label));
  const labelIdx = width > 0 ? pickLabelIndices(n, plotW, labelW) : [];

  let svg: React.ReactNode = null;
  if (pts.length > 0) {
    const last = pts[n - 1]!, first = pts[0]!, point = pts[active]!;
    const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    const area = `${line} L${last.x} ${height} L${first.x} ${height} Z`;
    const tipText = formatValue ? `${tooltipWithLabel ? `${data[active]!.label} · ` : ''}${formatValue(data[active]!.value)}` : null;
    const tipW = tipText ? tipText.length * 7.4 + 22 : 0;
    const tipX = Math.min(Math.max(point.x - tipW / 2, 0), Math.max(width - tipW, 0)); // clamped: never clipped at an edge
    const tipY = Math.max(point.y - 42, 2);
    svg = (
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.primary} stopOpacity="0.22" />
            <Stop offset="1" stopColor={colors.primary} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        {GRID.map((f) => <Line key={f} x1={0} x2={width} y1={PAD.top + plotH * f} y2={PAD.top + plotH * f} stroke={colors.border} strokeDasharray="5 5" />)}
        {showYAxis && formatValue && !allZero
          ? GRID.map((f) => <SvgText key={`y${f}`} x={PAD.x} y={PAD.top + plotH * f - 4} fontSize={10} fill={colors.inkMuted}>{formatValue(max - f * (max - min))}</SvgText>)
          : null}
        {n === 1 ? (
          <Rect x={point.x - 18} y={point.y} width={36} height={Math.max(height - PAD.bottom - point.y, 2)} rx={8} fill={colors.primary} opacity={0.85} />
        ) : (
          <>
            <Path d={area} fill="url(#fill)" />
            <Path d={line} stroke={colors.primary} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            {n <= MAX_DOTS ? pts.map((p, i) => i !== active && <Circle key={i} cx={p.x} cy={p.y} r={3.5} fill={colors.surface} stroke="#B9C8EC" strokeWidth={2} />) : null}
            <Circle cx={point.x} cy={point.y} r={7} fill={colors.surface} stroke={colors.primary} strokeWidth={3.5} />
          </>
        )}
        {tipText ? (
          <>
            <Rect x={tipX} y={tipY} width={tipW} height={28} rx={9} fill={colors.primaryDark} />
            <SvgText x={tipX + tipW / 2} y={tipY + 19} fontSize={12} fontWeight="700" fill="#FFFFFF" textAnchor="middle">{tipText}</SvgText>
          </>
        ) : null}
      </Svg>
    );
  }

  const onPress = (e: GestureResponderEvent) => setSelected(nearestIndex(pts.map((p) => p.x), e.nativeEvent.locationX));

  return (
    <View onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)} accessible accessibilityLabel={accessibilityLabel}>
      <View style={{ height, justifyContent: 'center' }}>
        {n === 0 ? <Text style={styles.muted}>Not enough data yet</Text> : svg && <Pressable onPress={onPress} style={{ height }}>{svg}</Pressable>}
        {allZero && emptyMessage ? <View style={styles.overlay}><Text style={styles.empty}>{emptyMessage}</Text></View> : null}
      </View>
      <View style={styles.labels}>
        {labelIdx.map((i) => (
          <Text key={i} numberOfLines={1} style={[styles.label, i === active && styles.labelActive,
            { width: labelW, left: Math.min(Math.max(xAt(i) - labelW / 2, 0), Math.max(width - labelW, 0)) }]}>
            {data[i]!.label}
          </Text>
        ))}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  labels: { height: 20, marginTop: 8 },
  label: { position: 'absolute', top: 0, textAlign: 'center', fontSize: font.caption, color: colors.inkMuted, fontWeight: '500' },
  labelActive: { color: colors.primaryDark, fontWeight: '800' },
  muted: { fontSize: font.caption + 1, color: colors.inkMuted, textAlign: 'center' },
  overlay: { pointerEvents: 'none', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', paddingTop: 30 },
  empty: { fontSize: font.title, fontWeight: '600', color: colors.inkMuted },
});
