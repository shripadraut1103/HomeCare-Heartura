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
import {
  HISTORY_CATEGORIES,
  HISTORY_LABELS,
  socialSummary,
} from '@/domain/patients/patientHistory';
import { addHistoryEntry } from '@/domain/patients/store/PatientsReducer';
import { ModalFormLayout } from '@/domain/profile/components/ModalFormLayout';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import { setToastMessage } from '@/store/common-reducer/ToastReducer';
import { useAppDispatch } from '@/store/hooks';
import { formatNumericDate } from '@/utils/dateFormat';
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
  const [title, setTitle] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [facility, setFacility] = useState('');
  const [status, setStatus] = useState<ConditionStatus>('active');
  const [relative, setRelative] = useState('');
  const [onsetAge, setOnsetAge] = useState('');
  const [detail, setDetail] = useState('');
  const [note, setNote] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const label = HISTORY_LABELS[category].toLowerCase();
  const isDirty =
    [title, facility, relative, onsetAge, detail, note].some(Boolean) || date !== null;
  const { leave } = useUnsavedChangesGuard(isDirty, `This ${label} history hasn’t been saved.`);

  const save = () => {
    if (!title.trim()) {
      setShowErrors(true);
      haptics.error();
      return;
    }
    const clean = (value: string) => value.trim() || undefined;
    // TODO: save to the patient history API once it exists.
    dispatch(
      addHistoryEntry({
        patientId: params.patientId,
        entry: {
          category,
          title: title.trim(),
          date: date ? formatNumericDate(date) : undefined,
          facility: category === 'surgical' ? clean(facility) : undefined,
          status: category === 'medical' ? status : undefined,
          relative: category === 'family' ? clean(relative) : undefined,
          onsetAge: category === 'family' ? clean(onsetAge) : undefined,
          detail: category === 'social' ? clean(detail) : undefined,
          summary: category === 'social' ? socialSummary(detail.trim()) : undefined,
          note: clean(note),
        },
      })
    );
    haptics.success();
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
          <Button title="Save" style={styles.save} onPress={save} />
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
