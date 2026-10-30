import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import { useRef } from 'react';
import { FlatList, StyleSheet, View, type ListRenderItem } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTabBarSpace } from '@/components/AppTabs';
import { ThemedView } from '@/components/ThemedView';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Spacing } from '@/constants/Theme';
import { GreetingCard } from '@/domain/home/components/GreetingCard';
import { HomeHeader } from '@/domain/home/components/HomeHeader';
import { NewCaseCard } from '@/domain/home/components/NewCaseCard';
import { QuickActions } from '@/domain/home/components/QuickActions';
import { UnscheduledPatientsBanner } from '@/domain/home/components/UnscheduledPatientsBanner';
import { VisitTimelineItem } from '@/domain/home/components/VisitTimelineItem';
import { useHomeSummary } from '@/domain/home/hooks/useHomeSummary';
import { NotificationsSheet } from '@/domain/notifications/components/NotificationsSheet';
import { useNotifications } from '@/domain/notifications/hooks/useNotifications';
import {
  VisitDetailsSheet,
  type VisitDetailsSheetData,
} from '@/domain/visits/components/VisitDetailsSheet';
import { useTodaysVisits } from '@/domain/visits/hooks/useVisits';
import type { Visit } from '@/domain/visits/interfaces/VisitInterfaces';
import { getGreeting } from '@/utils/dateFormat';
import { getFirstName } from '@/utils/nameFormat';

const CONTENT_MAX_WIDTH = 720;

const keyExtractor = (visit: Visit) => visit.id;

export default function HomeScreen() {
  const summary = useHomeSummary();
  const tabBarSpace = useTabBarSpace();
  const notifications = useNotifications();
  const notificationsSheet = useRef<BottomSheetModal<undefined>>(null);
  const visitDetailsSheet = useRef<BottomSheetModal<VisitDetailsSheetData>>(null);
  const todaysVisits = useTodaysVisits();
  const now = new Date();
  const visitCount = todaysVisits.length;

  const goToSchedule = () => router.navigate('/schedule');
  const openVisit = (visitId: string) => visitDetailsSheet.current?.present({ visitId });

  const listHeader = (
    <View style={styles.listHeader}>
      <GreetingCard
        greeting={getGreeting(now)}
        firstName={getFirstName(summary.providerName)}
        stats={summary.stats}
      />
      <View style={styles.actions}>
        <UnscheduledPatientsBanner
          count={summary.unscheduledPatients}
          onSchedulePress={goToSchedule}
        />
        <QuickActions onSchedulePress={goToSchedule} />
      </View>
      <SectionHeader
        title="Today’s schedule"
        count={visitCount}
        actionLabel="See all"
        onActionPress={goToSchedule}
      />
    </View>
  );

  const listFooter =
    summary.newCases.length > 0 ? (
      <View style={styles.listFooter}>
        <SectionHeader title="New cases" count={summary.newCases.length} />
        {summary.newCases.map((newCase) => (
          <NewCaseCard key={newCase.id} newCase={newCase} onPress={goToSchedule} />
        ))}
      </View>
    ) : undefined;

  const renderVisit: ListRenderItem<Visit> = ({ item, index }) => (
    <VisitTimelineItem
      visit={item}
      isFirst={index === 0}
      isLast={index === visitCount - 1}
      onPress={(visit) => openVisit(visit.id)}
    />
  );

  return (
    <ThemedView type="backgroundScreen" style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.container}>
        <View style={styles.header}>
          <HomeHeader
            date={now}
            unreadNotifications={notifications.length}
            onNotificationsPress={() => notificationsSheet.current?.present()}
          />
        </View>
        <FlatList
          data={todaysVisits}
          keyExtractor={keyExtractor}
          renderItem={renderVisit}
          ListHeaderComponent={listHeader}
          ListFooterComponent={listFooter}
          ItemSeparatorComponent={VisitSeparator}
          contentContainerStyle={[styles.content, { paddingBottom: tabBarSpace }]}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
      <NotificationsSheet ref={notificationsSheet} onOpenVisit={openVisit} />
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
  content: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: Spacing.three,
  },
  header: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
  },
  listHeader: {
    gap: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.four,
  },
  listFooter: {
    gap: Spacing.three - Spacing.one,
    paddingTop: Spacing.five,
  },
  actions: {
    gap: Spacing.three - Spacing.one,
  },
  separator: {
    // Must match the rail overhang in VisitTimelineItem so the line stays continuous.
    height: Spacing.three,
  },
});
