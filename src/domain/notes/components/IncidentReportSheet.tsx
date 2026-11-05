import {
  BottomSheetTextInput,
  BottomSheetView,
  useBottomSheetModal,
  type BottomSheetModal,
} from '@gorhom/bottom-sheet';
import { nanoid } from '@reduxjs/toolkit';
import { useRef, useState, type ComponentRef, type Ref } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppBottomSheet } from '@/components/sheet/AppBottomSheet';
import { SheetHeader } from '@/components/sheet/SheetHeader';
import { Button } from '@/components/ui/Button';
import { DateTimeField } from '@/components/ui/DateTimeField';
import { DICTATION_BUTTON_SIZE, DictationButton } from '@/components/ui/DictationButton';
import { TextField, type TextFieldProps } from '@/components/ui/TextField';
import { Radius, Spacing } from '@/constants/Theme';
import type { IncidentReport } from '@/domain/notes/interfaces/NoteInterfaces';
import { useTheme } from '@/hooks/useTheme';

const SheetTextInput = BottomSheetTextInput as NonNullable<TextFieldProps['InputComponent']>;

type IncidentReportSheetProps = {
  ref: Ref<BottomSheetModal>;
  onSave: (incident: IncidentReport) => void;
};

export function IncidentReportSheet({ ref, onSave }: IncidentReportSheetProps) {
  return (
    <AppBottomSheet
      ref={ref}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize">
      <IncidentContent onSave={onSave} />
    </AppBottomSheet>
  );
}

function IncidentContent({ onSave }: Pick<IncidentReportSheetProps, 'onSave'>) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { dismiss } = useBottomSheetModal();
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);
  const [occurredAt, setOccurredAt] = useState(() => new Date());
  const [description, setDescription] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const described = description.trim().length > 0;

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

  const save = () => {
    if (!described) {
      setShowErrors(true);
      return;
    }
    onSave({ id: nanoid(), occurredAt: occurredAt.toISOString(), description: description.trim() });
    dismiss();
  };

  return (
    <BottomSheetView style={{ paddingBottom: insets.bottom + Spacing.three }}>
      <SheetHeader title="Incident report" onClose={() => dismiss()} />
      <View style={styles.body}>
        <View style={styles.row}>
          <View style={styles.flex}>
            <DateTimeField label="Date" mode="date" value={occurredAt} onChange={setDay} />
          </View>
          <View style={styles.flex}>
            <DateTimeField label="Time" mode="time" value={occurredAt} onChange={setOccurredAt} />
          </View>
        </View>
        <TextField
          ref={inputRef}
          label="What happened"
          required
          value={description}
          onChangeText={setDescription}
          error={showErrors && !described ? 'Describe what happened' : undefined}
          placeholder="What happened, what you did, how the patient is now"
          multiline
          textAlignVertical="top"
          style={styles.input}
          InputComponent={SheetTextInput}
          accessory={
            <DictationButton label="What happened" onPress={() => inputRef.current?.focus()} />
          }
        />
      </View>
      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        <Button title="Cancel" variant="secondary" style={styles.flex} onPress={() => dismiss()} />
        <Button title="Save to the note" style={styles.flex} onPress={save} />
      </View>
    </BottomSheetView>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: Spacing.three,
    padding: Spacing.four,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  flex: {
    flex: 1,
  },
  input: {
    minHeight: 104,
    paddingTop: Spacing.three - Spacing.one,
    paddingBottom: Spacing.three - Spacing.one,
    paddingRight: DICTATION_BUTTON_SIZE + Spacing.three,
    borderRadius: Radius.medium,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
