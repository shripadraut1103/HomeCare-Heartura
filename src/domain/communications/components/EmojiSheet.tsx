import { BottomSheetView, useBottomSheetModal, type BottomSheetModal } from '@gorhom/bottom-sheet';
import type { Ref } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppBottomSheet } from '@/components/sheet/AppBottomSheet';
import { SheetHeader } from '@/components/sheet/SheetHeader';
import { Radius, Spacing } from '@/constants/Theme';
import { useTheme } from '@/hooks/useTheme';
import { haptics } from '@/utils/haptics';

const EMOJI_SIZE = 48;

const EMOJIS = [
  '😀',
  '😊',
  '🙂',
  '😂',
  '😍',
  '🥰',
  '😉',
  '😎',
  '🤔',
  '😅',
  '😢',
  '😮',
  '😴',
  '🙏',
  '👍',
  '👎',
  '👏',
  '🙌',
  '👋',
  '💪',
  '🤝',
  '✌️',
  '👌',
  '🫶',
  '❤️',
  '💙',
  '💚',
  '⭐',
  '🎉',
  '✅',
  '❌',
  '⚠️',
  '📅',
  '⏰',
  '🏠',
  '🚗',
  '💊',
  '🩺',
  '🏥',
  '📝',
  '📎',
  '📞',
  '💬',
  '☕',
  '🌞',
  '🌧️',
  '🔥',
  '💯',
];

type EmojiSheetProps = {
  ref: Ref<BottomSheetModal>;
  onSelect: (emoji: string) => void;
};

export function EmojiSheet({ ref, onSelect }: EmojiSheetProps) {
  return (
    <AppBottomSheet ref={ref}>
      <EmojiContent onSelect={onSelect} />
    </AppBottomSheet>
  );
}

function EmojiContent({ onSelect }: Pick<EmojiSheetProps, 'onSelect'>) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { dismiss } = useBottomSheetModal();

  return (
    <BottomSheetView style={{ paddingBottom: insets.bottom + Spacing.three }}>
      <SheetHeader title="Emoji" onClose={() => dismiss()} />
      <View style={styles.grid}>
        {EMOJIS.map((emoji) => (
          <Pressable
            key={emoji}
            accessibilityRole="button"
            accessibilityLabel={`Insert ${emoji}`}
            onPress={() => {
              haptics.selection();
              onSelect(emoji);
            }}
            style={({ pressed }) => [
              styles.emoji,
              pressed && { backgroundColor: theme.surfaceMuted },
            ]}>
            <Text style={styles.glyph}>{emoji}</Text>
          </Pressable>
        ))}
      </View>
    </BottomSheetView>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
  },
  emoji: {
    width: EMOJI_SIZE,
    height: EMOJI_SIZE,
    borderRadius: Radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: {
    fontSize: 28,
  },
});
