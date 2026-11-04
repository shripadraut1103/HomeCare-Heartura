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

export type PhotoSource = 'library' | 'camera';

type PhotoSourceSheetProps = {
  ref: Ref<BottomSheetModal>;
  onPick: (source: PhotoSource) => void;
};

export function PhotoSourceSheet({ ref, onPick }: PhotoSourceSheetProps) {
  return (
    <AppBottomSheet ref={ref}>
      <PhotoSourceContent onPick={onPick} />
    </AppBottomSheet>
  );
}

function PhotoSourceContent({ onPick }: Pick<PhotoSourceSheetProps, 'onPick'>) {
  const insets = useSafeAreaInsets();
  const { dismiss } = useBottomSheetModal();

  const pick = (source: PhotoSource) => {
    dismiss();
    onPick(source);
  };

  return (
    <BottomSheetView style={{ paddingBottom: insets.bottom + Spacing.three }}>
      <SheetHeader title="Attach a photo" onClose={() => dismiss()} />
      <SourceRow
        icon={{ ios: 'photo.on.rectangle', android: 'photo_library' }}
        label="Photo library"
        onPress={() => pick('library')}
      />
      <SourceRow
        icon={{ ios: 'camera', android: 'photo_camera' }}
        label="Take photo"
        onPress={() => pick('camera')}
      />
    </BottomSheetView>
  );
}

function SourceRow({
  icon,
  label,
  onPress,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: theme.surfaceMuted }]}>
      <IconCircle icon={icon} color="primary" backgroundColor="primaryMuted" size={44} />
      <ThemedText style={styles.label}>{label}</ThemedText>
      <Icon
        name={{ ios: 'chevron.right', android: 'chevron_right' }}
        size={16}
        color={theme.textSecondary}
      />
    </Pressable>
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
