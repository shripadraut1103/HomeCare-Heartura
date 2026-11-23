import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View, type ListRenderItem } from 'react-native';
import Animated, { FadeIn, FadeOutLeft, LinearTransition } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTabBarSpace } from '@/components/AppTabs';
import { ThemedView } from '@/components/ThemedView';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { SegmentedControl, type Segment } from '@/components/ui/SegmentedControl';
import { TabPanel } from '@/components/ui/TabPanel';
import { Spacing } from '@/constants/Theme';
import {
  DeclineRequestSheet,
  type DeclineRequestSheetData,
} from '@/domain/requests/components/DeclineRequestSheet';
import { RequestCard } from '@/domain/requests/components/RequestCard';
import {
  usePatientRequests,
  useRequestCount,
  useRequestCountsLoader,
} from '@/domain/requests/hooks/useRequests';
import type { ApiDeclineReason } from '@/domain/requests/interfaces/RequestApi';
import type {
  PatientRequest,
  PatientRequestStatus,
} from '@/domain/requests/interfaces/RequestInterfaces';
import {
  acceptRequestAction,
  declineRequestAction,
} from '@/domain/requests/store/async-actions/RequestAsyncActions';
import { useTheme } from '@/hooks/useTheme';
import { setToastMessage } from '@/store/common-reducer/ToastReducer';
import { useAppDispatch } from '@/store/hooks';
import { haptics } from '@/utils/haptics';

const CONTENT_MAX_WIDTH = 720;

const TABS: readonly Segment<PatientRequestStatus>[] = [
  { value: 'waiting', label: 'Waiting' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'declined', label: 'Declined' },
];

const keyExtractor = (request: PatientRequest) => request.id;

export default function PatientRequestsScreen() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const tabBarSpace = useTabBarSpace();
  const [tab, setTab] = useState<PatientRequestStatus>('waiting');
  const { requests, loading, error, refresh, loadMore } = usePatientRequests(tab);
  const waiting = useRequestCount('waiting');
  const loadCounts = useRequestCountsLoader();
  const [accepting, setAccepting] = useState<string | null>(null);
  const declineSheet = useRef<BottomSheetModal<DeclineRequestSheetData>>(null);

  useFocusEffect(useCallback(() => loadCounts(), [loadCounts]));

  const fail = (message: string | undefined, fallback: string) => {
    haptics.error();
    dispatch(setToastMessage({ message: message || fallback, type: 'error' }));
  };

  const accept = async (request: PatientRequest) => {
    setAccepting(request.id);
    const result = await dispatch(acceptRequestAction({ requestId: request.id }));
    setAccepting(null);
    const payload = acceptRequestAction.fulfilled.match(result) ? result.payload : null;
    if (!payload || 'error' in payload) {
      fail(payload?.error, 'Couldn’t accept this request. Try again.');
      refresh();
      return;
    }
    haptics.success();
    dispatch(setToastMessage({ message: `Accepted ${request.patientName}` }));
    loadCounts();
  };

  const decline = async (requestId: string, reason: ApiDeclineReason, note: string) => {
    const result = await dispatch(declineRequestAction({ requestId, reason, note }));
    const payload = declineRequestAction.fulfilled.match(result) ? result.payload : null;
    if (!payload || 'error' in payload) {
      fail(payload?.error, 'Couldn’t decline this request. Try again.');
      return false;
    }
    haptics.tap();
    dispatch(setToastMessage({ message: `Declined ${payload.data.patient_name}` }));
    loadCounts();
    return true;
  };

  // Answered cards slide out and the rest move up; an undone one fades back in.
  const renderRequest: ListRenderItem<PatientRequest> = ({ item }) => (
    <Animated.View entering={FadeIn.duration(220)} exiting={FadeOutLeft.duration(220)}>
      <RequestCard
        request={item}
        accepting={accepting === item.id}
        disabled={accepting !== null}
        onAccept={(request) => void accept(request)}
        onDecline={(request) =>
          declineSheet.current?.present({ requestId: request.id, patientName: request.patientName })
        }
      />
    </Animated.View>
  );

  return (
    <ThemedView type="backgroundScreen" style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.container}>
        <ScreenHeader title="Patient requests" subtitle={`${waiting} waiting for you`} />
        <View
          style={[
            styles.tabs,
            { backgroundColor: theme.surfaceMuted, borderBottomColor: theme.border },
          ]}>
          <SegmentedControl segments={TABS} value={tab} onChange={setTab} />
        </View>
        <TabPanel tab={tab}>
          <Animated.FlatList
            data={requests}
            keyExtractor={keyExtractor}
            renderItem={renderRequest}
            itemLayoutAnimation={LinearTransition.duration(220)}
            ItemSeparatorComponent={Separator}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            refreshing={false}
            onRefresh={refresh}
            ListFooterComponent={
              loading && requests.length > 0 ? (
                <ActivityIndicator style={styles.footer} />
              ) : undefined
            }
            ListEmptyComponent={
              error ? (
                <View style={styles.errorState}>
                  <EmptyState message={error} />
                  <Button title="Try again" variant="secondary" size="small" onPress={refresh} />
                </View>
              ) : loading ? (
                <EmptyState message="Loading requests…" />
              ) : (
                <EmptyState />
              )
            }
            contentContainerStyle={[styles.content, { paddingBottom: tabBarSpace }]}
            showsVerticalScrollIndicator={false}
          />
        </TabPanel>
      </SafeAreaView>
      <DeclineRequestSheet ref={declineSheet} onDecline={decline} />
    </ThemedView>
  );
}

function Separator() {
  return <View style={styles.separator} />;
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
  content: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    padding: Spacing.three,
    paddingTop: Spacing.four,
  },
  separator: {
    height: Spacing.three,
  },
  footer: {
    paddingVertical: Spacing.three,
  },
  errorState: {
    alignItems: 'center',
    gap: Spacing.two,
  },
});
