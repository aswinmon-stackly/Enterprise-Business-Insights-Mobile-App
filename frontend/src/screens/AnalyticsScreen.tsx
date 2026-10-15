
import React, { useCallback, useEffect, useState } from 'react';

import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';

import { ScreenContainer } from '../components/ScreenContainer';
import { PeriodSelector } from '../components/PeriodSelector';
import { Card } from '../components/Card';
import { TrendChart } from '../components/TrendChart';

import {
  AnalyticsResponse,
  getAnalytics,
} from '../services/analyticsService';

import { colors, font } from '../theme';

import {
  formatCurrencyCompact,
  formatNumber,
} from '../utils/format';

type Period =
  | 'Today'
  | '7D'
  | '30D'
  | 'Month'
  | 'Custom';

const PERIODS: Period[] = [
  'Today',
  '7D',
  '30D',
  'Month',
  'Custom',
];

function formatDate(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

function getDateRange(
  period: Period,
  customStartDate: Date,
  customEndDate: Date
) {
  const today = new Date();

  const start = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const end = new Date(start);

  switch (period) {
    case 'Today':
      break;

    case '7D':
      start.setDate(start.getDate() - 6);
      break;

    case '30D':
      start.setDate(start.getDate() - 29);
      break;

    case 'Month':
      start.setDate(1);
      break;

    case 'Custom':
      return {
        start_date: formatDate(customStartDate),
        end_date: formatDate(customEndDate),
      };
  }

  return {
    start_date: formatDate(start),
    end_date: formatDate(end),
  };
}

function MetricCard({
  title,
  value,
  change,
  currency = false,
}: {
  title: string;
  value: number;
  change?: number | null;
  currency?: boolean;
}) {
  const formatted = currency
    ? formatCurrencyCompact(value)
    : formatNumber(value);

  return (
    <Card>
      <Text style={styles.metricTitle}>{title}</Text>

      <Text
        style={styles.metricValue}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {formatted}
      </Text>

      {change !== undefined && (
        <Text
          style={[
            styles.change,
            change === null
              ? styles.neutral
              : change >= 0
                ? styles.positive
                : styles.negative,
          ]}
        >
          {change === null
            ? 'No previous-period comparison'
            : `${change >= 0 ? '↑' : '↓'} ${Math.abs(change).toFixed(1)}% vs previous period`}
        </Text>
      )}
    </Card>
  );
}

export function AnalyticsScreen() {
  const [period, setPeriod] = useState<Period>('7D');

  const [data, setData] =
    useState<AnalyticsResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [customStartDate, setCustomStartDate] =
    useState(new Date());

  const [customEndDate, setCustomEndDate] =
    useState(new Date());

  const [showStartPicker, setShowStartPicker] =
    useState(false);

  const [showEndPicker, setShowEndPicker] =
    useState(false);

  const loadAnalytics = useCallback(
    async (isRefresh = false) => {
      if (
        period === 'Custom' &&
        customStartDate > customEndDate
      ) {
        setError('Start date cannot be after end date.');
        return;
      }

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const filters = getDateRange(
          period,
          customStartDate,
          customEndDate
        );

        const result = await getAnalytics(filters);

        setData(result);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load analytics'
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [period, customStartDate, customEndDate]
  );

  useEffect(() => {
    const controller = new AbortController();

    let active = true;

    async function fetchData() {
      if (
        period === 'Custom' &&
        customStartDate > customEndDate
      ) {
        setError('Start date cannot be after end date.');
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const filters = getDateRange(
          period,
          customStartDate,
          customEndDate
        );

        const result = await getAnalytics(
          filters,
          controller.signal
        );

        if (active) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (active && !controller.signal.aborted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load analytics'
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void fetchData();

    return () => {
      active = false;
      controller.abort();
    };
  }, [period, customStartDate, customEndDate]);

  const chartData = (data?.revenueTrend ?? []).map(
    item => ({
      label: item.date.slice(5),
      value: item.revenue,
    })
  );

  return (
    <ScreenContainer
      refreshing={refreshing}
      onRefresh={() => loadAnalytics(true)}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <Text style={styles.heading}>
            Analytics
          </Text>

          <Text style={styles.subtitle}>
            Business performance overview
          </Text>
        </View>

        {/* DATE FILTERS */}

        <Text style={styles.sectionTitle}>
          Reporting Period
        </Text>

        <PeriodSelector
          options={PERIODS}
          value={period}
          onChange={setPeriod}
        />

        {/* CUSTOM DATE RANGE */}

        {period === 'Custom' && (
          <Card>
            <Text style={styles.customTitle}>
              Custom Date Range
            </Text>

            <Pressable
              style={styles.dateButton}
              onPress={() => setShowStartPicker(true)}
            >
              <Text style={styles.dateLabel}>
                Start Date
              </Text>

              <Text style={styles.dateValue}>
                {formatDate(customStartDate)}
              </Text>
            </Pressable>

            {showStartPicker && (
              <DateTimePicker
                value={customStartDate}
                mode="date"
                display="default"
                maximumDate={customEndDate}
                onChange={(event, date) => {
                  setShowStartPicker(false);

                  if (date) {
                    setCustomStartDate(date);
                  }
                }}
              />
            )}

            <Pressable
              style={styles.dateButton}
              onPress={() => setShowEndPicker(true)}
            >
              <Text style={styles.dateLabel}>
                End Date
              </Text>

              <Text style={styles.dateValue}>
                {formatDate(customEndDate)}
              </Text>
            </Pressable>

            {showEndPicker && (
              <DateTimePicker
                value={customEndDate}
                mode="date"
                display="default"
                minimumDate={customStartDate}
                maximumDate={new Date()}
                onChange={(event, date) => {
                  setShowEndPicker(false);

                  if (date) {
                    setCustomEndDate(date);
                  }
                }}
              />
            )}

            <Text style={styles.dateHint}>
              Analytics will update automatically after selecting dates.
            </Text>
          </Card>
        )}

        {/* LOADING */}

        {loading && !data ? (
          <View style={styles.center}>
            <ActivityIndicator
              size="large"
              color={colors.primary}
            />

            <Text style={styles.subtitle}>
              Loading analytics...
            </Text>
          </View>
        ) : error && !data ? (
          <View style={styles.center}>
            <Text style={styles.error}>
              {error}
            </Text>

            <Pressable
              onPress={() => loadAnalytics()}
              style={styles.retry}
            >
              <Text style={styles.retryText}>
                Retry
              </Text>
            </Pressable>
          </View>
        ) : data ? (
          <View style={styles.content}>
            {error && (
              <Text style={styles.error}>
                {error}
              </Text>
            )}

            {/* KPI CARDS */}

            <Text style={styles.sectionTitle}>
              Key Performance Indicators
            </Text>

            <View style={styles.grid}>
              <View style={styles.gridItem}>
                <MetricCard
                  title="Total Revenue"
                  value={data.kpis.totalRevenue}
                  change={data.comparison.revenueChangePct}
                  currency
                />
              </View>

              <View style={styles.gridItem}>
                <MetricCard
                  title="Total Orders"
                  value={data.kpis.totalOrders}
                  change={data.comparison.ordersChangePct}
                />
              </View>

              <View style={styles.gridItem}>
                <MetricCard
                  title="Total Profit"
                  value={data.kpis.totalProfit}
                  change={data.comparison.profitChangePct}
                  currency
                />
              </View>

              <View style={styles.gridItem}>
                <MetricCard
                  title="Total Customers"
                  value={data.kpis.totalCustomers}
                />
              </View>
            </View>

            {/* REVENUE TREND */}

            <Text style={styles.sectionTitle}>
              Revenue Trend
            </Text>

            <Card>
              <Text style={styles.metricTitle}>
                Daily Revenue
              </Text>

              <Text style={styles.metricValue}>
                {formatCurrencyCompact(
                  data.kpis.totalRevenue
                )}
              </Text>

              {chartData.length > 0 ? (
                <View style={styles.chart}>
                  <TrendChart
                    data={chartData}
                    height={200}
                  />
                </View>
              ) : (
                <Text style={styles.empty}>
                  No revenue data available.
                </Text>
              )}
            </Card>

            {/* ORDERS SUMMARY */}

            <Text style={styles.sectionTitle}>
              Orders Summary
            </Text>

            <Card>
              <View style={styles.summaryRow}>
                <Text style={styles.metricTitle}>
                  Total Orders
                </Text>

                <Text style={styles.metricValue}>
                  {formatNumber(
                    data.ordersSummary.totalOrders
                  )}
                </Text>
              </View>

              {data.ordersSummary.statusBreakdown.map(
                item => (
                  <View
                    key={item.status}
                    style={styles.statusRow}
                  >
                    <Text style={styles.statusName}>
                      {item.status.charAt(0).toUpperCase() +
                        item.status.slice(1)}
                    </Text>

                    <Text style={styles.statusCount}>
                      {formatNumber(item.count)}
                    </Text>
                  </View>
                )
              )}
            </Card>

            {/* TOP CATEGORY */}

            <Text style={styles.sectionTitle}>
              Top-Performing Category
            </Text>

            <Card>
              {data.topCategory ? (
                <>
                  <Text style={styles.categoryName}>
                    {data.topCategory.name}
                  </Text>

                  <Text style={styles.metricTitle}>
                    Sales Amount
                  </Text>

                  <Text style={styles.metricValue}>
                    {formatCurrencyCompact(
                      data.topCategory.revenue
                    )}
                  </Text>

                  <View style={styles.statusRow}>
                    <Text style={styles.statusName}>
                      Revenue Share
                    </Text>

                    <Text style={styles.statusCount}>
                      {data.topCategory.sharePct.toFixed(1)}%
                    </Text>
                  </View>

                  {data.topCategory.orderCount !== undefined && (
                    <View style={styles.statusRow}>
                      <Text style={styles.statusName}>
                        Qualifying Orders
                      </Text>

                      <Text style={styles.statusCount}>
                        {formatNumber(
                          data.topCategory.orderCount
                        )}
                      </Text>
                    </View>
                  )}

                  {data.topCategory.itemsSold !== undefined && (
                    <View style={styles.statusRow}>
                      <Text style={styles.statusName}>
                        Items Sold
                      </Text>

                      <Text style={styles.statusCount}>
                        {formatNumber(
                          data.topCategory.itemsSold
                        )}
                      </Text>
                    </View>
                  )}
                </>
              ) : (
                <Text style={styles.empty}>
                  No category sales available.
                </Text>
              )}
            </Card>

            {/* REPORTING PERIOD */}

            <Text style={styles.periodText}>
              Reporting period: {data.startDate} to {data.endDate}
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 24,
  },

  header: {
    gap: 4,
    marginBottom: 18,
  },

  heading: {
    fontSize: font.h1 + 4,
    fontWeight: '800',
    color: colors.ink,
  },

  subtitle: {
    fontSize: font.body,
    color: colors.inkMuted,
  },

  sectionTitle: {
    fontSize: font.title,
    fontWeight: '700',
    color: colors.ink,
    marginTop: 20,
    marginBottom: 10,
  },

  content: {
    gap: 4,
    paddingBottom: 24,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  gridItem: {
    width: '48%',
    flexGrow: 1,
  },

  metricTitle: {
    fontSize: font.caption + 1,
    color: colors.inkMuted,
    fontWeight: '600',
  },

  metricValue: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.ink,
    marginTop: 6,
  },

  change: {
    fontSize: 11,
    marginTop: 8,
    fontWeight: '600',
  },

  positive: {
    color: colors.positive,
  },

  negative: {
    color: colors.negative,
  },

  neutral: {
    color: colors.inkMuted,
  },

  center: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 12,
  },

  chart: {
    marginTop: 16,
  },

  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  statusName: {
    color: colors.inkMuted,
    fontSize: font.body,
  },

  statusCount: {
    color: colors.ink,
    fontSize: font.body,
    fontWeight: '700',
  },

  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  categoryName: {
    color: colors.primary,
    fontSize: 21,
    fontWeight: '800',
    marginBottom: 14,
  },

  empty: {
    color: colors.inkMuted,
    textAlign: 'center',
    paddingVertical: 20,
  },

  periodText: {
    color: colors.inkMuted,
    fontSize: 11,
    marginTop: 16,
  },

  error: {
    color: colors.negative,
    textAlign: 'center',
    marginVertical: 12,
  },

  retry: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },

  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  customTitle: {
    fontSize: font.title,
    fontWeight: '700',
    color: colors.ink,
  },

  dateButton: {
    padding: 14,
    marginTop: 12,
    backgroundColor: colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },

  dateLabel: {
    color: colors.inkMuted,
    fontSize: font.caption,
  },

  dateValue: {
    color: colors.ink,
    fontSize: font.body,
    fontWeight: '700',
    marginTop: 5,
  },

  dateHint: {
    color: colors.inkMuted,
    fontSize: font.caption,
    marginTop: 12,
  },
});
