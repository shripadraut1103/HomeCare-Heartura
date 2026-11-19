import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useTabBarSpace } from '@/components/AppTabs';
import { ChipGroup } from '@/components/ui/ChipGroup';
import {
  FLOATING_ACTION_BUTTON_SIZE,
  FloatingActionButton,
} from '@/components/ui/FloatingActionButton';
import { SegmentedControl, type Segment } from '@/components/ui/SegmentedControl';
import { TabPanel } from '@/components/ui/TabPanel';
import { Spacing } from '@/constants/Theme';
import { AllergyList, DiagnosisList } from '@/domain/patients/components/ClinicalLists';
import { ResourceGate } from '@/domain/patients/components/ChartListParts';
import { HistoryList } from '@/domain/patients/components/HistoryList';
import { usePatientResource, useRoutePatient } from '@/domain/patients/hooks/usePatients';
import { HISTORY_CATEGORIES, HISTORY_LABELS } from '@/domain/patients/patientHistory';
import type { HistoryCategory } from '@/domain/patients/interfaces/PatientInterfaces';
import { useTheme } from '@/hooks/useTheme';

type ClinicalSection = 'diagnosis' | 'allergies' | 'history';

const SECTIONS: readonly Segment<ClinicalSection>[] = [
  { value: 'diagnosis', label: 'Diagnosis' },
  { value: 'allergies', label: 'Allergies' },
  { value: 'history', label: 'Patient history' },
];

const isSection = (value: string | undefined): value is ClinicalSection =>
  SECTIONS.some((section) => section.value === value);

export default function PatientClinicalScreen() {
  const theme = useTheme();
  const tabBarSpace = useTabBarSpace();
  const { section: sectionParam } = useLocalSearchParams<{ section?: string }>();
  const { patient, chart } = useRoutePatient();
  const [section, setSection] = useState<ClinicalSection>(
    isSection(sectionParam) ? sectionParam : 'diagnosis'
  );
  const [category, setCategory] = useState<HistoryCategory>('surgical');
  const diagnoses = usePatientResource(patient?.id, 'diagnoses', section === 'diagnosis');
  const allergies = usePatientResource(patient?.id, 'allergies', section === 'allergies');
  const history = usePatientResource(patient?.id, `history:${category}`, section === 'history');

  useFocusEffect(
    useCallback(() => {
      if (isSection(sectionParam)) setSection(sectionParam);
    }, [sectionParam])
  );

  if (!patient || !chart) return null;

  const entries = chart.history.filter((entry) => entry.category === category);
  const params = { patientId: patient.id };
  const addAction =
    section === 'diagnosis'
      ? {
          label: 'Add diagnosis',
          onPress: () => router.push({ pathname: '/add-diagnosis', params }),
        }
      : section === 'allergies'
        ? {
            label: 'Add allergy',
            onPress: () => router.push({ pathname: '/add-allergy', params }),
          }
        : {
            label: `Add ${HISTORY_LABELS[category].toLowerCase()} history`,
            onPress: () =>
              router.push({ pathname: '/add-history', params: { ...params, category } }),
          };

  return (
    <View style={styles.container}>
      <View style={[styles.band, { backgroundColor: theme.backgroundScreen }]}>
        <SegmentedControl segments={SECTIONS} value={section} onChange={setSection} />
      </View>
      <TabPanel tab={section}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: tabBarSpace + FLOATING_ACTION_BUTTON_SIZE },
          ]}
          showsVerticalScrollIndicator={false}>
          {section === 'diagnosis' ? (
            <ResourceGate state={diagnoses}>
              <DiagnosisList diagnoses={chart.diagnoses} />
            </ResourceGate>
          ) : section === 'allergies' ? (
            <ResourceGate state={allergies}>
              <AllergyList allergies={chart.allergies} />
            </ResourceGate>
          ) : (
            <>
              <ChipGroup
                single
                solid
                options={HISTORY_CATEGORIES.map((item) => HISTORY_LABELS[item])}
                selected={[HISTORY_LABELS[category]]}
                onToggle={(label) => {
                  const next = HISTORY_CATEGORIES.find((item) => HISTORY_LABELS[item] === label);
                  if (next) setCategory(next);
                }}
              />
              <ResourceGate state={history}>
                <HistoryList
                  key={category}
                  entries={entries}
                  empty={`No ${HISTORY_LABELS[category].toLowerCase()} history recorded.`}
                />
              </ResourceGate>
            </>
          )}
        </ScrollView>
      </TabPanel>
      <View style={[styles.fab, { bottom: tabBarSpace - Spacing.two }]}>
        <FloatingActionButton
          key={addAction.label}
          label={addAction.label}
          accessibilityLabel={addAction.label}
          onPress={addAction.onPress}
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
