import React from 'react';
import { Activity } from '../types';
import { Card } from './Card';
import { ActivityItem } from './ActivityItem';

/** Plain map (not FlatList): this list lives inside the dashboard ScrollView; nesting virtualized lists warns. */
export function ActivityList({ items, onItemPress }: { items: Activity[]; onItemPress?: (a: Activity) => void }) {
  return (
    <Card style={{ paddingVertical: 4 }}>
      {items.map((a, i) => <ActivityItem key={a.id} activity={a} onPress={onItemPress} isLast={i === items.length - 1} />)}
    </Card>
  );
}
