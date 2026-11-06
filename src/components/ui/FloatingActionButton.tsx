import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';

import { Icon, type IconName } from '@/components/ui/Icon';
import { Radius, Shadows, Spacing } from '@/constants/Theme';
import { useTheme } from '@/hooks/useTheme';
import { haptics } from '@/utils/haptics';

export const FLOATING_ACTION_BUTTON_SIZE = 56;
const SIZE = FLOATING_ACTION_BUTTON_SIZE;

type FloatingActionButtonProps = {
  icon?: IconName;
  accessibilityLabel: string;
  label?: string;
  onPress?: () => void;
};

export function FloatingActionButton({
  icon = { ios: 'plus', android: 'add' },
  accessibilityLabel,
  label,
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
        label && styles.extended,
        { backgroundColor: theme.primary },
        pressed && styles.pressed,
      ]}>
      <Icon name={icon} size={label ? 22 : 26} color={theme.onPrimary} />
      {label ? (
        <ThemedText themeColor="onPrimary" style={styles.label}>
          {label}
        </ThemedText>
      ) : null}
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
  extended: {
    width: 'auto',
    flexDirection: 'row',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four + Spacing.one,
  },
  label: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: 600,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
});
