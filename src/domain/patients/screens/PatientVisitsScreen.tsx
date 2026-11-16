import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useCallback, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useTabBarSpace } from '@/components/AppTabs';
import {
  FLOATING_ACTION_BUTTON_SIZE,
  FloatingActionButton,
} from '@/components/ui/FloatingActionButton';
import { SegmentedControl, type Segment } from '@/components/ui/SegmentedControl';
import { TabPanel } from '@/components/ui/TabPanel';
import { Spacing } from '@/constants/Theme';
import {
  DocumentDetailsSheet,
  type DocumentDetailsSheetData,
} from '@/domain/patients/components/DocumentDetailsSheet';
import { DocumentList } from '@/domain/patients/components/DocumentList';
import { AppointmentList, IncidentList } from '@/domain/patients/components/VisitLists';
import { useRoutePatient } from '@/domain/patients/hooks/usePatients';
import type { PatientDocument } from '@/domain/patients/interfaces/PatientInterfaces';
import { useAllVisits } from '@/domain/visits/hooks/useVisits';
import { useTheme } from '@/hooks/useTheme';
import { setToastMessage } from '@/store/common-reducer/ToastReducer';
import { useAppDispatch } from '@/store/hooks';

type VisitsTab = 'documents' | 'appointments' | 'incidents';

const TABS: readonly Segment<VisitsTab>[] = [
  { value: 'documents', label: 'Documents' },
  { value: 'appointments', label: 'Appointments' },
  { value: 'incidents', label: 'Incidents' },
];

const isTab = (value: string | undefined): value is VisitsTab =>
  TABS.some((tab) => tab.value === value);

export default function PatientVisitsScreen() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const tabBarSpace = useTabBarSpace();
  const { tab: tabParam } = useLocalSearchParams<{ tab?: string }>();
  const { patient, chart } = useRoutePatient();
  const visits = useAllVisits();
  const documentSheet = useRef<BottomSheetModal<DocumentDetailsSheetData>>(null);
  const [tab, setTab] = useState<VisitsTab>(isTab(tabParam) ? tabParam : 'documents');

  useFocusEffect(
    useCallback(() => {
      if (isTab(tabParam)) setTab(tabParam);
    }, [tabParam])
  );

  if (!patient || !chart) return null;

  const patientVisits = visits
    .filter((visit) => visit.patientId === patient.id)
    .sort((a, b) => b.startsAt.localeCompare(a.startsAt));

  const notice = (message: string, type?: 'warning' | 'error') =>
    dispatch(setToastMessage({ message, type }));

  const openDocument = async (document: PatientDocument) => {
    if (!document.uri) {
      // TODO: download the file from the documents API before opening it.
      notice('This document opens once the documents service is connected.', 'warning');
      return;
    }
    try {
      if (await Sharing.isAvailableAsync())
        await Sharing.shareAsync(document.uri, {
          dialogTitle: document.title,
          mimeType: document.mimeType,
        });
    } catch {
      notice('Couldn’t open that document.', 'error');
    }
  };

  const fab =
    tab === 'documents'
      ? {
          label: 'Upload document',
          onPress: () =>
            router.push({ pathname: '/upload-document', params: { patientId: patient.id } }),
        }
      : tab === 'appointments'
        ? {
            label: 'Schedule appointment',
            onPress: () =>
              router.push({
                pathname: '/schedule-appointment',
                params: { patientId: patient.id },
              }),
          }
        : {
            label: 'Add incident',
            onPress: () =>
              router.push({ pathname: '/add-incident', params: { patientId: patient.id } }),
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
          {tab === 'documents' ? (
            <DocumentList
              documents={chart.documents}
              onOpenDetails={(document) => documentSheet.current?.present({ document })}
            />
          ) : tab === 'appointments' ? (
            <AppointmentList visits={patientVisits} />
          ) : (
            <IncidentList incidents={chart.incidents} />
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
      <DocumentDetailsSheet
        ref={documentSheet}
        onOpenFile={(document) => void openDocument(document)}
      />
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
