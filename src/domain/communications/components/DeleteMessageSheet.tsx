import { BottomSheetView, useBottomSheetModal, type BottomSheetModal } from '@gorhom/bottom-sheet';
import type { Ref } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppBottomSheet } from '@/components/sheet/AppBottomSheet';
import { SheetHeader } from '@/components/sheet/SheetHeader';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { Spacing } from '@/constants/Theme';
import { useTheme } from '@/hooks/useTheme';

export type DeleteMessageSheetData = { messageId: string };

type DeleteMessageSheetProps = {
  ref: Ref<BottomSheetModal<DeleteMessageSheetData>>;
  onDelete: (messageId: string) => void;
};

export function DeleteMessageSheet({ ref, onDelete }: DeleteMessageSheetProps) {
  return (
    <AppBottomSheet<DeleteMessageSheetData> ref={ref}>
      {({ data }) => (data ? <DeleteContent {...data} onDelete={onDelete} /> : null)}
    </AppBottomSheet>
  );
}

function DeleteContent({
  messageId,
  onDelete,
}: DeleteMessageSheetData & Pick<DeleteMessageSheetProps, 'onDelete'>) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { dismiss } = useBottomSheetModal();

  const close = () => dismiss();
  const remove = () => {
    onDelete(messageId);
    dismiss();
  };

  return (
    <BottomSheetView style={{ paddingBottom: insets.bottom + Spacing.three }}>
      <SheetHeader title="Delete this message?" onClose={close} />
      <ThemedText themeColor="textSecondary" style={styles.message}>
        It is removed from this conversation for everyone. This can’t be undone.
      </ThemedText>
      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        <Button title="Cancel" variant="link" style={styles.flex} onPress={close} />
        <Button
          title="Delete"
          color="onError"
          style={[styles.flex, { backgroundColor: theme.error }]}
          onPress={remove}
        />
      </View>
    </BottomSheetView>
  );
}

const styles = StyleSheet.create({
  message: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    fontSize: 17,
    lineHeight: 26,
    fontWeight: 400,
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
