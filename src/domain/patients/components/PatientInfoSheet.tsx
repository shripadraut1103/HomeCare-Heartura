import {
  BottomSheetScrollView,
  useBottomSheetModal,
  type BottomSheetModal,
} from '@gorhom/bottom-sheet';
import type { Ref } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppBottomSheet } from '@/components/sheet/AppBottomSheet';
import { SheetHeader } from '@/components/sheet/SheetHeader';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { DetailRow } from '@/components/ui/DetailRow';
import { Pill } from '@/components/ui/Pill';
import { Spacing } from '@/constants/Theme';
import { SEVERITY } from '@/domain/patients/clinicalStyles';
import { PatientStatusPill } from '@/domain/patients/components/PatientStatusPill';
import { ResourceGate } from '@/domain/patients/components/ChartListParts';
import {
  usePatient,
  usePatientChart,
  usePatientResource,
} from '@/domain/patients/hooks/usePatients';
import type { Patient, PatientChart } from '@/domain/patients/interfaces/PatientInterfaces';
import { eligibilityPill } from '@/domain/patients/patientInsurance';
import { ageFrom, patientDob } from '@/domain/patients/patientList';
import { useTheme } from '@/hooks/useTheme';

const MAX_HEIGHT_RATIO = 0.85;

export type PatientInfoKind =
  'details' | 'groupHome' | 'contact' | 'allergies' | 'insurance' | 'notes';

export type PatientInfoSheetData = { patientId: string; kind: PatientInfoKind };

const TITLES: Record<PatientInfoKind, string> = {
  details: 'Patient details',
  groupHome: 'Group home',
  contact: 'Address & phone',
  allergies: 'Allergies',
  insurance: 'Insurance',
  notes: 'Notes',
};

export function PatientInfoSheet({ ref }: { ref: Ref<BottomSheetModal<PatientInfoSheetData>> }) {
  const { height } = useWindowDimensions();

  return (
    <AppBottomSheet<PatientInfoSheetData>
      ref={ref}
      maxDynamicContentSize={height * MAX_HEIGHT_RATIO}>
      {({ data }) => (data ? <InfoContent {...data} /> : null)}
    </AppBottomSheet>
  );
}

function InfoContent({ patientId, kind }: PatientInfoSheetData) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { dismiss } = useBottomSheetModal();
  const patient = usePatient(patientId);
  const chart = usePatientChart(patientId);
  const notes = usePatientResource(patientId, 'notes', kind === 'notes');

  return (
    <BottomSheetScrollView stickyHeaderIndices={[0]}>
      <SheetHeader title={TITLES[kind]} onClose={() => dismiss()} />
      <View style={styles.body}>
        {patient && chart ? (
          kind === 'notes' ? (
            <ResourceGate state={notes}>
              <InfoBody kind={kind} patient={patient} chart={chart} />
            </ResourceGate>
          ) : (
            <InfoBody kind={kind} patient={patient} chart={chart} />
          )
        ) : null}
      </View>
      <View
        style={[
          styles.footer,
          { borderTopColor: theme.border, paddingBottom: insets.bottom + Spacing.three },
        ]}>
        <Button title="Done" style={styles.done} onPress={() => dismiss()} />
      </View>
    </BottomSheetScrollView>
  );
}

function InfoBody({
  kind,
  patient,
  chart,
}: {
  kind: PatientInfoKind;
  patient: Patient;
  chart: PatientChart;
}) {
  switch (kind) {
    case 'details':
      return (
        <View>
          <DetailRow label="Name">{patient.name}</DetailRow>
          <DetailRow label="Date of birth">
            {`${patientDob(patient)} · ${ageFrom(patient.dateOfBirth)} yrs`}
          </DetailRow>
          <DetailRow label="Sex">{chart.sex}</DetailRow>
          <DetailRow label="Preferred language">{chart.language}</DetailRow>
          <DetailRow label="DDD ID">{chart.dddId}</DetailRow>
          <DetailRow label="Status">
            <PatientStatusPill patient={patient} />
          </DetailRow>
          <DetailRow label="Guardian" isLast>
            {chart.guardian}
          </DetailRow>
        </View>
      );
    case 'groupHome':
      return chart.groupHome ? (
        <View>
          <DetailRow label="Agency">{chart.groupHome.agency}</DetailRow>
          <DetailRow label="Group home">{chart.groupHome.name}</DetailRow>
          <DetailRow label="Address">{chart.groupHome.address}</DetailRow>
          <DetailRow label="Home phone">{chart.groupHome.phone}</DetailRow>
          <DetailRow label="Manager" isLast>
            {chart.groupHome.manager}
          </DetailRow>
        </View>
      ) : (
        <Empty text={`${patient.name} doesn’t live in a group home.`} />
      );
    case 'contact':
      return (
        <View>
          {chart.addresses?.length ? (
            chart.addresses.map((address, index) => (
              <DetailRow key={`${address.label}-${index}`} label={address.label}>
                {address.line}
              </DetailRow>
            ))
          ) : (
            <DetailRow label="Primary">{patient.address}</DetailRow>
          )}
          <DetailRow label="Phone" isLast={!chart.email}>
            {chart.phones.join('  ')}
          </DetailRow>
          {chart.email ? (
            <DetailRow label="Email" isLast>
              {chart.email}
            </DetailRow>
          ) : null}
        </View>
      );
    case 'allergies':
      return chart.allergies.length > 0 ? (
        <View style={styles.list}>
          {chart.allergies.map((allergy) => {
            const severity = SEVERITY[allergy.severity];
            return (
              <View key={allergy.name} style={styles.allergy}>
                <View style={styles.flex}>
                  <ThemedText style={styles.itemTitle}>{allergy.name}</ThemedText>
                  <ThemedText themeColor="textSecondary" style={styles.itemMeta}>
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
          })}
        </View>
      ) : (
        <Empty text="No known allergies." />
      );
    case 'insurance': {
      const eligibility = eligibilityPill(chart.eligibility);
      return (
        <View>
          <DetailRow label="Primary">{chart.insurance.primary}</DetailRow>
          <DetailRow label="Eligibility" isLast={!chart.insurance.secondary}>
            {eligibility ? (
              <Pill
                label={eligibility.label}
                dot
                color={eligibility.color}
                backgroundColor={eligibility.background}
              />
            ) : (
              '—'
            )}
          </DetailRow>
          {chart.insurance.secondary ? (
            <DetailRow label="Secondary" isLast>
              {chart.insurance.secondary}
            </DetailRow>
          ) : null}
        </View>
      );
    }
    case 'notes':
      return chart.notes.length > 0 ? (
        <View style={styles.list}>
          {chart.notes.map((note) => (
            <View key={note.id} style={styles.note}>
              <ThemedText themeColor="textSecondary" style={styles.noteText}>
                {note.text}
              </ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.itemMeta}>
                {note.author} · {note.date}
              </ThemedText>
            </View>
          ))}
        </View>
      ) : (
        <Empty text="No notes yet." />
      );
  }
}

function Empty({ text }: { text: string }) {
  return (
    <ThemedText themeColor="textSecondary" style={styles.empty}>
      {text}
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  footer: {
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  done: {
    minWidth: 160,
  },
  list: {
    gap: Spacing.four,
    paddingVertical: Spacing.two,
  },
  allergy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.two,
  },
  flex: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: 600,
  },
  itemMeta: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: 400,
  },
  note: {
    gap: Spacing.two,
  },
  noteText: {
    fontSize: 17,
    lineHeight: 26,
    fontWeight: 400,
  },
  empty: {
    textAlign: 'center',
    paddingVertical: Spacing.four,
  },
});
