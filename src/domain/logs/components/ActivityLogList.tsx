import { SectionList, StyleSheet, View, type SectionListRenderItem } from 'react-native';

import { useTabBarSpace } from '@/components/AppTabs';
import { ThemedText } from '@/components/ThemedText';
import { IconCircle } from '@/components/ui/IconCircle';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Spacing } from '@/constants/Theme';
import { LogGroupRow } from '@/domain/logs/components/LogGroupRow';
import type { ActivityEntry } from '@/domain/logs/interfaces/LogInterfaces';
import { ACTIVITY_ICON } from '@/domain/logs/logStyles';
import { formatClockTime, formatNumericDate } from '@/utils/dateFormat';

type ActivityDay = { day: string; data: ActivityEntry[] };

const keyExtractor = (entry: ActivityEntry) => entry.id;

/** Groups entries (already newest first) by calendar day, keeping their order. */
const groupByDay = (entries: ActivityEntry[]): ActivityDay[] => {
  const days = new Map<string, ActivityEntry[]>();
  for (const entry of entries) {
    const day = formatNumericDate(new Date(entry.at));
    days.set(day, [...(days.get(day) ?? []), entry]);
  }
  return Array.from(days, ([day, data]) => ({ day, data }));
};

export function ActivityLogList({ entries }: { entries: ActivityEntry[] }) {
  const tabBarSpace = useTabBarSpace();

  const renderEntry: SectionListRenderItem<ActivityEntry, ActivityDay> = ({
    item,
    index,
    section,
  }) => {
    const { icon, color } = ACTIVITY_ICON[item.kind];
    const time = formatClockTime(new Date(item.at));
    return (
      <View accessible accessibilityLabel={`${item.title}, ${item.details}, ${time}`}>
        <LogGroupRow isFirst={index === 0} isLast={index === section.data.length - 1}>
          <IconCircle icon={icon} color={color} backgroundColor="surfaceMuted" size={36} />
          <View style={styles.body}>
            <ThemedText numberOfLines={1} style={styles.title}>
              {item.title}
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.details}>
              {item.details}
            </ThemedText>
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
      sections={groupByDay(entries)}
      keyExtractor={keyExtractor}
      renderItem={renderEntry}
      renderSectionHeader={({ section }) => (
        <View style={styles.sectionHeader}>
          <SectionHeader title={section.day} />
        </View>
      )}
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
  sectionHeader: {
    paddingTop: Spacing.five,
    paddingBottom: Spacing.three,
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
