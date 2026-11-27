import {
  ActivityIndicator,
  SectionList,
  StyleSheet,
  View,
  type SectionListRenderItem,
} from 'react-native';

import { useTabBarSpace } from '@/components/AppTabs';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { ChipGroup } from '@/components/ui/ChipGroup';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconCircle } from '@/components/ui/IconCircle';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Spacing } from '@/constants/Theme';
import { LogGroupRow } from '@/domain/logs/components/LogGroupRow';
import { useActivityLog } from '@/domain/logs/hooks/useLogs';
import type { ActivityEntry, ActivityFilter } from '@/domain/logs/interfaces/LogInterfaces';
import { activityIcon } from '@/domain/logs/logStyles';
import { formatClockTime, formatRelativeDay, parseIsoDate } from '@/utils/dateFormat';

type ActivityDay = { day: string; data: ActivityEntry[] };

const FILTERS: Record<string, ActivityFilter> = {
  All: 'all',
  Notes: 'note',
  Requests: 'request',
  Visits: 'visit',
  Profile: 'profile',
};
const FILTER_LABELS = Object.keys(FILTERS);

const keyExtractor = (entry: ActivityEntry) => entry.id;

const groupByDay = (entries: ActivityEntry[]): ActivityDay[] => {
  const days = new Map<string, ActivityEntry[]>();
  for (const entry of entries) days.set(entry.day, [...(days.get(entry.day) ?? []), entry]);
  return Array.from(days, ([day, data]) => ({ day, data }));
};

export function ActivityLogList() {
  const tabBarSpace = useTabBarSpace();
  const activity = useActivityLog();
  const selected = FILTER_LABELS.filter((label) => FILTERS[label] === activity.filter);

  const renderEntry: SectionListRenderItem<ActivityEntry, ActivityDay> = ({
    item,
    index,
    section,
  }) => {
    const { icon, color } = activityIcon(item.kind);
    const time = formatClockTime(new Date(item.at));
    return (
      <View accessible accessibilityLabel={`${item.title}, ${item.subtitle}, ${time}`}>
        <LogGroupRow isFirst={index === 0} isLast={index === section.data.length - 1}>
          <IconCircle icon={icon} color={color} backgroundColor="surfaceMuted" size={36} />
          <View style={styles.body}>
            <ThemedText numberOfLines={1} style={styles.title}>
              {item.title}
            </ThemedText>
            {item.subtitle ? (
              <ThemedText themeColor="textSecondary" style={styles.details}>
                {item.subtitle}
              </ThemedText>
            ) : null}
          </View>
          <ThemedText themeColor="textSecondary" style={styles.time}>
            {time}
          </ThemedText>
        </LogGroupRow>
      </View>
    );
  };

  return (
    <SectionList
      sections={groupByDay(activity.entries)}
      keyExtractor={keyExtractor}
      renderItem={renderEntry}
      renderSectionHeader={({ section }) => (
        <View style={styles.sectionHeader}>
          <SectionHeader title={formatRelativeDay(parseIsoDate(section.day))} />
        </View>
      )}
      ListHeaderComponent={
        <View style={styles.filters}>
          <ChipGroup
            options={FILTER_LABELS}
            selected={selected}
            onToggle={(label) => activity.setFilter(FILTERS[label])}
            single
          />
        </View>
      }
      ListEmptyComponent={
        activity.error ? (
          <View style={styles.state}>
            <EmptyState message={activity.error} />
            <Button title="Try again" variant="secondary" size="small" onPress={activity.refresh} />
          </View>
        ) : activity.loading ? (
          <ActivityIndicator style={styles.state} />
        ) : (
          <EmptyState message="No activity yet." />
        )
      }
      ListFooterComponent={
        activity.loading && activity.entries.length > 0 ? (
          <ActivityIndicator style={styles.footer} />
        ) : undefined
      }
      onEndReached={activity.loadMore}
      onEndReachedThreshold={0.5}
      refreshing={false}
      onRefresh={activity.refresh}
      stickySectionHeadersEnabled={false}
      contentContainerStyle={[styles.content, { paddingBottom: tabBarSpace }]}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.three,
  },
  filters: {
    paddingTop: Spacing.three,
  },
  sectionHeader: {
    paddingTop: Spacing.five,
    paddingBottom: Spacing.three,
  },
  state: {
    gap: Spacing.three,
    alignItems: 'center',
    paddingTop: Spacing.four,
  },
  footer: {
    paddingVertical: Spacing.four,
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
  details: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: 400,
  },
  time: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: 400,
    fontVariant: ['tabular-nums'],
  },
});
