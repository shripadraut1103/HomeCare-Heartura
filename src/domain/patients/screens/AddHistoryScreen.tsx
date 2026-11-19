import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { ChipGroup } from '@/components/ui/ChipGroup';
import { DateTimeField } from '@/components/ui/DateTimeField';
import { TextField } from '@/components/ui/TextField';
import { Radius, Spacing } from '@/constants/Theme';
import type {
  ConditionStatus,
  HistoryCategory,
} from '@/domain/patients/interfaces/PatientInterfaces';
import { useChartActions } from '@/domain/patients/hooks/useChartActions';
import { HISTORY_CATEGORIES, HISTORY_LABELS } from '@/domain/patients/patientHistory';
import { ModalFormLayout } from '@/domain/profile/components/ModalFormLayout';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import { setToastMessage } from '@/store/common-reducer/ToastReducer';
import { useAppDispatch } from '@/store/hooks';
import { toIsoDate } from '@/utils/dateFormat';
import { haptics } from '@/utils/haptics';

const TITLE_LABEL: Record<HistoryCategory, string> = {
  surgical: 'Procedure',
  medical: 'Condition',
  family: 'Condition',
  social: 'Factor',
};

const STATUSES: Record<string, ConditionStatus> = { Active: 'active', Resolved: 'resolved' };

const isCategory = (value: string | undefined): value is HistoryCategory =>
  HISTORY_CATEGORIES.some((category) => category === value);

export default function AddHistoryScreen() {
  const dispatch = useAppDispatch();
  const params = useLocalSearchParams<{ patientId: string; category?: string }>();
  const category = isCategory(params.category) ? params.category : 'surgical';
  const actions = useChartActions(params.patientId);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const isSocial = category === 'social';
  const [date, setDate] = useState<Date | null>(() => (isSocial ? new Date() : null));
  const [facility, setFacility] = useState('');
  const [status, setStatus] = useState<ConditionStatus>('active');
  const [relative, setRelative] = useState('');
  const [onsetAge, setOnsetAge] = useState('');
  const [detail, setDetail] = useState('');
  const [note, setNote] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const label = HISTORY_LABELS[category].toLowerCase();
  const isDirty =
    [title, facility, relative, onsetAge, detail, note].some(Boolean) ||
    (!isSocial && date !== null);
  const { leave } = useUnsavedChangesGuard(isDirty, `This ${label} history hasn’t been saved.`);

  const save = async () => {
    if (!title.trim()) {
      setShowErrors(true);
      haptics.error();
      return;
    }
    const age = Number.parseInt(onsetAge, 10);
    setSaving(true);
    const saved = await actions.addHistory({
      kind: category,
      name: title.trim(),
      date: isSocial
        ? toIsoDate(date ?? new Date())
        : date && (category === 'surgical' || category === 'medical')
          ? toIsoDate(date)
          : null,
      facility: category === 'surgical' ? facility.trim() : '',
      status: category === 'medical' ? status : '',
      relative: category === 'family' ? relative.trim() : '',
      onset_age: category === 'family' && Number.isFinite(age) ? age : null,
      detail: category === 'social' ? detail.trim() : '',
      note: note.trim(),
    });
    setSaving(false);
    if (!saved) return;
    dispatch(setToastMessage({ message: `${HISTORY_LABELS[category]} history added` }));
    leave();
  };

  return (
    <ModalFormLayout
      title={`Add ${label} history`}
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
        label={TITLE_LABEL[category]}
        required
        value={title}
        onChangeText={setTitle}
        error={showErrors && !title.trim() ? 'Required' : undefined}
        autoCapitalize="sentences"
      />

      {category === 'surgical' || category === 'medical' ? (
        <DateTimeField
          label={category === 'surgical' ? 'Date' : 'Diagnosed'}
          mode="date"
          value={date}
          onChange={setDate}
          onClear={() => setDate(null)}
        />
      ) : null}

      {category === 'surgical' ? (
        <TextField label="Facility" value={facility} onChangeText={setFacility} />
      ) : null}

      {category === 'medical' ? (
        <View style={styles.field}>
          <ThemedText themeColor="textSecondary" style={styles.label}>
            Status
          </ThemedText>
          <ChipGroup
            single
            options={Object.keys(STATUSES)}
            selected={[status === 'active' ? 'Active' : 'Resolved']}
            onToggle={(option) => setStatus(STATUSES[option])}
          />
        </View>
      ) : null}

      {category === 'family' ? (
        <View style={styles.pair}>
          <View style={styles.flex}>
            <TextField
              label="Relative"
              value={relative}
              onChangeText={setRelative}
              placeholder="e.g. Mother"
            />
          </View>
          <View style={styles.flex}>
            <TextField
              label="Onset age"
              value={onsetAge}
              onChangeText={setOnsetAge}
              keyboardType="number-pad"
            />
          </View>
        </View>
      ) : null}

      {isSocial ? (
        <DateTimeField label="Date" required mode="date" value={date} onChange={setDate} />
      ) : null}

      {category === 'social' ? (
        <TextField
          label="Detail"
          value={detail}
          onChangeText={setDetail}
          multiline
          textAlignVertical="top"
          style={styles.multiline}
        />
      ) : null}

      <TextField
        label="Note"
        value={note}
        onChangeText={setNote}
        multiline
        textAlignVertical="top"
        style={styles.multiline}
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
  field: {
    gap: Spacing.two,
  },
  label: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: 500,
  },
  pair: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  flex: {
    flex: 1,
  },
  multiline: {
    minHeight: 120,
    paddingTop: Spacing.three - Spacing.one,
    borderRadius: Radius.medium,
  },
});
