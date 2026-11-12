import { useLocalSearchParams } from 'expo-router';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Pill } from '@/components/ui/Pill';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { Spacing } from '@/constants/Theme';
import { useNoteTemplates } from '@/domain/notes/hooks/useNotes';
import type { NoteTemplateKind } from '@/domain/notes/interfaces/NoteInterfaces';
import { withComponents } from '@/domain/notes/noteComponents';
import { readOnlySections, type ReadOnlyRow } from '@/domain/notes/readOnlyNote';
import { PatientCardShell } from '@/domain/patients/components/PatientCardShell';
import { usePatient, usePatientChart } from '@/domain/patients/hooks/usePatients';
import type { ChartRecord, RecordKind } from '@/domain/patients/interfaces/PatientInterfaces';
import {
  readOnlyTitle,
  recordDetails,
  signatureLine,
  statusLine,
} from '@/domain/patients/patientRecords';
import { useTheme } from '@/hooks/useTheme';

const LABEL_WIDTH = 120;

const TEMPLATE: Record<RecordKind, NoteTemplateKind> = {
  daily: 'dailyNote',
  evaluation: 'evaluation',
  carePlan: 'carePlan',
  progress: 'progress',
  discharge: 'progress',
};

export default function ChartNoteScreen() {
  const { patientId, recordId } = useLocalSearchParams<{ patientId: string; recordId: string }>();
  const patient = usePatient(patientId);
  const chart = usePatientChart(patientId);
  const record = chart?.records.find((item) => item.id === recordId);

  return (
    <ThemedView type="backgroundScreen" style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.container}>
        <ScreenHeader
          title={record ? readOnlyTitle(record) : 'Note'}
          subtitle={patient ? `${patient.name} · Read only` : undefined}
        />
        {record ? (
          <NoteBody record={record} />
        ) : (
          <ThemedText themeColor="textSecondary" style={styles.missing}>
            This note isn’t available any more.
          </ThemedText>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

function NoteBody({ record }: { record: ChartRecord }) {
  const insets = useSafeAreaInsets();
  const { sections, components } = useNoteTemplates(TEMPLATE[record.kind]);
  const template =
    record.kind === 'carePlan'
      ? withComponents(
          sections,
          components,
          components.map((component) => component.id)
        )
      : sections;
  const content = readOnlySections(template, record.values ?? {});
  const signed = record.status === 'signed';

  return (
    <ScrollView
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.five }]}
      showsVerticalScrollIndicator={false}>
      <PatientCardShell>
        <View style={styles.card}>
          <View style={styles.summaryHeader}>
            <ThemedText style={styles.summaryTitle}>{readOnlyTitle(record)}</ThemedText>
            <Pill
              label={signed ? 'Active' : statusLine(record)}
              dot
              color={
                signed ? 'success' : record.status === 'cancelled' ? 'textSecondary' : 'toneAmberFg'
              }
              backgroundColor={
                signed
                  ? 'successMuted'
                  : record.status === 'cancelled'
                    ? 'backgroundElement'
                    : 'toneAmberBg'
              }
            />
          </View>
          <Row label="Provider" first>
            <Value text={record.therapist} />
            {record.assistant ? <Secondary text={`Assistant: ${record.assistant}`} /> : null}
          </Row>
          <Row label={record.kind === 'carePlan' ? 'Plan' : 'Date'}>
            <Value
              text={
                record.kind === 'carePlan'
                  ? `${record.planStart} – ${record.planEnd}`
                  : [record.date, record.time].filter(Boolean).join(' · ')
              }
            />
            <Secondary
              text={
                signed
                  ? `${statusLine(record).replace('Active · ', '')} · ${record.therapist}`
                  : statusLine(record)
              }
            />
          </Row>
        </View>
      </PatientCardShell>

      {record.kind === 'daily' || record.kind === 'progress' || record.kind === 'discharge' ? (
        <>
          <SectionLabel title="Visit" style={styles.sectionGap} />
          <ReadOnlyCard title="Details" rows={recordDetails(record)} />
        </>
      ) : null}

      {content.map((section) => (
        <View key={section.title} style={styles.section}>
          <SectionLabel title={section.title} style={styles.sectionGap} />
          {section.cards.map((card, index) => (
            <ReadOnlyCard key={`${card.title}-${index}`} title={card.title} rows={card.rows} />
          ))}
        </View>
      ))}

      <SectionLabel title="Signatures" style={styles.sectionGap} />
      <PatientCardShell>
        <View style={styles.card}>
          <Row label="Therapist" first>
            <Value text={record.therapist} />
            <Secondary text={signatureLine(record)} />
          </Row>
        </View>
      </PatientCardShell>
    </ScrollView>
  );
}

function ReadOnlyCard({ title, rows }: { title: string; rows: readonly ReadOnlyRow[] }) {
  return (
    <PatientCardShell>
      <View style={styles.card}>
        <ThemedText style={styles.cardTitle}>{title}</ThemedText>
        {rows.map((row, index) => (
          <Row key={`${row.label}-${index}`} label={row.label} first={index === 0}>
            <Value text={row.value} />
          </Row>
        ))}
      </View>
    </PatientCardShell>
  );
}

function Row({
  label,
  first = false,
  children,
}: {
  label: string;
  first?: boolean;
  children: ReactNode;
}) {
  const theme = useTheme();

  return (
    <View style={[styles.row, !first && [styles.divider, { borderTopColor: theme.border }]]}>
      <ThemedText themeColor="textSecondary" style={styles.label}>
        {label}
      </ThemedText>
      <View style={styles.value}>{children}</View>
    </View>
  );
}

function Value({ text }: { text?: string }) {
  return text ? (
    <ThemedText style={styles.valueText}>{text}</ThemedText>
  ) : (
    <ThemedText themeColor="textSecondary" style={[styles.valueText, styles.missingValue]}>
      Not documented
    </ThemedText>
  );
}

function Secondary({ text }: { text: string }) {
  return (
    <ThemedText themeColor="textSecondary" style={styles.valueText}>
      {text}
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
  },
  section: {
    gap: Spacing.three,
  },
  sectionGap: {
    marginTop: Spacing.three,
  },
  card: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
    paddingBottom: Spacing.two,
  },
  summaryTitle: {
    flex: 1,
    fontSize: 22,
    lineHeight: 30,
    fontWeight: 700,
  },
  cardTitle: {
    fontSize: 19,
    lineHeight: 26,
    fontWeight: 600,
    paddingBottom: Spacing.one,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
  },
  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  label: {
    width: LABEL_WIDTH,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: 400,
  },
  value: {
    flex: 1,
    gap: Spacing.half,
  },
  valueText: {
    fontSize: 17,
    lineHeight: 26,
    fontWeight: 400,
  },
  missingValue: {
    fontStyle: 'italic',
  },
  missing: {
    textAlign: 'center',
    paddingVertical: Spacing.five,
  },
});
