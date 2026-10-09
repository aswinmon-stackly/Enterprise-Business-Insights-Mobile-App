import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, font, MIN_TOUCH } from '../theme';

interface Props<T extends string> { options: readonly T[]; value: T; onChange: (v: T) => void }

/** Generic segmented control; works for any string-literal union. */
export function PeriodSelector<T extends string>({ options, value, onChange }: Props<T>) {
  return (
    <View style={styles.track} accessibilityRole="tablist">
      {options.map((o) => {
        const active = o === value;
        return (
          <Pressable key={o} onPress={() => onChange(o)} style={[styles.seg, active && styles.segActive]}
            accessibilityRole="tab" accessibilityState={{ selected: active }}>
            <Text style={[styles.text, active && styles.textActive]}>{o}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
const styles = StyleSheet.create({
  track: { flexDirection: 'row', backgroundColor: '#E3E9F1', borderRadius: 12, padding: 3 },
  seg: { flex: 1, minHeight: MIN_TOUCH - 6, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  segActive: { backgroundColor: colors.surface },
  text: { fontSize: font.body, fontWeight: '600', color: colors.inkMuted },
  textActive: { color: colors.primary },
});
