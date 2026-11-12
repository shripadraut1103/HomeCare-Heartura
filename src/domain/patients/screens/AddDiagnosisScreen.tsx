import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { Button } from '@/components/ui/Button';
import { DateTimeField } from '@/components/ui/DateTimeField';
import { Select } from '@/components/ui/Select';
import { TextField } from '@/components/ui/TextField';
import { DIAGNOSIS_STATUS, DIAGNOSIS_TYPE, optionsOf } from '@/domain/patients/clinicalStyles';
import type {
  DiagnosisStatus,
  DiagnosisType,
} from '@/domain/patients/interfaces/PatientInterfaces';
import { addDiagnosis } from '@/domain/patients/store/PatientsReducer';
import { ModalFormLayout } from '@/domain/profile/components/ModalFormLayout';
import { useProfile } from '@/domain/profile/hooks/useProfile';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import { setToastMessage } from '@/store/common-reducer/ToastReducer';
import { useAppDispatch } from '@/store/hooks';
import { formatNumericDate } from '@/utils/dateFormat';
import { haptics } from '@/utils/haptics';

const TYPE_OPTIONS = optionsOf(DIAGNOSIS_TYPE);
const STATUS_OPTIONS = optionsOf(DIAGNOSIS_STATUS);

export default function AddDiagnosisScreen() {
  const dispatch = useAppDispatch();
  const { patientId } = useLocalSearchParams<{ patientId: string }>();
  const profile = useProfile();
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<DiagnosisType>('chronic');
  const [onset, setOnset] = useState(() => new Date());
  const [status, setStatus] = useState<DiagnosisStatus>('active');
  const [notedBy, setNotedBy] = useState(profile.name);
  const [showErrors, setShowErrors] = useState(false);
  const isDirty = [description, code].some((value) => value.trim() !== '');
  const { leave } = useUnsavedChangesGuard(isDirty, 'This diagnosis hasn’t been saved.');

  const save = () => {
    if (!description.trim()) {
      setShowErrors(true);
      haptics.error();
      return;
    }
    // TODO: save to the patient chart API once it exists.
    dispatch(
      addDiagnosis({
        patientId,
        diagnosis: {
          description: description.trim(),
          code: code.trim().toUpperCase(),
          type,
          status,
          onset: formatNumericDate(onset),
          notedBy: notedBy.trim() || undefined,
        },
      })
    );
    haptics.success();
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
          <Button title="Save" style={styles.save} onPress={save} />
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
      <DateTimeField label="Onset" mode="date" value={onset} onChange={setOnset} />
      <Select label="Status" options={STATUS_OPTIONS} value={status} onChange={setStatus} />
      <TextField label="Noted by" value={notedBy} onChangeText={setNotedBy} />
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
