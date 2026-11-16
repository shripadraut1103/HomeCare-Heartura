import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/Theme';
import {
  ALLERGY_STATUS,
  DIAGNOSIS_STATUS,
  DIAGNOSIS_TYPE,
  SEVERITY,
} from '@/domain/patients/clinicalStyles';
import { EMPTY_VALUE, EmptyRow, StatusPill } from '@/domain/patients/components/ChartListParts';
import { DetailGrid, ExpandableRow, ROW_ACCENTS } from '@/domain/patients/components/ExpandableRow';
import { PatientCardShell } from '@/domain/patients/components/PatientCardShell';
import type { Allergy, Diagnosis } from '@/domain/patients/interfaces/PatientInterfaces';
import { useExpandedSet } from '@/hooks/useExpandedSet';

export function DiagnosisList({ diagnoses }: { diagnoses: readonly Diagnosis[] }) {
  const { expanded, toggle } = useExpandedSet();

  return (
    <PatientCardShell>
      {diagnoses.length === 0 ? (
        <EmptyRow text="No diagnosis on file." />
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
  const { expanded, toggle } = useExpandedSet();

  return (
    <PatientCardShell>
      {allergies.length === 0 ? (
        <EmptyRow text="No known allergies." />
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
});
