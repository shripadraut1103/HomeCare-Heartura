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
import { InfoNote } from '@/components/ui/InfoNote';
import { RadioList, type RadioOption } from '@/components/ui/RadioList';
import { TextField, type TextFieldProps } from '@/components/ui/TextField';
import { Spacing } from '@/constants/Theme';
import { useTheme } from '@/hooks/useTheme';

const SheetTextInput = BottomSheetTextInput as NonNullable<TextFieldProps['InputComponent']>;

type DeclineReason = 'distance' | 'availability' | 'caseload' | 'specialty' | 'other';

const REASONS: readonly RadioOption<DeclineReason>[] = [
  { value: 'distance', label: 'Too far from my area' },
  { value: 'availability', label: 'No availability at the requested times' },
  { value: 'caseload', label: 'Caseload is full' },
  { value: 'specialty', label: 'Not the right specialty' },
  { value: 'other', label: 'Other' },
];

export type DeclineRequestSheetData = { requestId: string; patientName: string };

type DeclineRequestSheetProps = {
  ref: Ref<BottomSheetModal<DeclineRequestSheetData>>;
  onDecline: (requestId: string, reason: string) => void;
};

export function DeclineRequestSheet({ ref, onDecline }: DeclineRequestSheetProps) {
  return (
    <AppBottomSheet<DeclineRequestSheetData>
      ref={ref}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize">
      {({ data }) => (data ? <DeclineContent {...data} onDecline={onDecline} /> : null)}
    </AppBottomSheet>
  );
}

function DeclineContent({
  requestId,
  patientName,
  onDecline,
}: DeclineRequestSheetData & Pick<DeclineRequestSheetProps, 'onDecline'>) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { dismiss } = useBottomSheetModal();
  const [reason, setReason] = useState<DeclineReason | null>(null);
  const [otherText, setOtherText] = useState('');

  const reasonText =
    reason === 'other'
      ? otherText.trim()
      : (REASONS.find((option) => option.value === reason)?.label ?? '');

  const close = () => dismiss();
  const decline = () => {
    if (!reasonText) return;
    onDecline(requestId, reasonText);
    dismiss();
  };

  return (
    <BottomSheetView style={{ paddingBottom: insets.bottom + Spacing.three }}>
      <SheetHeader title={`Decline ${patientName}?`} onClose={close} />
      <View style={styles.body}>
        <InfoNote
          text="The office sees your reason and finds another provider."
          collapsible={false}
        />
        <RadioList options={REASONS} value={reason} onChange={setReason} />
        {reason === 'other' ? (
          <TextField
            label="Reason"
            required
            value={otherText}
            onChangeText={setOtherText}
            placeholder="Tell the office why"
            InputComponent={SheetTextInput}
            autoFocus
            multiline
            maxLength={200}
            style={styles.input}
          />
        ) : null}
      </View>
      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        <Button title="Cancel" variant="secondary" style={styles.flex} onPress={close} />
        <Button
          title="Decline"
          style={styles.flex}
          disabled={!reasonText}
          accessibilityHint={reasonText ? undefined : 'Pick a reason first'}
          onPress={decline}
        />
      </View>
    </BottomSheetView>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.three,
  },
  input: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  flex: {
    flex: 1,
  },
});
