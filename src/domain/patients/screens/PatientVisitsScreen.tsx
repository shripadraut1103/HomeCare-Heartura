import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
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
import { ResourceGate } from '@/domain/patients/components/ChartListParts';
import { DocumentList } from '@/domain/patients/components/DocumentList';
import { AppointmentList, IncidentList } from '@/domain/patients/components/VisitLists';
import { usePatientDocuments } from '@/domain/patients/hooks/usePatientDocuments';
import { usePatientResource, useRoutePatient } from '@/domain/patients/hooks/usePatients';
import { useTheme } from '@/hooks/useTheme';

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
  const tabBarSpace = useTabBarSpace();
  const { tab: tabParam } = useLocalSearchParams<{ tab?: string }>();
  const { patient, chart } = useRoutePatient();
  const documentSheet = useRef<BottomSheetModal<DocumentDetailsSheetData>>(null);
  const [tab, setTab] = useState<VisitsTab>(isTab(tabParam) ? tabParam : 'documents');
  const documentFiles = usePatientDocuments(patient?.id);
  const documents = usePatientResource(patient?.id, 'documents', tab === 'documents');
  const appointments = usePatientResource(patient?.id, 'appointments', tab === 'appointments');
  const incidents = usePatientResource(patient?.id, 'incidents', tab === 'incidents');

  useFocusEffect(
    useCallback(() => {
      if (isTab(tabParam)) setTab(tabParam);
    }, [tabParam])
  );

  if (!patient || !chart) return null;

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
            <ResourceGate state={documents}>
              <DocumentList
                documents={chart.documents}
                onOpenDetails={(document) => documentSheet.current?.present({ document })}
              />
            </ResourceGate>
          ) : tab === 'appointments' ? (
            <ResourceGate state={appointments}>
              <AppointmentList visits={chart.appointments ?? []} />
            </ResourceGate>
          ) : (
            <ResourceGate state={incidents}>
              <IncidentList patientId={patient.id} incidents={chart.incidents} />
            </ResourceGate>
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
      <DocumentDetailsSheet ref={documentSheet} onOpenFile={documentFiles.open} />
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
