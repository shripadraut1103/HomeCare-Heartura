import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useCallback, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useTabBarSpace } from '@/components/AppTabs';
import { ThemedText } from '@/components/ThemedText';
import {
  FLOATING_ACTION_BUTTON_SIZE,
  FloatingActionButton,
} from '@/components/ui/FloatingActionButton';
import { SegmentedControl, type Segment } from '@/components/ui/SegmentedControl';
import { TabPanel } from '@/components/ui/TabPanel';
import { Spacing } from '@/constants/Theme';
import { IncidentReportSheet } from '@/domain/notes/components/IncidentReportSheet';
import type { IncidentReport } from '@/domain/notes/interfaces/NoteInterfaces';
import {
  DocumentDetailsSheet,
  type DocumentDetailsSheetData,
} from '@/domain/patients/components/DocumentDetailsSheet';
import { DocumentList } from '@/domain/patients/components/DocumentList';
import { PatientCardShell } from '@/domain/patients/components/PatientCardShell';
import { useRoutePatient } from '@/domain/patients/hooks/usePatients';
import type { PatientDocument } from '@/domain/patients/interfaces/PatientInterfaces';
import { addPatientIncident } from '@/domain/patients/store/PatientsReducer';
import { useProfile } from '@/domain/profile/hooks/useProfile';
import { VisitCard } from '@/domain/visits/components/VisitCard';
import {
  VisitDetailsSheet,
  type VisitDetailsSheetData,
} from '@/domain/visits/components/VisitDetailsSheet';
import { useAllVisits } from '@/domain/visits/hooks/useVisits';
import { useTheme } from '@/hooks/useTheme';
import { setToastMessage } from '@/store/common-reducer/ToastReducer';
import { useAppDispatch } from '@/store/hooks';
import { formatNumericDate, formatTime } from '@/utils/dateFormat';
import { haptics } from '@/utils/haptics';

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
  const provider = useProfile();
  const { tab: tabParam } = useLocalSearchParams<{ tab?: string }>();
  const { patient, chart } = useRoutePatient();
  const visits = useAllVisits();
  const visitSheet = useRef<BottomSheetModal<VisitDetailsSheetData>>(null);
  const incidentSheet = useRef<BottomSheetModal>(null);
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

  const saveIncident = (incident: IncidentReport) => {
    dispatch(
      addPatientIncident({
        patientId: patient.id,
        incident: { ...incident, reportedBy: provider.name },
      })
    );
    haptics.success();
    notice('Incident reported');
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
            label: 'Create visit',
            onPress: () =>
              router.push({ pathname: '/create-visit', params: { patientId: patient.id } }),
          }
        : { label: 'Report incident', onPress: () => incidentSheet.current?.present() };

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
            patientVisits.length > 0 ? (
              patientVisits.map((visit) => (
                <VisitCard
                  key={visit.id}
                  visit={visit}
                  onPress={(item) => visitSheet.current?.present({ visitId: item.id })}
                />
              ))
            ) : (
              <PatientCardShell>
                <Empty text="No appointments yet." />
              </PatientCardShell>
            )
          ) : (
            <PatientCardShell>
              {chart.incidents.length > 0 ? (
                chart.incidents.map((incident, index) => (
                  <View
                    key={incident.id}
                    style={[
                      styles.incident,
                      index > 0 && [styles.divider, { borderTopColor: theme.border }],
                    ]}>
                    <ThemedText themeColor="textSecondary" style={styles.incidentMeta}>
                      {formatNumericDate(new Date(incident.occurredAt))} ·{' '}
                      {formatTime(new Date(incident.occurredAt))} · {incident.reportedBy}
                    </ThemedText>
                    <ThemedText style={styles.incidentText}>{incident.description}</ThemedText>
                  </View>
                ))
              ) : (
                <Empty text="No incidents reported." />
              )}
            </PatientCardShell>
          )}
        </ScrollView>
      </TabPanel>
      <View style={[styles.fab, { bottom: tabBarSpace - Spacing.two }]}>
        <FloatingActionButton
          label={fab.label}
          accessibilityLabel={fab.label}
          onPress={fab.onPress}
        />
      </View>
      <VisitDetailsSheet ref={visitSheet} />
      <DocumentDetailsSheet
        ref={documentSheet}
        onOpenFile={(document) => void openDocument(document)}
      />
      <IncidentReportSheet ref={incidentSheet} onSave={saveIncident} />
    </View>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <ThemedText themeColor="textSecondary" style={styles.empty}>
      {text}
    </ThemedText>
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
  open: {
    alignSelf: 'flex-start',
  },
  showAll: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  incident: {
    gap: Spacing.one,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  incidentMeta: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 600,
  },
  incidentText: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: 400,
  },
  empty: {
    textAlign: 'center',
    paddingVertical: Spacing.four,
  },
  fab: {
    position: 'absolute',
    right: Spacing.three,
  },
});
