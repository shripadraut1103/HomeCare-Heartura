import { nanoid } from '@reduxjs/toolkit';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { DateTimeField } from '@/components/ui/DateTimeField';
import { Select } from '@/components/ui/Select';
import { TextField } from '@/components/ui/TextField';
import { Radius, Spacing } from '@/constants/Theme';
import { INCIDENT_LOCATIONS, INCIDENT_TYPES, INJURY_SIDES } from '@/domain/patients/clinicalStyles';
import { addPatientIncident } from '@/domain/patients/store/PatientsReducer';
import { ModalFormLayout } from '@/domain/profile/components/ModalFormLayout';
import { useProfile } from '@/domain/profile/hooks/useProfile';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import { setToastMessage } from '@/store/common-reducer/ToastReducer';
import { useAppDispatch } from '@/store/hooks';
import { haptics } from '@/utils/haptics';

const toOptions = <T extends string>(values: readonly T[]) =>
  values.map((value) => ({ value, label: value }));

const TYPE_OPTIONS = toOptions(INCIDENT_TYPES);
const LOCATION_OPTIONS = toOptions(INCIDENT_LOCATIONS);
const INJURY_OPTIONS = toOptions(INJURY_SIDES);

export default function AddIncidentScreen() {
  const dispatch = useAppDispatch();
  const { patientId } = useLocalSearchParams<{ patientId: string }>();
  const profile = useProfile();
  const [occurredAt, setOccurredAt] = useState(() => new Date());
  const [type, setType] = useState<(typeof INCIDENT_TYPES)[number]>('Fall');
  const [location, setLocation] = useState<(typeof INCIDENT_LOCATIONS)[number]>('Group home');
  const [injury, setInjury] = useState<(typeof INJURY_SIDES)[number]>('No injury');
  const [witnessedBy, setWitnessedBy] = useState('');
  const [description, setDescription] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [notifyOffice, setNotifyOffice] = useState(true);
  const [showErrors, setShowErrors] = useState(false);
  const isDirty = [witnessedBy, description, actionTaken].some((value) => value.trim() !== '');
  const { leave } = useUnsavedChangesGuard(isDirty, 'This incident hasn’t been reported.');

  const setDay = (day: Date) =>
    setOccurredAt(
      (current) =>
        new Date(
          day.getFullYear(),
          day.getMonth(),
          day.getDate(),
          current.getHours(),
          current.getMinutes()
        )
    );

  const report = () => {
    if (!description.trim()) {
      setShowErrors(true);
      haptics.error();
      return;
    }
    // TODO: send to the incidents API (and notify the back office) once it exists.
    dispatch(
      addPatientIncident({
        patientId,
        incident: {
          id: nanoid(),
          occurredAt: occurredAt.toISOString(),
          description: description.trim(),
          reportedBy: profile.name,
          type,
          location,
          injury,
          witnessedBy: witnessedBy.trim() || undefined,
          actionTaken: actionTaken.trim() || undefined,
          notifyOffice,
        },
      })
    );
    haptics.success();
    dispatch(setToastMessage({ message: 'Incident reported' }));
    leave();
  };

  return (
    <ModalFormLayout
      title="Add incident"
      footer={
        <>
          <Button
            title="Cancel"
            variant="secondary"
            style={styles.cancel}
            onPress={() => router.back()}
          />
          <Button title="Report incident" style={styles.save} onPress={report} />
        </>
      }>
      <DateTimeField
        label="Date of incident"
        required
        mode="date"
        value={occurredAt}
        onChange={setDay}
      />
      <DateTimeField label="Time" mode="time" value={occurredAt} onChange={setOccurredAt} />
      <Select label="Type" required options={TYPE_OPTIONS} value={type} onChange={setType} />
      <Select label="Location" options={LOCATION_OPTIONS} value={location} onChange={setLocation} />
      <Select
        label="Injury side (body diagram)"
        options={INJURY_OPTIONS}
        value={injury}
        onChange={setInjury}
      />
      <TextField
        label="Witnessed by"
        value={witnessedBy}
        onChangeText={setWitnessedBy}
        placeholder="Name and role"
      />
      <TextField
        label="What happened"
        required
        value={description}
        onChangeText={setDescription}
        error={showErrors && !description.trim() ? 'Required' : undefined}
        placeholder="Describe the incident"
        multiline
        textAlignVertical="top"
        style={styles.multiline}
      />
      <TextField
        label="Action taken"
        value={actionTaken}
        onChangeText={setActionTaken}
        placeholder="First aid, who was called…"
        multiline
        textAlignVertical="top"
        style={styles.multiline}
      />
      <Checkbox
        label="Notify the back office and compliance"
        checked={notifyOffice}
        onChange={setNotifyOffice}
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
