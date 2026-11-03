import {
  BottomSheetBackdrop,
  BottomSheetModal,
  type BottomSheetBackdropProps,
  type BottomSheetModalProps,
} from '@gorhom/bottom-sheet';
import type { Ref } from 'react';
import { StyleSheet } from 'react-native';

import { useTheme } from '@/hooks/useTheme';

const SHEET_RADIUS = 24;
const HANDLE_WIDTH = 40;

const renderBackdrop = (props: BottomSheetBackdropProps) => (
  <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />
);

type AppBottomSheetProps<T> = BottomSheetModalProps<T> & {
  ref?: Ref<BottomSheetModal<T>>;
};

/**
 * The app's bottom-sheet modal: dimmed backdrop (tap to close), rounded themed background and
 * grab handle. Accepts every `BottomSheetModal` prop; open it with `ref.current?.present(data)`.
 */
export function AppBottomSheet<T>({ ref, ...props }: AppBottomSheetProps<T>) {
  const theme = useTheme();

  return (
    <BottomSheetModal<T>
      ref={ref}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: theme.background, borderRadius: SHEET_RADIUS }}
      handleIndicatorStyle={[styles.handle, { backgroundColor: theme.border }]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  handle: {
    width: HANDLE_WIDTH,
  },
});
