import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { Button } from '@/components/ui/Button';
import { DateTimeField } from '@/components/ui/DateTimeField';
import { Select } from '@/components/ui/Select';
import { TextField } from '@/components/ui/TextField';
import { Radius, Spacing } from '@/constants/Theme';
import {
  ALLERGY_STATUS,
  ALLERGY_TYPES,
  optionsOf,
  SEVERITY,
} from '@/domain/patients/clinicalStyles';
import type {
  AllergySeverity,
  AllergyStatus,
} from '@/domain/patients/interfaces/PatientInterfaces';
import { addAllergy } from '@/domain/patients/store/PatientsReducer';
import { ModalFormLayout } from '@/domain/profile/components/ModalFormLayout';
import { useProfile } from '@/domain/profile/hooks/useProfile';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import { setToastMessage } from '@/store/common-reducer/ToastReducer';
import { useAppDispatch } from '@/store/hooks';
import { formatNumericDate } from '@/utils/dateFormat';
import { haptics } from '@/utils/haptics';

type AllergyType = (typeof ALLERGY_TYPES)[number];

const TYPE_OPTIONS = ALLERGY_TYPES.map((value) => ({ value, label: value }));
const SEVERITY_OPTIONS = optionsOf(SEVERITY);
const STATUS_OPTIONS = optionsOf(ALLERGY_STATUS);

export default function AddAllergyScreen() {
  const dispatch = useAppDispatch();
  const { patientId } = useLocalSearchParams<{ patientId: string }>();
  const profile = useProfile();
  const [name, setName] = useState('');
  const [kind, setKind] = useState<AllergyType>('Medication');
  const [reaction, setReaction] = useState('');
  const [severity, setSeverity] = useState<AllergySeverity>('moderate');
  const [onset, setOnset] = useState(() => new Date());
  const [status, setStatus] = useState<AllergyStatus>('active');
  const [recordedBy, setRecordedBy] = useState(profile.name);
  const [showErrors, setShowErrors] = useState(false);
  const isDirty = [name, reaction].some((value) => value.trim() !== '');
  const { leave } = useUnsavedChangesGuard(isDirty, 'This allergy hasn’t been saved.');

  const save = () => {
    if (!name.trim()) {
      setShowErrors(true);
      haptics.error();
      return;
    }
    // TODO: save to the patient chart API once it exists.
    dispatch(
      addAllergy({
        patientId,
        allergy: {
          name: name.trim(),
          kind,
          reaction: reaction.trim(),
          severity,
          status,
          onset: formatNumericDate(onset),
          recordedBy: recordedBy.trim() || undefined,
        },
      })
    );
    haptics.success();
    dispatch(setToastMessage({ message: 'Allergy added' }));
    leave();
  };

  return (
    <ModalFormLayout
      title="Add allergy"
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
        label="Allergen"
        required
        value={name}
        onChangeText={setName}
        error={showErrors && !name.trim() ? 'Required' : undefined}
        autoCapitalize="sentences"
      />
      <Select label="Type" options={TYPE_OPTIONS} value={kind} onChange={setKind} />
      <TextField
        label="Reaction"
        value={reaction}
        onChangeText={setReaction}
        multiline
        textAlignVertical="top"
        style={styles.multiline}
      />
      <Select label="Severity" options={SEVERITY_OPTIONS} value={severity} onChange={setSeverity} />
      <DateTimeField label="Onset" mode="date" value={onset} onChange={setOnset} />
      <Select label="Status" options={STATUS_OPTIONS} value={status} onChange={setStatus} />
      <TextField label="Recorded by" value={recordedBy} onChangeText={setRecordedBy} />
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
  multiline: {
    minHeight: 120,
    paddingTop: Spacing.three - Spacing.one,
    borderRadius: Radius.medium,
  },
});
