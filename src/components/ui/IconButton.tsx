import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { Icon, type IconName } from '@/components/ui/Icon';
import { Radius, type ThemeColor } from '@/constants/Theme';
import { useTheme } from '@/hooks/useTheme';
import { haptics } from '@/utils/haptics';

type IconButtonProps = {
  icon: IconName;
  accessibilityLabel: string;
  onPress?: () => void;
  size?: number;
  color?: ThemeColor;
  style?: StyleProp<ViewStyle>;
};

export function IconButton({
  icon,
  accessibilityLabel,
  onPress,
  size = 52,
  color = 'accent',
  style,
}: IconButtonProps) {
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
        {
          width: size,
          height: size,
          backgroundColor: theme.background,
          borderColor: theme.border,
        },
        pressed && styles.pressed,
        style,
      ]}>
      <Icon name={icon} size={22} color={theme[color]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.medium,
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.7,
  },
});
