import {
  BottomSheetTextInput,
  BottomSheetView,
  useBottomSheetModal,
  type BottomSheetModal,
} from '@gorhom/bottom-sheet';
import { useState, type Ref } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppBottomSheet } from '@/components/sheet/AppBottomSheet';
import { SheetHeader } from '@/components/sheet/SheetHeader';
import { Button } from '@/components/ui/Button';
import { TextField, type TextFieldProps } from '@/components/ui/TextField';
import { Radius, Spacing } from '@/constants/Theme';
import type { PatientIncident } from '@/domain/patients/interfaces/PatientInterfaces';
import { useTheme } from '@/hooks/useTheme';

const SheetTextInput = BottomSheetTextInput as NonNullable<TextFieldProps['InputComponent']>;
const MAX_LENGTH = 1000;

export type IncidentCommentSheetData = { incident: PatientIncident };

type IncidentCommentSheetProps = {
  ref: Ref<BottomSheetModal<IncidentCommentSheetData>>;
  onSave: (incident: PatientIncident, comment: string) => Promise<boolean>;
};

export function IncidentCommentSheet({ ref, onSave }: IncidentCommentSheetProps) {
  return (
    <AppBottomSheet<IncidentCommentSheetData>
      ref={ref}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize">
      {({ data }) => (data ? <CommentContent incident={data.incident} onSave={onSave} /> : null)}
    </AppBottomSheet>
  );
}

function CommentContent({
  incident,
  onSave,
}: IncidentCommentSheetData & Pick<IncidentCommentSheetProps, 'onSave'>) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { dismiss } = useBottomSheetModal();
  const [comment, setComment] = useState(incident.comment ?? '');
  const [saving, setSaving] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const filled = comment.trim().length > 0;

  const save = async () => {
    if (!filled) {
      setShowErrors(true);
      return;
    }
    setSaving(true);
    const saved = await onSave(incident, comment.trim());
    setSaving(false);
    if (saved) dismiss();
  };

  return (
    <BottomSheetView style={{ paddingBottom: insets.bottom + Spacing.three }}>
      <SheetHeader title={`Comment on ${incident.code}`} onClose={() => dismiss()} />
      <View style={styles.body}>
        <TextField
          label="Comment"
          required
          value={comment}
          onChangeText={setComment}
          maxLength={MAX_LENGTH}
          error={showErrors && !filled ? 'Add a comment' : undefined}
          placeholder="For example: Reported to DDD on 11/19/2026"
          multiline
          textAlignVertical="top"
          style={styles.input}
          InputComponent={SheetTextInput}
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
        <Button title="Save comment" style={styles.flex} loading={saving} onPress={save} />
      </View>
    </BottomSheetView>
  );
}

const styles = StyleSheet.create({
  body: {
    padding: Spacing.four,
  },
  input: {
    minHeight: 104,
    paddingTop: Spacing.three - Spacing.one,
    borderRadius: Radius.medium,
  },
  flex: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
