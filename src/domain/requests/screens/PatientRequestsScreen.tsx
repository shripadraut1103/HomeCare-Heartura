import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRef, useState } from 'react';
import { StyleSheet, View, type ListRenderItem } from 'react-native';
import Animated, { FadeIn, FadeOutLeft, LinearTransition } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTabBarSpace } from '@/components/AppTabs';
import { ThemedView } from '@/components/ThemedView';
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
import { usePatientRequests } from '@/domain/requests/hooks/useRequests';
import type {
  PatientRequest,
  PatientRequestStatus,
} from '@/domain/requests/interfaces/RequestInterfaces';
import { answerRequest, reopenRequest } from '@/domain/requests/store/RequestsReducer';
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
  const requests = usePatientRequests();
  const declineSheet = useRef<BottomSheetModal<DeclineRequestSheetData>>(null);

  const waiting = requests.filter((request) => request.status === 'waiting').length;
  const visible = requests.filter((request) => request.status === tab);

  const answer = (requestId: string, status: 'accepted' | 'declined', reason?: string) => {
    const request = requests.find((item) => item.id === requestId);
    if (!request) return;
    if (status === 'accepted') haptics.success();
    else haptics.tap();
    dispatch(answerRequest({ requestId, status, reason }));
    dispatch(
      setToastMessage({
        message: `${status === 'accepted' ? 'Accepted' : 'Declined'} ${request.patientName}`,
        action: { label: 'Undo', onPress: reopenRequest({ requestId }) },
      })
    );
  };

  // Answered cards slide out and the rest move up; an undone one fades back in.
  const renderRequest: ListRenderItem<PatientRequest> = ({ item }) => (
    <Animated.View entering={FadeIn.duration(220)} exiting={FadeOutLeft.duration(220)}>
      <RequestCard
        request={item}
        onAccept={(request) => answer(request.id, 'accepted')}
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
            data={visible}
            keyExtractor={keyExtractor}
            renderItem={renderRequest}
            itemLayoutAnimation={LinearTransition.duration(220)}
            ItemSeparatorComponent={Separator}
            ListEmptyComponent={EmptyState}
            contentContainerStyle={[styles.content, { paddingBottom: tabBarSpace }]}
            showsVerticalScrollIndicator={false}
          />
        </TabPanel>
      </SafeAreaView>
      <DeclineRequestSheet
        ref={declineSheet}
        onDecline={(requestId, reason) => answer(requestId, 'declined', reason)}
      />
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
});
