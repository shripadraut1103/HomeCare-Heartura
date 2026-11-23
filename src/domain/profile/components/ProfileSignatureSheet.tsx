import { BottomSheetView, useBottomSheetModal, type BottomSheetModal } from '@gorhom/bottom-sheet';
import { useState, type Ref } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppBottomSheet } from '@/components/sheet/AppBottomSheet';
import { SheetHeader } from '@/components/sheet/SheetHeader';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { SignaturePad, type SignatureStrokes } from '@/components/ui/SignaturePad';
import { Spacing } from '@/constants/Theme';
import { saveSignatureAction } from '@/domain/profile/store/async-actions/ProfileAsyncActions';
import { useTheme } from '@/hooks/useTheme';
import { setToastMessage } from '@/store/common-reducer/ToastReducer';
import { useAppDispatch } from '@/store/hooks';
import { confirm } from '@/utils/confirm';
import { haptics } from '@/utils/haptics';
import { strokesToPngDataUrl } from '@/utils/signaturePng';

export type ProfileSignatureSheetData = { changesLeft: number; changesMax: number };

export function ProfileSignatureSheet({
  ref,
}: {
  ref: Ref<BottomSheetModal<ProfileSignatureSheetData>>;
}) {
  return (
    <AppBottomSheet<ProfileSignatureSheetData> ref={ref} enableContentPanningGesture={false}>
      {({ data }) => (data ? <SignatureContent {...data} /> : null)}
    </AppBottomSheet>
  );
}

function SignatureContent({ changesLeft, changesMax }: ProfileSignatureSheetData) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { dismiss } = useBottomSheetModal();
  const [strokes, setStrokes] = useState<SignatureStrokes>([]);
  const [saving, setSaving] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const signed = strokes.length > 0;
  const last = changesLeft === 1;

  const save = async () => {
    const image = strokesToPngDataUrl(strokes);
    if (!image) {
      setShowErrors(true);
      haptics.error();
      return;
    }
    const confirmed = await confirm({
      title: 'Save this signature?',
      message: last
        ? 'This is your last change. After it, only the office can reset your signature.'
        : `This uses 1 of your ${changesLeft} remaining changes.`,
      confirmLabel: 'Save',
    });
    if (!confirmed) return;
    setSaving(true);
    const result = await dispatch(saveSignatureAction(image));
    setSaving(false);
    const payload = saveSignatureAction.fulfilled.match(result) ? result.payload : null;
    if (!payload || 'error' in payload) {
      haptics.error();
      dispatch(
        setToastMessage({
          message: payload?.error || 'Couldn’t save your signature. Try again.',
          type: 'error',
        })
      );
      return;
    }
    haptics.success();
    dispatch(setToastMessage({ message: 'Signature saved' }));
    dismiss();
  };

  return (
    <BottomSheetView style={{ paddingBottom: insets.bottom + Spacing.three }}>
      <SheetHeader title="My signature" onClose={() => dismiss()} />
      <View style={styles.body}>
        <ThemedText themeColor="textSecondary" style={styles.hint}>
          Used to sign your notes. {changesLeft} of {changesMax} changes left.
        </ThemedText>
        <SignaturePad value={strokes} onChange={setStrokes} error={showErrors && !signed} />
        {showErrors && !signed ? (
          <ThemedText themeColor="error" style={styles.hint}>
            Sign in the box above
          </ThemedText>
        ) : null}
      </View>
      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        <Button
          title="Cancel"
          variant="secondary"
          style={styles.flex}
          disabled={saving}
          onPress={() => dismiss()}
        />
        <Button
          title="Save signature"
          style={styles.flex}
          loading={saving}
          onPress={() => void save()}
        />
      </View>
    </BottomSheetView>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: Spacing.three,
    padding: Spacing.four,
  },
  hint: {
    fontSize: 15,
    lineHeight: 20,
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
