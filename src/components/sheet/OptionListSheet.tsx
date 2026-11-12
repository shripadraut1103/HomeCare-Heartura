import { BottomSheetView, useBottomSheetModal, type BottomSheetModal } from '@gorhom/bottom-sheet';
import type { Ref } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppBottomSheet } from '@/components/sheet/AppBottomSheet';
import { SheetHeader } from '@/components/sheet/SheetHeader';
import { ThemedText } from '@/components/ThemedText';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Radius, Shadows, Spacing, type ThemeColor } from '@/constants/Theme';
import { useTheme } from '@/hooks/useTheme';
import { haptics } from '@/utils/haptics';

const TILE_SIZE = 48;

export type SheetOption = {
  key: string;
  label: string;
  icon: IconName;
  color: ThemeColor;
  background: ThemeColor;
};

export type OptionListSheetData = { title: string; options: readonly SheetOption[] };

type OptionListSheetProps = {
  ref: Ref<BottomSheetModal<OptionListSheetData>>;
  onPick: (key: string) => void;
};

export function OptionListSheet({ ref, onPick }: OptionListSheetProps) {
  return (
    <AppBottomSheet<OptionListSheetData> ref={ref}>
      {({ data }) => (data ? <OptionList {...data} onPick={onPick} /> : null)}
    </AppBottomSheet>
  );
}

function OptionList({
  title,
  options,
  onPick,
}: OptionListSheetData & Pick<OptionListSheetProps, 'onPick'>) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { dismiss } = useBottomSheetModal();

  return (
    <BottomSheetView style={{ paddingBottom: insets.bottom + Spacing.four }}>
      <SheetHeader title={title} onClose={() => dismiss()} />
      <View style={styles.body}>
        <View
          style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
          {options.map((option) => (
            <Pressable
              key={option.key}
              accessibilityRole="button"
              onPress={() => {
                haptics.selection();
                dismiss();
                onPick(option.key);
              }}
              style={({ pressed }) => [
                styles.row,
                pressed && { backgroundColor: theme.surfaceMuted },
              ]}>
              <View style={[styles.tile, { backgroundColor: theme[option.background] }]}>
                <Icon name={option.icon} size={22} color={theme[option.color]} />
              </View>
              <ThemedText style={styles.label}>{option.label}</ThemedText>
              <Icon
                name={{ ios: 'chevron.right', android: 'chevron_right' }}
                size={18}
                color={theme.textSecondary}
              />
            </Pressable>
          ))}
        </View>
      </View>
    </BottomSheetView>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
  },
  card: {
    paddingVertical: Spacing.one,
    borderRadius: Radius.large,
    borderWidth: StyleSheet.hairlineWidth,
    ...Shadows.card,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three + Spacing.one,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: Radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: 400,
  },
});
