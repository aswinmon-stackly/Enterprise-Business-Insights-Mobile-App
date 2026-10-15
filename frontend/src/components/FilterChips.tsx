import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, MIN_TOUCH } from '../theme';
import { FILTER_OPTIONS, FilterChipKey } from '../utils/analyticsFilter';

interface Props { value: FilterChipKey; onSelect: (key: FilterChipKey) => void }

/** Wraps onto a second row on narrow screens, so no option is ever hidden off-screen. */
export function FilterChips({ value, onSelect }: Props) {
  return (
    <View style={styles.wrap} accessibilityRole="tablist">
      {FILTER_OPTIONS.map((o) => {
        const active = o.key === value;
        return (
          <Pressable key={o.key} onPress={() => onSelect(o.key)} style={[styles.chip, active && styles.active]}
            accessibilityRole="tab" accessibilityState={{ selected: active }} accessibilityLabel={o.label}>
            <Text style={[styles.text, active && styles.activeText]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { minHeight: MIN_TOUCH, paddingHorizontal: 16, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  active: { backgroundColor: colors.primary, borderColor: colors.primary },
  text: { fontSize: 14, fontWeight: '600', color: colors.ink },
  activeText: { color: '#FFFFFF' },
});
