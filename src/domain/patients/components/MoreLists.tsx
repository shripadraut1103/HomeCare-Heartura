import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Spacing } from '@/constants/Theme';
import { EmptyRow, StatusPill } from '@/domain/patients/components/ChartListParts';
import { ExpandableRow, ROW_ACCENTS } from '@/domain/patients/components/ExpandableRow';
import { PatientCardShell } from '@/domain/patients/components/PatientCardShell';
import type { ChartNote, InsurancePlan } from '@/domain/patients/interfaces/PatientInterfaces';
import { insuranceRows, sortByCoverage } from '@/domain/patients/patientInsurance';
import { useExpandedSet } from '@/hooks/useExpandedSet';

const PREVIEW_LINES = 2;
const LABEL_WIDTH = 124;

const CRITICAL = { label: 'Critical', color: 'toneRedFg', background: 'toneRedBg' } as const;

export function ChartNoteList({ notes }: { notes: readonly ChartNote[] }) {
  const { expanded, toggle } = useExpandedSet();

  return (
    <PatientCardShell>
      {notes.length === 0 ? (
        <EmptyRow text="No notes yet." />
      ) : (
        notes.map((note, index) => (
          <ExpandableRow
            key={note.id}
            isFirst={index === 0}
            accent={ROW_ACCENTS[index % ROW_ACCENTS.length]}
            title={note.text}
            titleLines={PREVIEW_LINES}
            titleStyle={styles.noteText}
            subtitle={`${note.author} · ${note.date}`}
            expanded={expanded.has(note.id)}
            onToggle={() => toggle(note.id)}
            trailing={note.critical ? <StatusPill pill={CRITICAL} /> : undefined}
          />
        ))
      )}
    </PatientCardShell>
  );
}

export function InsuranceList({ plans }: { plans: readonly InsurancePlan[] }) {
  if (plans.length === 0) {
    return (
      <PatientCardShell>
        <EmptyRow text="No insurance on file." />
      </PatientCardShell>
    );
  }

  return (
    <View style={styles.plans}>
      {sortByCoverage(plans).map((plan) => (
        <View key={plan.id} style={styles.plan}>
          <SectionHeader title={plan.name} />
          <View style={styles.rows}>
            {insuranceRows(plan).map(([label, value]) => (
              <View key={label} style={styles.row}>
                <ThemedText themeColor="textSecondary" style={styles.label}>
                  {label}
                </ThemedText>
                <ThemedText style={styles.value}>{value}</ThemedText>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  noteText: {
    fontSize: 18,
    lineHeight: 25,
    fontWeight: 400,
  },
  plans: {
    gap: Spacing.five,
    paddingTop: Spacing.three,
  },
  plan: {
    gap: Spacing.three,
  },
  rows: {
    gap: Spacing.four - Spacing.one,
    paddingTop: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.three,
  },
  label: {
    width: LABEL_WIDTH,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: 400,
  },
  value: {
    flex: 1,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: 400,
  },
});
