import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { TextField } from '@/components/ui/TextField';
import { Radius, Spacing } from '@/constants/Theme';
import { addChartNote } from '@/domain/patients/store/PatientsReducer';
import { ModalFormLayout } from '@/domain/profile/components/ModalFormLayout';
import { useProfile } from '@/domain/profile/hooks/useProfile';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import { setToastMessage } from '@/store/common-reducer/ToastReducer';
import { useAppDispatch } from '@/store/hooks';
import { formatNumericDate } from '@/utils/dateFormat';
import { haptics } from '@/utils/haptics';

export default function AddNoteScreen() {
  const dispatch = useAppDispatch();
  const { patientId } = useLocalSearchParams<{ patientId: string }>();
  const profile = useProfile();
  const [text, setText] = useState('');
  const [critical, setCritical] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const { leave } = useUnsavedChangesGuard(text.trim() !== '', 'This note hasn’t been saved.');

  const save = () => {
    if (!text.trim()) {
      setShowErrors(true);
      haptics.error();
      return;
    }
    // TODO: save to the patient chart API once it exists.
    dispatch(
      addChartNote({
        patientId,
        note: {
          text: text.trim(),
          author: profile.name,
          date: formatNumericDate(new Date()),
          critical: critical || undefined,
        },
      })
    );
    haptics.success();
    dispatch(setToastMessage({ message: 'Note added' }));
    leave();
  };

  return (
    <ModalFormLayout
      title="Add note"
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
        label="Note"
        required
        value={text}
        onChangeText={setText}
        error={showErrors && !text.trim() ? 'Required' : undefined}
        placeholder="Write a note about the patient"
        autoCapitalize="sentences"
        multiline
        textAlignVertical="top"
        style={styles.multiline}
      />
      <Checkbox label="Critical" checked={critical} onChange={setCritical} />
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
