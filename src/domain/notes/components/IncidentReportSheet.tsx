import {
  BottomSheetTextInput,
  BottomSheetView,
  useBottomSheetModal,
  type BottomSheetModal,
} from '@gorhom/bottom-sheet';
import { useRef, useState, type ComponentRef, type Ref } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppBottomSheet } from '@/components/sheet/AppBottomSheet';
import { SheetHeader } from '@/components/sheet/SheetHeader';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { ChipGroup } from '@/components/ui/ChipGroup';
import { DateTimeField } from '@/components/ui/DateTimeField';
import { DICTATION_BUTTON_SIZE, DictationButton } from '@/components/ui/DictationButton';
import { TextField, type TextFieldProps } from '@/components/ui/TextField';
import { Radius, Spacing } from '@/constants/Theme';
import { INCIDENT_TYPES } from '@/domain/patients/clinicalStyles';
import type { IncidentDraft } from '@/domain/patients/hooks/useIncidents';
import type { ApiIncidentType } from '@/domain/patients/interfaces/PatientApi';
import { useTheme } from '@/hooks/useTheme';

const SheetTextInput = BottomSheetTextInput as NonNullable<TextFieldProps['InputComponent']>;

const TYPE_LABELS = INCIDENT_TYPES.map((type) => type.label);

type IncidentReportSheetProps = {
  ref: Ref<BottomSheetModal>;
  saveLabel?: string;
  onSave: (occurredAt: Date, draft: IncidentDraft) => Promise<boolean>;
};

export function IncidentReportSheet({ ref, saveLabel, onSave }: IncidentReportSheetProps) {
  return (
    <AppBottomSheet
      ref={ref}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize">
      <IncidentContent saveLabel={saveLabel} onSave={onSave} />
    </AppBottomSheet>
  );
}

function IncidentContent({
  saveLabel = 'Save to the note',
  onSave,
}: Pick<IncidentReportSheetProps, 'saveLabel' | 'onSave'>) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { dismiss } = useBottomSheetModal();
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);
  const [occurredAt, setOccurredAt] = useState(() => new Date());
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ApiIncidentType>('other');
  const [saving, setSaving] = useState(false);
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

  const typeLabel = INCIDENT_TYPES.find((option) => option.value === type)?.label ?? '';
  const selectType = (label: string) =>
    setType(INCIDENT_TYPES.find((option) => option.label === label)?.value ?? 'other');

  const save = async () => {
    if (!described) {
      setShowErrors(true);
      return;
    }
    setSaving(true);
    const saved = await onSave(occurredAt, { type, what_happened: description.trim() });
    setSaving(false);
    if (saved) dismiss();
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
        <View style={styles.types}>
          <ThemedText themeColor="textSecondary" style={styles.label}>
            Type
          </ThemedText>
          <ChipGroup single options={TYPE_LABELS} selected={[typeLabel]} onToggle={selectType} />
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
        <Button
          title="Cancel"
          variant="secondary"
          style={styles.flex}
          disabled={saving}
          onPress={() => dismiss()}
        />
        <Button title={saveLabel} style={styles.flex} loading={saving} onPress={save} />
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
  types: {
    gap: Spacing.two,
  },
  label: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: 500,
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
