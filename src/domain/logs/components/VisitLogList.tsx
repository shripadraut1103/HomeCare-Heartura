import { ActivityIndicator, FlatList, StyleSheet, View, type ListRenderItem } from 'react-native';

import { useTabBarSpace } from '@/components/AppTabs';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { ChipGroup } from '@/components/ui/ChipGroup';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pill } from '@/components/ui/Pill';
import { Radius, Shadows, Spacing } from '@/constants/Theme';
import { LogGroupRow } from '@/domain/logs/components/LogGroupRow';
import { useVisitLog } from '@/domain/logs/hooks/useLogs';
import type { VisitLogEntry, VisitLogRange } from '@/domain/logs/interfaces/LogInterfaces';
import { visitPills, type LogPillStyle } from '@/domain/logs/logStyles';
import { useTheme } from '@/hooks/useTheme';
import { formatClockTime, formatMonthDay, parseIsoDate, parseTimeOfDay } from '@/utils/dateFormat';

const RANGES: Record<string, VisitLogRange> = {
  '14 days': 14,
  '30 days': 30,
  '90 days': 90,
};
const RANGE_LABELS = Object.keys(RANGES);

const keyExtractor = (entry: VisitLogEntry) => entry.id;

const formatNumber = (value: number) => String(Math.round(value * 10) / 10);

const describeVisit = (entry: VisitLogEntry) => {
  const day = parseIsoDate(entry.date);
  const start = formatClockTime(parseTimeOfDay(entry.start, day));
  const end = formatClockTime(parseTimeOfDay(entry.end, day));
  return [
    formatMonthDay(day),
    `${start} – ${end}`,
    `${entry.durationMinutes} min`,
    `${entry.units} ${entry.units === 1 ? 'unit' : 'units'}`,
    ...(entry.miles === null ? [] : [`${formatNumber(entry.miles)} mi`]),
  ].join(' · ');
};

export function VisitLogList() {
  const tabBarSpace = useTabBarSpace();
  const visitLog = useVisitLog();
  const { summary } = visitLog;
  const selected = RANGE_LABELS.filter((label) => RANGES[label] === visitLog.range);

  const renderEntry: ListRenderItem<VisitLogEntry> = ({ item, index }) => {
    const title = [item.patientName, item.visitType].filter(Boolean).join(' · ');
    const details = describeVisit(item);
    const pills = visitPills(item);
    return (
      <View
        accessible
        accessibilityLabel={[title, details, ...pills.map((pill) => pill.label)].join(', ')}>
        <LogGroupRow isFirst={index === 0} isLast={index === visitLog.entries.length - 1}>
          <View style={styles.body}>
            <ThemedText numberOfLines={1} style={styles.title}>
              {title}
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.summary}>
              {details}
            </ThemedText>
          </View>
          <View style={styles.pills}>
            {pills.map((pill) => (
              <LogPill key={pill.label} pill={pill} />
            ))}
          </View>
        </LogGroupRow>
      </View>
    );
  };

  return (
    <FlatList
      data={visitLog.entries}
      keyExtractor={keyExtractor}
      renderItem={renderEntry}
      ListHeaderComponent={
        <View style={styles.header}>
          <ChipGroup
            options={RANGE_LABELS}
            selected={selected}
            onToggle={(label) => visitLog.setRange(RANGES[label])}
            single
          />
          {summary ? (
            <View style={styles.stats}>
              <StatTile value={formatNumber(summary.hours)} label="Hours" />
              <StatTile value={String(summary.units)} label="Units" />
              <StatTile value={String(summary.visits)} label="Visits" />
            </View>
          ) : null}
        </View>
      }
      ListEmptyComponent={
        visitLog.error ? (
          <View style={styles.state}>
            <EmptyState message={visitLog.error} />
            <Button title="Try again" variant="secondary" size="small" onPress={visitLog.refresh} />
          </View>
        ) : visitLog.loading ? (
          <ActivityIndicator style={styles.state} />
        ) : (
          <EmptyState message="No visits in this period." />
        )
      }
      refreshing={false}
      onRefresh={visitLog.refresh}
      contentContainerStyle={[styles.content, { paddingBottom: tabBarSpace }]}
      showsVerticalScrollIndicator={false}
    />
  );
}

function LogPill({ pill }: { pill: LogPillStyle }) {
  return <Pill label={pill.label} color={pill.color} backgroundColor={pill.background} dot />;
}

function StatTile({ value, label }: { value: string; label: string }) {
  const theme = useTheme();

  return (
    <View
      accessible
      accessibilityLabel={`${value} ${label}`}
      style={[styles.tile, { backgroundColor: theme.background }]}>
      <ThemedText style={styles.tileValue}>{value}</ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.tileLabel}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
  },
  header: {
    gap: Spacing.three,
    paddingBottom: Spacing.three,
  },
  stats: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  state: {
    gap: Spacing.three,
    alignItems: 'center',
    paddingTop: Spacing.four,
  },
  tile: {
    flex: 1,
    minHeight: 88,
    padding: Spacing.three - Spacing.one,
    borderRadius: Radius.medium,
    ...Shadows.card,
  },
  tileValue: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: 700,
  },
  tileLabel: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: 500,
  },
  body: {
    flex: 1,
    gap: Spacing.half,
  },
  title: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: 600,
  },
  summary: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: 400,
  },
  pills: {
    alignItems: 'flex-end',
    gap: Spacing.one + Spacing.half,
  },
});
