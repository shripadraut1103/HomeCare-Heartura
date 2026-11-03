import { FlatList, StyleSheet, View, type ListRenderItem } from 'react-native';

import { useTabBarSpace } from '@/components/AppTabs';
import { ThemedText } from '@/components/ThemedText';
import { Pill } from '@/components/ui/Pill';
import { Radius, Shadows, Spacing } from '@/constants/Theme';
import { LogGroupRow } from '@/domain/logs/components/LogGroupRow';
import type { VisitLogEntry } from '@/domain/logs/interfaces/LogInterfaces';
import { NOT_SIGNED_PILL, VERIFICATION_PILL, type LogPillStyle } from '@/domain/logs/logStyles';
import { useTheme } from '@/hooks/useTheme';
import { formatClockTime, formatMonthDay } from '@/utils/dateFormat';

const keyExtractor = (entry: VisitLogEntry) => entry.id;

const describeVisit = (entry: VisitLogEntry) => {
  const start = new Date(entry.startsAt);
  const end = new Date(start.getTime() + entry.durationMinutes * 60_000);
  return `${formatMonthDay(start)} · ${formatClockTime(start)} – ${formatClockTime(end)} · ${
    entry.durationMinutes
  } min · ${entry.units} units`;
};

export function VisitLogList({ entries }: { entries: VisitLogEntry[] }) {
  const tabBarSpace = useTabBarSpace();
  const minutes = entries.reduce((total, entry) => total + entry.durationMinutes, 0);
  const units = entries.reduce((total, entry) => total + entry.units, 0);

  const renderEntry: ListRenderItem<VisitLogEntry> = ({ item, index }) => {
    const title = `${item.patientName} · ${item.visitType}`;
    const summary = describeVisit(item);
    const pills = [VERIFICATION_PILL[item.verification], ...(item.signed ? [] : [NOT_SIGNED_PILL])];
    return (
      <View
        accessible
        accessibilityLabel={[title, summary, ...pills.map((pill) => pill.label)].join(', ')}>
        <LogGroupRow isFirst={index === 0} isLast={index === entries.length - 1}>
          <View style={styles.body}>
            <ThemedText numberOfLines={1} style={styles.title}>
              {title}
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.summary}>
              {summary}
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
      data={entries}
      keyExtractor={keyExtractor}
      renderItem={renderEntry}
      ListHeaderComponent={
        <View style={styles.stats}>
          {/* One decimal at most: 12.5, not 12.50 or 12.4999. */}
          <StatTile value={String(Math.round((minutes / 60) * 10) / 10)} label="Hours" />
          <StatTile value={String(units)} label="Units" />
          <StatTile value={String(entries.length)} label="Visits" />
        </View>
      }
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
  stats: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingBottom: Spacing.three,
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
