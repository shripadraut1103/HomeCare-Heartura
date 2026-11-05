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
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { SignaturePad, type SignatureStrokes } from '@/components/ui/SignaturePad';
import { TextField, type TextFieldProps } from '@/components/ui/TextField';
import { Radius, Spacing } from '@/constants/Theme';
import type { Signature } from '@/domain/notes/interfaces/NoteInterfaces';
import { useTheme } from '@/hooks/useTheme';

const SheetTextInput = BottomSheetTextInput as NonNullable<TextFieldProps['InputComponent']>;

export type CaregiverSignatureSheetData = {
  signer: string;
  service: string;
  performedOn: string;
  signature?: Signature;
};

type CaregiverSignatureSheetProps = {
  ref: Ref<BottomSheetModal<CaregiverSignatureSheetData>>;
  onSave: (signature: Signature) => void;
};

export function CaregiverSignatureSheet({ ref, onSave }: CaregiverSignatureSheetProps) {
  return (
    <AppBottomSheet<CaregiverSignatureSheetData>
      ref={ref}
      enableContentPanningGesture={false}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize">
      {({ data }) => (data ? <SignatureContent {...data} onSave={onSave} /> : null)}
    </AppBottomSheet>
  );
}

function SignatureContent({
  signer: defaultSigner,
  service,
  performedOn,
  signature,
  onSave,
}: CaregiverSignatureSheetData & Pick<CaregiverSignatureSheetProps, 'onSave'>) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { dismiss } = useBottomSheetModal();
  const [signer, setSigner] = useState(signature?.signer ?? defaultSigner);
  const [strokes, setStrokes] = useState<SignatureStrokes>(signature?.strokes ?? []);
  const [showErrors, setShowErrors] = useState(false);
  const signed = strokes.length > 0;
  const named = signer.trim().length > 0;

  const save = () => {
    if (!signed || !named) {
      setShowErrors(true);
      return;
    }
    // TODO: export the strokes as an image and upload it once the signatures API exists.
    onSave({ signer: signer.trim(), strokes, signedAt: new Date().toISOString() });
    dismiss();
  };

  return (
    <BottomSheetView style={{ paddingBottom: insets.bottom + Spacing.three }}>
      <SheetHeader title="Caregiver signature" onClose={() => dismiss()} />
      <View style={styles.body}>
        <View style={[styles.statement, { backgroundColor: theme.surfaceMuted }]}>
          <ThemedText themeColor="textSecondary" style={styles.statementText}>
            I confirm the services of{' '}
            <ThemedText style={[styles.statementText, styles.strong]}>{service}</ThemedText> were
            performed on{' '}
            <ThemedText style={[styles.statementText, styles.strong]}>{performedOn}</ThemedText>.
          </ThemedText>
        </View>
        <TextField
          label="Signed by or for"
          value={signer}
          onChangeText={setSigner}
          error={showErrors && !named ? 'Enter who is signing' : undefined}
          autoCapitalize="words"
          InputComponent={SheetTextInput}
        />
        <View style={styles.signature}>
          <ThemedText themeColor="textSecondary" style={styles.label}>
            Signature<ThemedText themeColor="error">{'  *'}</ThemedText>
          </ThemedText>
          <SignaturePad value={strokes} onChange={setStrokes} error={showErrors && !signed} />
          {showErrors && !signed ? (
            <ThemedText themeColor="error" style={styles.label}>
              Ask the caregiver to sign
            </ThemedText>
          ) : null}
        </View>
      </View>
      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        <Button title="Cancel" variant="secondary" style={styles.flex} onPress={() => dismiss()} />
        <Button title="Save signature" style={styles.flex} onPress={save} />
      </View>
    </BottomSheetView>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: Spacing.four,
    padding: Spacing.four,
  },
  statement: {
    padding: Spacing.three,
    borderRadius: Radius.medium,
  },
  statementText: {
    fontSize: 16,
    lineHeight: 24,
  },
  strong: {
    fontWeight: 600,
  },
  signature: {
    gap: Spacing.two,
  },
  label: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: 500,
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
