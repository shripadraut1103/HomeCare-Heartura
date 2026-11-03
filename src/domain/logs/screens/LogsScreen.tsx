import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/ThemedView';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { SegmentedControl, type Segment } from '@/components/ui/SegmentedControl';
import { TabPanel } from '@/components/ui/TabPanel';
import { Spacing } from '@/constants/Theme';
import { ActivityLogList } from '@/domain/logs/components/ActivityLogList';
import { VisitLogList } from '@/domain/logs/components/VisitLogList';
import { useActivityLog, useVisitLog } from '@/domain/logs/hooks/useLogs';
import type { LogsTab, VisitLogEntry } from '@/domain/logs/interfaces/LogInterfaces';
import { useTheme } from '@/hooks/useTheme';
import { formatMonthDay } from '@/utils/dateFormat';

const TABS: readonly Segment<LogsTab>[] = [
  { value: 'activity', label: 'Activity' },
  { value: 'visits', label: 'Visit log' },
];

const describeVisitLog = (entries: VisitLogEntry[]) => {
  const count = `${entries.length} ${entries.length === 1 ? 'visit' : 'visits'}`;
  if (entries.length === 0) return count;
  const times = entries.map((entry) => new Date(entry.startsAt).getTime());
  const first = formatMonthDay(new Date(Math.min(...times)));
  const last = formatMonthDay(new Date(Math.max(...times)));
  return `${count} · ${first} – ${last}`;
};

export default function LogsScreen() {
  const theme = useTheme();
  const [tab, setTab] = useState<LogsTab>('activity');
  const activity = useActivityLog();
  const visits = useVisitLog();

  const subtitle =
    tab === 'activity'
      ? `${activity.length} ${activity.length === 1 ? 'entry' : 'entries'}`
      : describeVisitLog(visits);

  return (
    <ThemedView type="backgroundScreen" style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.container}>
        <ScreenHeader title="My logs" subtitle={subtitle} />
        <View
          style={[
            styles.tabs,
            { backgroundColor: theme.surfaceMuted, borderBottomColor: theme.border },
          ]}>
          <SegmentedControl segments={TABS} value={tab} onChange={setTab} />
        </View>
        <TabPanel tab={tab}>
          {tab === 'activity' ? (
            <ActivityLogList entries={activity} />
          ) : (
            <VisitLogList entries={visits} />
          )}
        </TabPanel>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabs: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
