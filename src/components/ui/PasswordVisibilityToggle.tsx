import { Pressable, StyleSheet } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { Spacing } from '@/constants/Theme';
import { useTheme } from '@/hooks/useTheme';
import { haptics } from '@/utils/haptics';

type PasswordVisibilityToggleProps = {
  label: string;
  visible: boolean;
  onToggle: () => void;
};

export function PasswordVisibilityToggle({
  label,
  visible,
  onToggle,
}: PasswordVisibilityToggleProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
      hitSlop={8}
      onPress={() => {
        haptics.selection();
        onToggle();
      }}
      style={({ pressed }) => [styles.toggle, pressed && styles.pressed]}>
      <Icon
        name={
          visible
            ? { ios: 'eye.slash', android: 'visibility_off' }
            : { ios: 'eye', android: 'visibility' }
        }
        size={20}
        color={theme.textSecondary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  toggle: {
    padding: Spacing.one + Spacing.half,
  },
  pressed: {
    opacity: 0.6,
  },
});
