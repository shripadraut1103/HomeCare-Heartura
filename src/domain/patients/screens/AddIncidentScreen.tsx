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
import { useIncidentActions } from '@/domain/patients/hooks/useIncidents';
import type {
  ApiIncidentLocation,
  ApiIncidentType,
  ApiInjurySide,
} from '@/domain/patients/interfaces/PatientApi';
import { ModalFormLayout } from '@/domain/profile/components/ModalFormLayout';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import { setToastMessage } from '@/store/common-reducer/ToastReducer';
import { useAppDispatch } from '@/store/hooks';
import { haptics } from '@/utils/haptics';

export default function AddIncidentScreen() {
  const dispatch = useAppDispatch();
  const { patientId } = useLocalSearchParams<{ patientId: string }>();
  const incidents = useIncidentActions(patientId);
  const [occurredAt, setOccurredAt] = useState(() => new Date());
  const [type, setType] = useState<ApiIncidentType>('fall');
  const [location, setLocation] = useState<ApiIncidentLocation>('');
  const [injury, setInjury] = useState<ApiInjurySide>('none');
  const [saving, setSaving] = useState(false);
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

  const report = async () => {
    if (!description.trim()) {
      setShowErrors(true);
      haptics.error();
      return;
    }
    setSaving(true);
    const saved = await incidents.report(occurredAt, {
      type,
      location,
      injury_side: injury,
      witnessed_by: witnessedBy.trim(),
      what_happened: description.trim(),
      action_taken: actionTaken.trim(),
      notify_back_office: notifyOffice,
    });
    setSaving(false);
    if (!saved) return;
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
            disabled={saving}
            onPress={() => router.back()}
          />
          <Button title="Report incident" style={styles.save} loading={saving} onPress={report} />
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
      <Select label="Type" required options={INCIDENT_TYPES} value={type} onChange={setType} />
      <Select
        label="Location"
        options={INCIDENT_LOCATIONS}
        value={location}
        onChange={setLocation}
      />
      <Select
        label="Injury side (body diagram)"
        options={INJURY_SIDES}
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
