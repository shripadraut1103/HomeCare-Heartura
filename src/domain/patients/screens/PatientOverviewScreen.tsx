import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import { useRef, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { useTabBarSpace } from '@/components/AppTabs';
import { ThemedText } from '@/components/ThemedText';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Pill } from '@/components/ui/Pill';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { Radius, Shadows, Spacing, type ThemeColor } from '@/constants/Theme';
import { IncidentReportSheet } from '@/domain/notes/components/IncidentReportSheet';
import { useIncidentActions, type IncidentDraft } from '@/domain/patients/hooks/useIncidents';
import { PatientCardShell } from '@/domain/patients/components/PatientCardShell';
import { PatientMoreList } from '@/domain/patients/components/PatientMoreList';
import { PatientServices } from '@/domain/patients/components/PatientServices';
import { PatientStatusPill } from '@/domain/patients/components/PatientStatusPill';
import { ResourceGate } from '@/domain/patients/components/ChartListParts';
import { usePatientResource, useRoutePatient } from '@/domain/patients/hooks/usePatients';
import { eligibilityPill } from '@/domain/patients/patientInsurance';
import { ageFrom, patientDob } from '@/domain/patients/patientList';
import { useTheme } from '@/hooks/useTheme';
import { setToastMessage } from '@/store/common-reducer/ToastReducer';
import { useAppDispatch } from '@/store/hooks';
import { haptics } from '@/utils/haptics';
import { callPhone, openDirections } from '@/utils/linking';

export default function PatientOverviewScreen() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const tabBarSpace = useTabBarSpace();
  const { patient, chart } = useRoutePatient();
  const incidentSheet = useRef<BottomSheetModal>(null);
  const incidents = useIncidentActions(patient?.id);
  const chartState = usePatientResource(patient?.id, 'chart');

  if (!patient || !chart) return null;

  const eligibility = eligibilityPill(chart.eligibility);

  const saveIncident = async (occurredAt: Date, draft: IncidentDraft) => {
    const saved = await incidents.report(occurredAt, draft);
    if (saved) dispatch(setToastMessage({ message: 'Incident reported' }));
    return saved !== null;
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: tabBarSpace }]}
        showsVerticalScrollIndicator={false}>
        <SectionLabel title="Overview" />
        <ResourceGate state={chartState}>
          <PatientCardShell>
            <View style={styles.rows}>
              <OverviewRow label="Date of birth" first>
                <ThemedText style={styles.strong}>
                  {patientDob(patient)} · {ageFrom(patient.dateOfBirth)} yrs
                </ThemedText>
              </OverviewRow>
              <OverviewRow label="DDD number">
                <ThemedText style={styles.strong}>{chart.dddId}</ThemedText>
              </OverviewRow>
              <OverviewRow label="Status">
                <View style={styles.pills}>
                  <PatientStatusPill patient={patient} />
                  {eligibility ? (
                    <Pill
                      label={[eligibility.label, chart.eligibility.payer]
                        .filter(Boolean)
                        .join(' · ')}
                      dot
                      color={eligibility.color}
                      backgroundColor={eligibility.background}
                    />
                  ) : null}
                </View>
              </OverviewRow>
              <OverviewRow label="Phone">
                <Pressable
                  accessibilityRole="link"
                  accessibilityLabel={`Call ${patient.phone}`}
                  onPress={() => callPhone(patient.phone)}
                  style={styles.link}>
                  <Icon name={{ ios: 'phone', android: 'call' }} size={20} color={theme.primary} />
                  <ThemedText themeColor="primary" style={styles.strong}>
                    {patient.phone}
                  </ThemedText>
                </Pressable>
              </OverviewRow>
              <OverviewRow
                label="Address"
                labelIcon={{ ios: 'mappin.circle', android: 'location_on' }}>
                <Pressable
                  accessibilityRole="link"
                  accessibilityLabel={`Directions to ${patient.address}`}
                  onPress={() => void openDirections(patient.address)}>
                  <ThemedText themeColor="primary" style={[styles.strong, styles.right]}>
                    {patient.address}
                  </ThemedText>
                </Pressable>
              </OverviewRow>
            </View>
          </PatientCardShell>

          <SectionLabel title="Diagnosis" style={styles.sectionGap} />
          <PatientCardShell>
            {chart.diagnoses.length > 0 ? (
              chart.diagnoses.map((diagnosis, index) => (
                <View
                  key={diagnosis.code}
                  style={[
                    styles.diagnosis,
                    index > 0 && [styles.divider, { borderTopColor: theme.border }],
                  ]}>
                  <View style={styles.flex}>
                    <ThemedText style={styles.diagnosisTitle}>
                      {diagnosis.code} · {diagnosis.description}
                    </ThemedText>
                    <ThemedText themeColor="textSecondary" style={styles.diagnosisMeta}>
                      {diagnosis.rank === 'primary' ? 'Primary diagnosis' : 'Secondary diagnosis'}
                    </ThemedText>
                  </View>
                  <Pill label={diagnosis.rank === 'primary' ? 'Primary' : 'Secondary'} dot />
                </View>
              ))
            ) : (
              <ThemedText themeColor="textSecondary" style={styles.empty}>
                No diagnosis on file.
              </ThemedText>
            )}
          </PatientCardShell>

          <SectionLabel title={`Services · ${chart.services.length}`} style={styles.sectionGap} />
          <PatientServices services={chart.services} />
        </ResourceGate>

        <SectionLabel title="Quick actions" style={styles.sectionGap} />
        <View style={styles.actions}>
          <QuickAction
            icon={{ ios: 'calendar', android: 'calendar_month' }}
            label="Schedule"
            color="toneBlueFg"
            background="toneBlueBg"
            onPress={() =>
              router.push({ pathname: '/schedule-appointment', params: { patientId: patient.id } })
            }
          />
          <QuickAction
            icon={{ ios: 'plus', android: 'add' }}
            label="Visit"
            color="accent"
            background="toneTealBg"
            onPress={() =>
              router.push({ pathname: '/create-visit', params: { patientId: patient.id } })
            }
          />
          <QuickAction
            icon={{ ios: 'exclamationmark.triangle', android: 'warning' }}
            label="Incident"
            color="toneAmberFg"
            background="toneAmberBg"
            onPress={() => incidentSheet.current?.present()}
          />
        </View>

        <SectionLabel title="More" style={styles.sectionGap} />
        <PatientMoreList patient={patient} chart={chart} />
      </ScrollView>
      <IncidentReportSheet ref={incidentSheet} saveLabel="Report incident" onSave={saveIncident} />
    </>
  );
}

function OverviewRow({
  label,
  labelIcon,
  first = false,
  children,
}: {
  label: string;
  labelIcon?: IconName;
  first?: boolean;
  children: ReactNode;
}) {
  const theme = useTheme();

  return (
    <View style={[styles.row, !first && [styles.divider, { borderTopColor: theme.border }]]}>
      <View style={styles.label}>
        <ThemedText themeColor="textSecondary" style={styles.labelText}>
          {label}
        </ThemedText>
        {labelIcon ? <Icon name={labelIcon} size={20} color={theme.primary} /> : null}
      </View>
      <View style={styles.value}>{children}</View>
    </View>
  );
}

function QuickAction({
  icon,
  label,
  color,
  background,
  onPress,
}: {
  icon: IconName;
  label: string;
  color: ThemeColor;
  background: ThemeColor;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        haptics.tap();
        onPress();
      }}
      style={({ pressed }) => [
        styles.action,
        { backgroundColor: theme[background] },
        pressed && styles.pressed,
      ]}>
      <Icon name={icon} size={26} color={theme[color]} />
      <ThemedText themeColor={color} style={styles.actionLabel}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
  },
  sectionGap: {
    marginTop: Spacing.three,
  },
  rows: {
    paddingHorizontal: Spacing.four,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
    paddingVertical: Spacing.three + Spacing.half,
  },
  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  label: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  labelText: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: 400,
  },
  value: {
    flex: 1,
    alignItems: 'flex-end',
  },
  strong: {
    fontSize: 19,
    lineHeight: 26,
    fontWeight: 600,
  },
  right: {
    textAlign: 'right',
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: Spacing.two,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  diagnosis: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  flex: {
    flex: 1,
  },
  diagnosisTitle: {
    fontSize: 19,
    lineHeight: 26,
    fontWeight: 600,
  },
  diagnosisMeta: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: 400,
  },
  empty: {
    textAlign: 'center',
    paddingVertical: Spacing.four,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  action: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.four,
    borderRadius: Radius.medium,
    ...Shadows.card,
  },
  actionLabel: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: 600,
  },
  pressed: {
    opacity: 0.75,
  },
});
