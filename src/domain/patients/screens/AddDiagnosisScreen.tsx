import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { Button } from '@/components/ui/Button';
import { DateTimeField } from '@/components/ui/DateTimeField';
import { Select } from '@/components/ui/Select';
import { TextField } from '@/components/ui/TextField';
import {
  DIAGNOSIS_TYPE,
  NEW_DIAGNOSIS_STATUSES,
  optionsOf,
} from '@/domain/patients/clinicalStyles';
import { useChartActions } from '@/domain/patients/hooks/useChartActions';
import type { DiagnosisType } from '@/domain/patients/interfaces/PatientInterfaces';
import { ModalFormLayout } from '@/domain/profile/components/ModalFormLayout';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import { setToastMessage } from '@/store/common-reducer/ToastReducer';
import { useAppDispatch } from '@/store/hooks';
import { toIsoDate } from '@/utils/dateFormat';
import { haptics } from '@/utils/haptics';

type NewDiagnosisStatus = (typeof NEW_DIAGNOSIS_STATUSES)[number]['value'];

const TYPE_OPTIONS = optionsOf(DIAGNOSIS_TYPE);

export default function AddDiagnosisScreen() {
  const dispatch = useAppDispatch();
  const { patientId } = useLocalSearchParams<{ patientId: string }>();
  const actions = useChartActions(patientId);
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<DiagnosisType>('chronic');
  const [onset, setOnset] = useState<Date | null>(() => new Date());
  const [status, setStatus] = useState<NewDiagnosisStatus>('active');
  const [saving, setSaving] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const isDirty = [description, code].some((value) => value.trim() !== '');
  const { leave } = useUnsavedChangesGuard(isDirty, 'This diagnosis hasn’t been saved.');

  const save = async () => {
    if (!description.trim()) {
      setShowErrors(true);
      haptics.error();
      return;
    }
    setSaving(true);
    const saved = await actions.addDiagnosis({
      name: description.trim(),
      icd10: code.trim().toUpperCase(),
      type,
      status,
      onset: onset ? toIsoDate(onset) : null,
    });
    setSaving(false);
    if (!saved) return;
    dispatch(setToastMessage({ message: 'Diagnosis added' }));
    leave();
  };

  return (
    <ModalFormLayout
      title="Add diagnosis"
      footer={
        <>
          <Button
            title="Cancel"
            variant="secondary"
            style={styles.cancel}
            onPress={() => router.back()}
          />
          <Button
            title="Save"
            style={styles.save}
            loading={saving}
            disabled={saving}
            onPress={() => void save()}
          />
        </>
      }>
      <TextField
        label="Diagnosis"
        required
        value={description}
        onChangeText={setDescription}
        error={showErrors && !description.trim() ? 'Required' : undefined}
        autoCapitalize="sentences"
      />
      <TextField
        label="ICD-10"
        value={code}
        onChangeText={setCode}
        autoCapitalize="characters"
        autoCorrect={false}
      />
      <Select label="Type" options={TYPE_OPTIONS} value={type} onChange={setType} />
      <DateTimeField
        label="Onset"
        mode="date"
        value={onset}
        onChange={setOnset}
        onClear={() => setOnset(null)}
      />
      <Select label="Status" options={NEW_DIAGNOSIS_STATUSES} value={status} onChange={setStatus} />
    </ModalFormLayout>
  );
}

const styles = StyleSheet.create({
  cancel: {
    flex: 1,
  },
  save: {
    flex: 2,
  },
});
