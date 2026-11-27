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
import type {
  ActivityLogState,
  LogsTab,
  VisitLogState,
} from '@/domain/logs/interfaces/LogInterfaces';
import { useTheme } from '@/hooks/useTheme';
import { useAppSelector } from '@/store/hooks';
import { formatMonthDay, parseIsoDate } from '@/utils/dateFormat';

const TABS: readonly Segment<LogsTab>[] = [
  { value: 'activity', label: 'Activity' },
  { value: 'visits', label: 'Visit log' },
];

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

const describeActivity = ({ loaded, total }: ActivityLogState) =>
  loaded ? plural(total, 'entry', 'entries') : '';

const describeVisitLog = ({ summary, dateFrom, dateTo }: VisitLogState) => {
  if (!summary || !dateFrom || !dateTo) return '';
  const range = `${formatMonthDay(parseIsoDate(dateFrom))} – ${formatMonthDay(parseIsoDate(dateTo))}`;
  const notSigned = summary.notSigned > 0 ? [`${summary.notSigned} not signed`] : [];
  return [plural(summary.visits, 'visit', 'visits'), range, ...notSigned].join(' · ');
};

export default function LogsScreen() {
  const theme = useTheme();
  const [tab, setTab] = useState<LogsTab>('activity');
  const activity = useAppSelector((state) => state.logs.activity);
  const visitLog = useAppSelector((state) => state.logs.visitLog);

  const subtitle = tab === 'activity' ? describeActivity(activity) : describeVisitLog(visitLog);

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
        <TabPanel tab={tab}>{tab === 'activity' ? <ActivityLogList /> : <VisitLogList />}</TabPanel>
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
