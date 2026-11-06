import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useTabBarSpace } from '@/components/AppTabs';
import { ThemedText } from '@/components/ThemedText';
import { ChipGroup } from '@/components/ui/ChipGroup';
import {
  FLOATING_ACTION_BUTTON_SIZE,
  FloatingActionButton,
} from '@/components/ui/FloatingActionButton';
import { Pill } from '@/components/ui/Pill';
import { SegmentedControl, type Segment } from '@/components/ui/SegmentedControl';
import { TabPanel } from '@/components/ui/TabPanel';
import { Spacing } from '@/constants/Theme';
import { HistoryList } from '@/domain/patients/components/HistoryList';
import { PatientCardShell } from '@/domain/patients/components/PatientCardShell';
import { SEVERITY } from '@/domain/patients/components/PatientInfoSheet';
import { useRoutePatient } from '@/domain/patients/hooks/usePatients';
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

  useFocusEffect(
    useCallback(() => {
      if (isSection(sectionParam)) setSection(sectionParam);
    }, [sectionParam])
  );

  if (!patient || !chart) return null;

  const history = chart.history.filter((entry) => entry.category === category);

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
            <PatientCardShell>
              {chart.diagnoses.length > 0 ? (
                chart.diagnoses.map((diagnosis, index) => (
                  <View
                    key={diagnosis.code}
                    style={[
                      styles.item,
                      index > 0 && [styles.divider, { borderTopColor: theme.border }],
                    ]}>
                    <View style={styles.flex}>
                      <ThemedText style={styles.title}>
                        {diagnosis.code} · {diagnosis.description}
                      </ThemedText>
                      <ThemedText themeColor="textSecondary" style={styles.meta}>
                        {diagnosis.rank === 'primary' ? 'Primary diagnosis' : 'Secondary diagnosis'}
                      </ThemedText>
                    </View>
                    <Pill label={diagnosis.rank === 'primary' ? 'Primary' : 'Secondary'} dot />
                  </View>
                ))
              ) : (
                <Empty text="No diagnosis on file." />
              )}
            </PatientCardShell>
          ) : section === 'allergies' ? (
            <PatientCardShell>
              {chart.allergies.length > 0 ? (
                chart.allergies.map((allergy, index) => {
                  const severity = SEVERITY[allergy.severity];
                  return (
                    <View
                      key={allergy.name}
                      style={[
                        styles.item,
                        index > 0 && [styles.divider, { borderTopColor: theme.border }],
                      ]}>
                      <View style={styles.flex}>
                        <ThemedText style={styles.title}>{allergy.name}</ThemedText>
                        <ThemedText themeColor="textSecondary" style={styles.meta}>
                          {allergy.kind} · {allergy.reaction}
                        </ThemedText>
                      </View>
                      <Pill
                        label={severity.label}
                        dot
                        color={severity.color}
                        backgroundColor={severity.background}
                      />
                    </View>
                  );
                })
              ) : (
                <Empty text="No known allergies." />
              )}
            </PatientCardShell>
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
              <HistoryList
                key={category}
                entries={history}
                empty={`No ${HISTORY_LABELS[category].toLowerCase()} history recorded.`}
              />
            </>
          )}
        </ScrollView>
      </TabPanel>
      {section === 'history' ? (
        <View style={[styles.fab, { bottom: tabBarSpace - Spacing.two }]}>
          <FloatingActionButton
            label={`Add ${HISTORY_LABELS[category].toLowerCase()} history`}
            accessibilityLabel={`Add ${HISTORY_LABELS[category].toLowerCase()} history`}
            onPress={() =>
              router.push({ pathname: '/add-history', params: { patientId: patient.id, category } })
            }
          />
        </View>
      ) : null}
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
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  flex: {
    flex: 1,
  },
  title: {
    fontSize: 19,
    lineHeight: 25,
    fontWeight: 600,
  },
  meta: {
    fontSize: 16,
    lineHeight: 22,
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
