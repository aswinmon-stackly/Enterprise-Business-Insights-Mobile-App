import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, MIN_TOUCH, radius, shadow } from '../theme';
import { ISODate, MONTH_NAMES, WEEKDAYS, monthGrid, parseISO, todayISO } from '../utils/dates';

interface Props {
  visible: boolean;
  value: ISODate;
  minDate?: ISODate;
  maxDate?: ISODate;
  title?: string;
  onSelect: (date: ISODate) => void;
  onClose: () => void;
}

/** Dependency-free month calendar (works in Expo Go and the browser). */
export function CalendarModal({ visible, value, minDate, maxDate, title = 'Select date', onSelect, onClose }: Props) {
  const initial = parseISO(value) ?? parseISO(todayISO())!;
  const [view, setView] = useState({ y: initial.y, m: initial.m });

  useEffect(() => {
    if (!visible) return;
    const p = parseISO(value);
    if (p) setView({ y: p.y, m: p.m });
  }, [visible, value]);

  const minP = minDate ? parseISO(minDate) : null;
  const maxP = maxDate ? parseISO(maxDate) : null;
  const canPrev = !minP || view.y * 12 + view.m > minP.y * 12 + minP.m;
  const canNext = !maxP || view.y * 12 + view.m < maxP.y * 12 + maxP.m;
  const shift = (delta: number) => setView((v) => {
    const t = v.y * 12 + (v.m - 1) + delta;
    return { y: Math.floor(t / 12), m: (t % 12) + 1 };
  });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close calendar">
        <View style={styles.sheet} onStartShouldSetResponder={() => true}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.monthRow}>
            <Pressable onPress={() => shift(-1)} disabled={!canPrev} style={[styles.nav, !canPrev && styles.dim]} accessibilityLabel="Previous month">
              <Ionicons name="chevron-back" size={22} color={colors.ink} />
            </Pressable>
            <Text style={styles.month}>{MONTH_NAMES[view.m - 1]} {view.y}</Text>
            <Pressable onPress={() => shift(1)} disabled={!canNext} style={[styles.nav, !canNext && styles.dim]} accessibilityLabel="Next month">
              <Ionicons name="chevron-forward" size={22} color={colors.ink} />
            </Pressable>
          </View>
          <View style={styles.weekRow}>{WEEKDAYS.map((d, i) => <Text key={i} style={styles.weekday}>{d}</Text>)}</View>
          {monthGrid(view.y, view.m).map((week, wi) => (
            <View key={wi} style={styles.weekRow}>
              {week.map((iso, di) => {
                if (!iso) return <View key={di} style={styles.cell} />;
                const disabled = (!!minDate && iso < minDate) || (!!maxDate && iso > maxDate);
                const selected = iso === value;
                return (
                  <Pressable key={di} style={styles.cell} disabled={disabled} onPress={() => onSelect(iso)}
                    accessibilityRole="button" accessibilityState={{ selected, disabled }}>
                    <View style={[styles.day, selected && styles.daySelected]}>
                      <Text style={[styles.dayText, selected && styles.dayTextSelected, disabled && styles.dayTextDisabled]}>{Number(iso.slice(8))}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ))}
          <Pressable onPress={onClose} style={styles.cancel} accessibilityRole="button"><Text style={styles.cancelText}>Cancel</Text></Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}
const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(15,27,51,0.45)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  sheet: { width: '100%', maxWidth: 360, backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, ...shadow },
  title: { fontSize: font.title, fontWeight: '700', color: colors.ink, textAlign: 'center', marginBottom: 4 },
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  nav: { width: MIN_TOUCH, height: MIN_TOUCH, alignItems: 'center', justifyContent: 'center' },
  dim: { opacity: 0.3 },
  month: { fontSize: font.title, fontWeight: '700', color: colors.ink },
  weekRow: { flexDirection: 'row' },
  weekday: { width: `${100 / 7}%`, textAlign: 'center', fontSize: 12, fontWeight: '600', color: colors.inkMuted, paddingVertical: 6 },
  cell: { width: `${100 / 7}%`, height: 44, alignItems: 'center', justifyContent: 'center' },
  day: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  daySelected: { backgroundColor: colors.primary },
  dayText: { fontSize: 15, color: colors.ink },
  dayTextSelected: { color: '#FFFFFF', fontWeight: '700' },
  dayTextDisabled: { color: '#BCC4D3' },
  cancel: { minHeight: MIN_TOUCH, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  cancelText: { fontSize: font.title, fontWeight: '600', color: colors.primary },
});
