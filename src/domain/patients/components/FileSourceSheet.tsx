import { BottomSheetView, useBottomSheetModal, type BottomSheetModal } from '@gorhom/bottom-sheet';
import type { Ref } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppBottomSheet } from '@/components/sheet/AppBottomSheet';
import { SheetHeader } from '@/components/sheet/SheetHeader';
import { ThemedText } from '@/components/ThemedText';
import { Icon, type IconName } from '@/components/ui/Icon';
import { IconCircle } from '@/components/ui/IconCircle';
import { Spacing } from '@/constants/Theme';
import { useTheme } from '@/hooks/useTheme';

export type FileSource = 'files' | 'camera' | 'library';

const SOURCES: readonly { value: FileSource; label: string; icon: IconName }[] = [
  { value: 'files', label: 'Choose files', icon: { ios: 'folder', android: 'folder' } },
  { value: 'camera', label: 'Take a photo', icon: { ios: 'camera', android: 'photo_camera' } },
  {
    value: 'library',
    label: 'Photo library',
    icon: { ios: 'photo.on.rectangle', android: 'photo_library' },
  },
];

type FileSourceSheetProps = {
  ref: Ref<BottomSheetModal>;
  onPick: (source: FileSource) => void;
};

export function FileSourceSheet({ ref, onPick }: FileSourceSheetProps) {
  return (
    <AppBottomSheet ref={ref}>
      <SourceList onPick={onPick} />
    </AppBottomSheet>
  );
}

function SourceList({ onPick }: Pick<FileSourceSheetProps, 'onPick'>) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { dismiss } = useBottomSheetModal();

  return (
    <BottomSheetView style={{ paddingBottom: insets.bottom + Spacing.three }}>
      <SheetHeader title="Add files" onClose={() => dismiss()} />
      {SOURCES.map((source) => (
        <Pressable
          key={source.value}
          accessibilityRole="button"
          onPress={() => {
            dismiss();
            onPick(source.value);
          }}
          style={({ pressed }) => [styles.row, pressed && { backgroundColor: theme.surfaceMuted }]}>
          <IconCircle icon={source.icon} color="primary" backgroundColor="primaryMuted" size={44} />
          <ThemedText style={styles.label}>{source.label}</ThemedText>
          <Icon
            name={{ ios: 'chevron.right', android: 'chevron_right' }}
            size={16}
            color={theme.textSecondary}
          />
        </Pressable>
      ))}
    </BottomSheetView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  label: {
    flex: 1,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: 500,
  },
});
