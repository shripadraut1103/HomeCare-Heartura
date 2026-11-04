import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, View, type ListRenderItem } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTabBarSpace } from '@/components/AppTabs';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import {
  FLOATING_ACTION_BUTTON_SIZE,
  FloatingActionButton,
} from '@/components/ui/FloatingActionButton';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Spacing } from '@/constants/Theme';
import { VisitTimelineItem } from '@/domain/home/components/VisitTimelineItem';
import { formatDuration, isSameDay, startOfDay } from '@/domain/schedule/calendar';
import { ScheduleEmptyState } from '@/domain/schedule/components/ScheduleEmptyState';
import { ScheduleCalendar } from '@/domain/schedule/components/ScheduleCalendar';
import {
  ScheduleFilterSheet,
  type ScheduleFilterSheetData,
} from '@/domain/schedule/components/ScheduleFilterSheet';
import {
  EMPTY_SCHEDULE_FILTER,
  type ScheduleFilter,
} from '@/domain/schedule/interfaces/ScheduleInterfaces';
import {
  applyScheduleFilter,
  dayStatuses,
  isFilterActive,
  summarizeDay,
} from '@/domain/schedule/scheduleFilter';
import {
  VisitDetailsSheet,
  type VisitDetailsSheetData,
} from '@/domain/visits/components/VisitDetailsSheet';
import { useAllVisits, visitsOn } from '@/domain/visits/hooks/useVisits';
import type { Visit } from '@/domain/visits/interfaces/VisitInterfaces';
import { useTheme } from '@/hooks/useTheme';
import { formatRelativeDay, toIsoDate } from '@/utils/dateFormat';

const CONTENT_MAX_WIDTH = 720;
const FILTER_BADGE_SIZE = 10;

const keyExtractor = (visit: Visit) => visit.id;

export default function ScheduleScreen() {
  const theme = useTheme();
  const tabBarSpace = useTabBarSpace();
  const filterSheet = useRef<BottomSheetModal<ScheduleFilterSheetData>>(null);
  const visitDetailsSheet = useRef<BottomSheetModal<VisitDetailsSheetData>>(null);
  const [selected, setSelected] = useState(() => startOfDay(new Date()));
  const [filter, setFilter] = useState<ScheduleFilter>(EMPTY_SCHEDULE_FILTER);

  const visible = applyScheduleFilter(useAllVisits(), filter);
  const dayVisits = visitsOn(visible, selected);
  const summary = summarizeDay(dayVisits);
  const dayLabel = formatRelativeDay(selected);
  const filtered = isFilterActive(filter);
  const isToday = isSameDay(selected, new Date());

  const scheduleAppointment = () =>
    router.push({ pathname: '/schedule-appointment', params: { date: toIsoDate(selected) } });

  const listHeader = (
    <View style={styles.listHeader}>
      <ScheduleCalendar
        selected={selected}
        onSelect={setSelected}
        statuses={dayStatuses(visible)}
      />
      <View style={styles.daySummary}>
        <ThemedText accessibilityRole="header" style={styles.dayTitle}>
          {dayLabel}
        </ThemedText>
        <View style={styles.dayStats}>
          <ThemedText themeColor="textSecondary" style={styles.stat}>
            <ThemedText style={[styles.stat, styles.statStrong]}>
              {summary.count} {summary.count === 1 ? 'visit' : 'visits'}
            </ThemedText>
            {` · ${formatDuration(summary.minutes)}`}
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.stat}>
            {summary.completed} completed
          </ThemedText>
        </View>
      </View>
    </View>
  );

  const renderVisit: ListRenderItem<Visit> = ({ item, index }) => (
    <Animated.View entering={FadeIn.duration(180)}>
      <VisitTimelineItem
        visit={item}
        isFirst={index === 0}
        isLast={index === dayVisits.length - 1}
        onPress={(visit) => visitDetailsSheet.current?.present({ visitId: visit.id })}
      />
    </Animated.View>
  );

  return (
    <ThemedView type="backgroundScreen" style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleBlock}>
            <ThemedText accessibilityRole="header" style={styles.title}>
              Schedule
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.subtitle}>
              {dayLabel}
            </ThemedText>
          </View>
          <View style={styles.headerActions}>
            {isToday ? null : (
              <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut.duration(120)}>
                <Button
                  title="Today"
                  variant="secondary"
                  size="small"
                  accessibilityLabel="Go to today"
                  onPress={() => setSelected(startOfDay(new Date()))}
                />
              </Animated.View>
            )}
            <View>
              <IconButton
                icon={{ ios: 'line.3.horizontal.decrease', android: 'filter_list' }}
                accessibilityLabel={filtered ? 'Filter, on' : 'Filter'}
                color="text"
                onPress={() => filterSheet.current?.present({ filter })}
              />
              {filtered ? (
                <View
                  style={[
                    styles.filterBadge,
                    { backgroundColor: theme.primary, borderColor: theme.backgroundScreen },
                  ]}
                />
              ) : null}
            </View>
          </View>
        </View>

        <Animated.FlatList
          data={dayVisits}
          keyExtractor={keyExtractor}
          renderItem={renderVisit}
          itemLayoutAnimation={LinearTransition.duration(180)}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={<ScheduleEmptyState filtered={filtered} />}
          ItemSeparatorComponent={VisitSeparator}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: tabBarSpace + FLOATING_ACTION_BUTTON_SIZE },
          ]}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>

      <View style={[styles.fab, { bottom: tabBarSpace - Spacing.two }]}>
        <FloatingActionButton
          accessibilityLabel="Schedule appointment"
          onPress={scheduleAppointment}
        />
      </View>

      <ScheduleFilterSheet ref={filterSheet} onApply={setFilter} />
      <VisitDetailsSheet ref={visitDetailsSheet} />
    </ThemedView>
  );
}

function VisitSeparator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  titleBlock: {
    gap: Spacing.half,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: 700,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: 400,
  },
  filterBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: FILTER_BADGE_SIZE + 4,
    height: FILTER_BADGE_SIZE + 4,
    borderRadius: (FILTER_BADGE_SIZE + 4) / 2,
    borderWidth: 2,
  },
  content: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: Spacing.three,
  },
  listHeader: {
    gap: Spacing.five,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.three,
  },
  daySummary: {
    gap: Spacing.three,
  },
  dayTitle: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: 700,
  },
  dayStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: 400,
  },
  statStrong: {
    fontWeight: 600,
  },
  separator: {
    height: Spacing.three,
  },
  fab: {
    position: 'absolute',
    right: Spacing.three,
  },
});
