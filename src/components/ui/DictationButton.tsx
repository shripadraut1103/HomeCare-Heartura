import { Pressable, StyleSheet } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { useTheme } from '@/hooks/useTheme';

export const DICTATION_BUTTON_SIZE = 40;

type DictationButtonProps = {
  /** What is being dictated, for screen readers. */
  label: string;
  onPress: () => void;
};

export function DictationButton({ label, onPress }: DictationButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Dictate ${label}`}
      onPress={onPress}
      style={[styles.button, { backgroundColor: theme.toneBlueBg }]}>
      <Icon name={{ ios: 'mic', android: 'mic' }} size={18} color={theme.toneBlueFg} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: DICTATION_BUTTON_SIZE,
    height: DICTATION_BUTTON_SIZE,
    borderRadius: DICTATION_BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
