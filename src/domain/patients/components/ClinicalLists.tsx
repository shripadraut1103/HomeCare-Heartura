import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Pill } from '@/components/ui/Pill';
import { Spacing } from '@/constants/Theme';
import {
  ALLERGY_STATUS,
  DIAGNOSIS_STATUS,
  DIAGNOSIS_TYPE,
  SEVERITY,
  type ClinicalPill,
} from '@/domain/patients/clinicalStyles';
import { DetailGrid, ExpandableRow, ROW_ACCENTS } from '@/domain/patients/components/ExpandableRow';
import { PatientCardShell } from '@/domain/patients/components/PatientCardShell';
import type { Allergy, Diagnosis } from '@/domain/patients/interfaces/PatientInterfaces';

const EMPTY_VALUE = '—';

function useExpanded() {
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(() => new Set());
  const toggle = (id: string) =>
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  return { expanded, toggle };
}

function StatusPill({ pill }: { pill: ClinicalPill }) {
  return <Pill label={pill.label} dot color={pill.color} backgroundColor={pill.background} />;
}

function Empty({ text }: { text: string }) {
  return (
    <ThemedText themeColor="textSecondary" style={styles.empty}>
      {text}
    </ThemedText>
  );
}

export function DiagnosisList({ diagnoses }: { diagnoses: readonly Diagnosis[] }) {
  const { expanded, toggle } = useExpanded();

  return (
    <PatientCardShell>
      {diagnoses.length === 0 ? (
        <Empty text="No diagnosis on file." />
      ) : (
        diagnoses.map((diagnosis, index) => (
          <ExpandableRow
            key={diagnosis.id}
            isFirst={index === 0}
            accent={ROW_ACCENTS[index % ROW_ACCENTS.length]}
            title={diagnosis.description}
            subtitle={`${diagnosis.code} · ${DIAGNOSIS_TYPE[diagnosis.type]}`}
            expanded={expanded.has(diagnosis.id)}
            onToggle={() => toggle(diagnosis.id)}
            trailing={<StatusPill pill={DIAGNOSIS_STATUS[diagnosis.status]} />}>
            <DetailGrid
              items={[
                { label: 'ICD-10', value: diagnosis.code || EMPTY_VALUE },
                { label: 'Type', value: DIAGNOSIS_TYPE[diagnosis.type] },
                { label: 'Onset', value: diagnosis.onset ?? EMPTY_VALUE },
                { label: 'Noted by', value: diagnosis.notedBy ?? EMPTY_VALUE },
              ]}
            />
          </ExpandableRow>
        ))
      )}
    </PatientCardShell>
  );
}

export function AllergyList({ allergies }: { allergies: readonly Allergy[] }) {
  const { expanded, toggle } = useExpanded();

  return (
    <PatientCardShell>
      {allergies.length === 0 ? (
        <Empty text="No known allergies." />
      ) : (
        allergies.map((allergy, index) => (
          <ExpandableRow
            key={allergy.id}
            isFirst={index === 0}
            accent={ROW_ACCENTS[index % ROW_ACCENTS.length]}
            title={allergy.name}
            subtitle={[allergy.kind, allergy.reaction].filter(Boolean).join(' · ')}
            expanded={expanded.has(allergy.id)}
            onToggle={() => toggle(allergy.id)}
            trailing={
              <View style={styles.pills}>
                <StatusPill pill={SEVERITY[allergy.severity]} />
                <StatusPill pill={ALLERGY_STATUS[allergy.status]} />
              </View>
            }>
            <DetailGrid
              items={[
                { label: 'Type', value: allergy.kind },
                { label: 'Reaction', value: allergy.reaction || EMPTY_VALUE },
                { label: 'Onset', value: allergy.onset ?? EMPTY_VALUE },
                { label: 'Recorded by', value: allergy.recordedBy ?? EMPTY_VALUE },
              ]}
            />
          </ExpandableRow>
        ))
      )}
    </PatientCardShell>
  );
}

const styles = StyleSheet.create({
  pills: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  empty: {
    textAlign: 'center',
    paddingVertical: Spacing.four,
  },
});
