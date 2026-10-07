import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DashboardData } from '../types';
import { colors, font, radius, spacing } from '../theme';
import { formatCurrencyCompact, formatNumber, formatPct } from '../utils/format';
import { Card } from './Card';
import { ChangeBadge } from './ChangeBadge';
import { StatItem } from './StatItem';
import { TrendChart } from './TrendChart';

type Props = Pick<DashboardData, 'revenueTrend' | 'salesSummary' | 'topCategory'>;

export function AnalyticsPreview({ revenueTrend, salesSummary: s, topCategory: c }: Props) {
  return (
    <View style={styles.wrap}>

      {/* Revenue trend chart card */}
      <Card accent={colors.primaryLight}>
        <View style={styles.cardTitleRow}>
          <View>
            <Text style={styles.cardTitle}>Revenue Trend</Text>
            <Text style={styles.cardSub}>Last 7 days · ₹ Lakh</Text>
          </View>
          <View style={styles.trendBadge}>
            <Ionicons name="arrow-up" size={11} color={colors.positive} />
            <Text style={styles.trendBadgeText}>+12.4%</Text>
          </View>
        </View>
        <View style={{ marginTop: spacing.md }}>
          <TrendChart data={revenueTrend} />
        </View>
      </Card>

      {/* Sales summary card */}
      <Card accent={colors.teal}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardTitle}>Sales Summary</Text>
          <View style={[styles.trendBadge, { backgroundColor: colors.tealSoft }]}>
            <Ionicons name="stats-chart" size={11} color={colors.teal} />
            <Text style={[styles.trendBadgeText, { color: colors.teal }]}>MTD</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <StatItem label="Total Orders" value={formatNumber(s.totalOrders)} />
          <StatItem label="Avg. Order Value" value={formatCurrencyCompact(s.avgOrderValue)} />
          <StatItem label="Fulfilment Rate" value={formatPct(s.fulfilmentRatePct)} />
          <StatItem label="Target Achieved" value={`${s.targetAchievedPct}%`} />
        </View>

        {/* Progress bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressLabel}>Monthly Target</Text>
            <Text style={styles.progressValue}>{s.targetAchievedPct}%</Text>
          </View>
          <View style={styles.track}>
            <View
              style={[
                styles.fill,
                {
                  width: `${Math.min(s.targetAchievedPct, 100)}%`,
                  backgroundColor:
                    s.targetAchievedPct >= 90
                      ? colors.positive
                      : s.targetAchievedPct >= 70
                      ? colors.teal
                      : colors.amber,
                },
              ]}
            />
          </View>
        </View>
      </Card>

      {/* Top category card */}
      <Card accent={colors.warning}>
        <Text style={styles.cardSub}>🏆 Top Performing Category</Text>
        <Text style={styles.catName}>{c.name}</Text>

        <View style={styles.catRow}>
          <Text style={styles.catRevenue}>{formatCurrencyCompact(c.revenue)}</Text>
          <ChangeBadge changePct={c.changePct} />
        </View>

        {/* Share indicator */}
        <View style={styles.shareRow}>
          <View style={styles.shareBarBg}>
            <View style={[styles.shareBarFill, { width: `${Math.min(c.sharePct, 100)}%` }]} />
          </View>
          <Text style={styles.shareLabel}>{formatPct(c.sharePct)} of revenue</Text>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },

  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: font.title,
    fontWeight: '700',
    color: colors.ink,
  },
  cardSub: {
    fontSize: font.captionMd,
    color: colors.inkMuted,
    marginTop: 2,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.positiveSoft,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  trendBadgeText: {
    fontSize: font.caption,
    fontWeight: '700',
    color: colors.positive,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    marginTop: spacing.md,
  },

  progressSection: { marginTop: spacing.lg, gap: 6 },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: { fontSize: font.captionMd, color: colors.inkMuted, fontWeight: '500' },
  progressValue: { fontSize: font.captionMd, color: colors.ink, fontWeight: '700' },
  track: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.bgDeep,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
  },

  catName: {
    fontSize: font.h1,
    fontWeight: '800',
    color: colors.ink,
    marginTop: 4,
    lineHeight: font.h1 * 1.3,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: spacing.sm,
  },
  catRevenue: {
    fontSize: font.h2,
    fontWeight: '700',
    color: colors.ink,
  },
  shareRow: { gap: 5, marginTop: 4 },
  shareBarBg: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.amberSoft,
    overflow: 'hidden',
  },
  shareBarFill: {
    height: '100%',
    backgroundColor: colors.warning,
    borderRadius: radius.pill,
  },
  shareLabel: {
    fontSize: font.caption,
    color: colors.inkMuted,
    fontWeight: '500',
  },
});
