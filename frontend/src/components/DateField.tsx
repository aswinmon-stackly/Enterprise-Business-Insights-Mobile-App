import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, MIN_TOUCH, radius } from '../theme';
import { ISODate, formatDate } from '../utils/dates';
import { CalendarModal } from './CalendarModal';

interface Props { label: string; value: ISODate; minDate?: ISODate; maxDate?: ISODate; invalid?: boolean; onChange: (d: ISODate) => void }

export function DateField({ label, value, minDate, maxDate, invalid, onChange }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Pressable onPress={() => setOpen(true)} style={[styles.box, invalid && styles.boxInvalid]} accessibilityRole="button" accessibilityLabel={`${label}: ${formatDate(value)}`}>
        <Ionicons name="calendar-outline" size={18} color={invalid ? colors.negative : colors.primary} />
        <Text style={styles.value} numberOfLines={1}>{formatDate(value)}</Text>
      </Pressable>
      <CalendarModal visible={open} value={value} minDate={minDate} maxDate={maxDate} title={label}
        onSelect={(d) => { setOpen(false); onChange(d); }} onClose={() => setOpen(false)} />
    </View>
  );
}
const styles = StyleSheet.create({
  wrap: { flex: 1, gap: 6 },
  label: { fontSize: 12, fontWeight: '700', letterSpacing: 0.8, color: colors.inkMuted, textTransform: 'uppercase' },
  box: { minHeight: MIN_TOUCH + 4, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, borderRadius: radius.sm + 2, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.chip },
  boxInvalid: { borderColor: colors.negative, backgroundColor: colors.negativeSoft },
  value: { flex: 1, fontSize: font.body + 1, fontWeight: '600', color: colors.ink },
});
