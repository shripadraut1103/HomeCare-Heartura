import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useTabBarSpace } from '@/components/AppTabs';
import {
  FLOATING_ACTION_BUTTON_SIZE,
  FloatingActionButton,
} from '@/components/ui/FloatingActionButton';
import { SegmentedControl, type Segment } from '@/components/ui/SegmentedControl';
import { TabPanel } from '@/components/ui/TabPanel';
import { Spacing } from '@/constants/Theme';
import { ChartNoteList, InsuranceList } from '@/domain/patients/components/MoreLists';
import { useRoutePatient } from '@/domain/patients/hooks/usePatients';
import { useTheme } from '@/hooks/useTheme';

type MoreTab = 'notes' | 'insurance';

const TABS: readonly Segment<MoreTab>[] = [
  { value: 'notes', label: 'Notes' },
  { value: 'insurance', label: 'Insurance' },
];

const isTab = (value: string | undefined): value is MoreTab =>
  TABS.some((tab) => tab.value === value);

export default function PatientMoreScreen() {
  const theme = useTheme();
  const tabBarSpace = useTabBarSpace();
  const { tab: tabParam } = useLocalSearchParams<{ tab?: string }>();
  const { patient, chart } = useRoutePatient();
  const [tab, setTab] = useState<MoreTab>(isTab(tabParam) ? tabParam : 'notes');

  useFocusEffect(
    useCallback(() => {
      if (isTab(tabParam)) setTab(tabParam);
    }, [tabParam])
  );

  if (!patient || !chart) return null;

  const params = { patientId: patient.id };
  const fab =
    tab === 'notes'
      ? { label: 'Add note', onPress: () => router.push({ pathname: '/add-note', params }) }
      : {
          label: 'Add insurance',
          onPress: () => router.push({ pathname: '/add-insurance', params }),
        };

  return (
    <View style={styles.container}>
      <View style={[styles.band, { backgroundColor: theme.backgroundScreen }]}>
        <SegmentedControl segments={TABS} value={tab} onChange={setTab} />
      </View>
      <TabPanel tab={tab}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: tabBarSpace + FLOATING_ACTION_BUTTON_SIZE },
          ]}
          showsVerticalScrollIndicator={false}>
          {tab === 'notes' ? (
            <ChartNoteList notes={chart.notes} />
          ) : (
            <InsuranceList plans={chart.insurancePlans} />
          )}
        </ScrollView>
      </TabPanel>
      <View style={[styles.fab, { bottom: tabBarSpace - Spacing.two }]}>
        <FloatingActionButton
          key={fab.label}
          label={fab.label}
          accessibilityLabel={fab.label}
          onPress={fab.onPress}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  band: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
  },
  content: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
  },
  fab: {
    position: 'absolute',
    right: Spacing.three,
  },
});
