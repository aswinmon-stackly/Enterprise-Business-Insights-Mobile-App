import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { Activity } from '../types';
import { colors, font } from '../theme';
import { Card } from './Card';
import { ActivityItem } from './ActivityItem';

/** Plain map (not FlatList): lives inside a ScrollView; nesting virtualized lists warns. */
export function ActivityList({ items, onItemPress }: { items: Activity[]; onItemPress?: (a: Activity) => void }) {
  if (items.length === 0) {
    return <Card><Text style={styles.empty}>No recent activity yet.</Text></Card>;
  }
  return (
    <Card style={{ paddingVertical: 4 }}>
      {items.map((a, i) => <ActivityItem key={a.id} activity={a} onPress={onItemPress} isLast={i === items.length - 1} />)}
    </Card>
  );
}
const styles = StyleSheet.create({ empty: { textAlign: 'center', color: colors.inkMuted, fontSize: font.body, paddingVertical: 12 } });
