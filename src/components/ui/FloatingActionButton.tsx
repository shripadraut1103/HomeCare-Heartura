import { Pressable, StyleSheet } from 'react-native';

import { Icon, type IconName } from '@/components/ui/Icon';
import { Radius, Shadows } from '@/constants/Theme';
import { useTheme } from '@/hooks/useTheme';
import { haptics } from '@/utils/haptics';

export const FLOATING_ACTION_BUTTON_SIZE = 56;
const SIZE = FLOATING_ACTION_BUTTON_SIZE;

type FloatingActionButtonProps = {
  icon?: IconName;
  accessibilityLabel: string;
  onPress?: () => void;
};

export function FloatingActionButton({
  icon = { ios: 'plus', android: 'add' },
  accessibilityLabel,
  onPress,
}: FloatingActionButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={() => {
        haptics.tap();
        onPress?.();
      }}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: theme.primary },
        pressed && styles.pressed,
      ]}>
      <Icon name={icon} size={26} color={theme.onPrimary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: SIZE,
    height: SIZE,
    borderRadius: Radius.large,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.floating,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
});
