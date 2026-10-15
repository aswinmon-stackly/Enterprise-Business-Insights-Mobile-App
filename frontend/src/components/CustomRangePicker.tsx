import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, font, MIN_TOUCH, radius } from '../theme';
import { ISODate, MIN_CUSTOM_DATE } from '../utils/dates';
import { Card } from './Card';
import { DateField } from './DateField';

interface Props {
  start: ISODate;
  end: ISODate;
  maxDate: ISODate;
  error: string | null; // validation message; the Apply button is disabled while it is set
  onChangeStart: (d: ISODate) => void;
  onChangeEnd: (d: ISODate) => void;
  onApply: () => void;
}

export function CustomRangePicker({ start, end, maxDate, error, onChangeStart, onChangeEnd, onApply }: Props) {
  return (
    <Card accent={colors.primary} style={styles.card}>
      <View style={styles.row}>
        <DateField label="Start date" value={start} minDate={MIN_CUSTOM_DATE} maxDate={maxDate} invalid={!!error} onChange={onChangeStart} />
        <DateField label="End date" value={end} minDate={MIN_CUSTOM_DATE} maxDate={maxDate} invalid={!!error} onChange={onChangeEnd} />
      </View>
      {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
      <Pressable onPress={onApply} disabled={!!error} style={[styles.apply, !!error && styles.applyDisabled]} accessibilityRole="button" accessibilityState={{ disabled: !!error }}>
        <Text style={styles.applyText}>Apply range</Text>
      </Pressable>
    </Card>
  );
}
const styles = StyleSheet.create({
  card: { gap: 12 },
  row: { flexDirection: 'row', gap: 12 },
  error: { fontSize: font.body, fontWeight: '600', color: colors.negative },
  apply: { minHeight: MIN_TOUCH, borderRadius: radius.md - 4, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  applyDisabled: { backgroundColor: '#B8C4DE' },
  applyText: { color: '#FFFFFF', fontSize: font.title, fontWeight: '700' },
});
