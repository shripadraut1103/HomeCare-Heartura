import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { Button } from '@/components/ui/Button';
import { DateTimeField } from '@/components/ui/DateTimeField';
import { Select } from '@/components/ui/Select';
import { TextField } from '@/components/ui/TextField';
import { Radius, Spacing } from '@/constants/Theme';
import { ALLERGY_KINDS, optionsOf, SEVERITY } from '@/domain/patients/clinicalStyles';
import { useChartActions } from '@/domain/patients/hooks/useChartActions';
import type { AllergySeverity } from '@/domain/patients/interfaces/PatientInterfaces';
import { ModalFormLayout } from '@/domain/profile/components/ModalFormLayout';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import { setToastMessage } from '@/store/common-reducer/ToastReducer';
import { useAppDispatch } from '@/store/hooks';
import { toIsoDate } from '@/utils/dateFormat';
import { haptics } from '@/utils/haptics';

type AllergyKind = (typeof ALLERGY_KINDS)[number]['value'];

const SEVERITY_OPTIONS = optionsOf(SEVERITY);

export default function AddAllergyScreen() {
  const dispatch = useAppDispatch();
  const { patientId } = useLocalSearchParams<{ patientId: string }>();
  const actions = useChartActions(patientId);
  const [name, setName] = useState('');
  const [kind, setKind] = useState<AllergyKind>('medication');
  const [reaction, setReaction] = useState('');
  const [severity, setSeverity] = useState<AllergySeverity>('moderate');
  const [onset, setOnset] = useState<Date | null>(() => new Date());
  const [saving, setSaving] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const isDirty = [name, reaction].some((value) => value.trim() !== '');
  const { leave } = useUnsavedChangesGuard(isDirty, 'This allergy hasn’t been saved.');

  const save = async () => {
    if (!name.trim()) {
      setShowErrors(true);
      haptics.error();
      return;
    }
    setSaving(true);
    const saved = await actions.addAllergy({
      substance: name.trim(),
      kind,
      reaction: reaction.trim(),
      severity,
      onset: onset ? toIsoDate(onset) : null,
      status: 'active',
    });
    setSaving(false);
    if (!saved) return;
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
        label="Allergen"
        required
        value={name}
        onChangeText={setName}
        error={showErrors && !name.trim() ? 'Required' : undefined}
        autoCapitalize="sentences"
      />
      <Select label="Type" options={ALLERGY_KINDS} value={kind} onChange={setKind} />
      <TextField
        label="Reaction"
        value={reaction}
        onChangeText={setReaction}
        multiline
        textAlignVertical="top"
        style={styles.multiline}
      />
      <Select label="Severity" options={SEVERITY_OPTIONS} value={severity} onChange={setSeverity} />
      <DateTimeField
        label="Onset"
        mode="date"
        value={onset}
        onChange={setOnset}
        onClear={() => setOnset(null)}
      />
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
