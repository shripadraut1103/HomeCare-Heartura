import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';
import { Radius, Spacing } from '@/constants/Theme';
import { useTheme } from '@/hooks/useTheme';
import { haptics } from '@/utils/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const PRESS_SPRING = { damping: 18, stiffness: 400, mass: 0.6 };
const PRESSED_SCALE = 0.97;
const PRESSED_OPACITY = 0.6;
const DISABLED_OPACITY = 0.5;

export type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  title: string;
  /** `primary` is filled, `secondary` is outlined, `link` is a borderless text button. */
  variant?: 'primary' | 'secondary' | 'link';
  size?: 'small' | 'medium';
  loading?: boolean;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled,
  icon,
  style,
  onPress,
  onPressIn,
  onPressOut,
  ...pressableProps
}: ButtonProps) {
  const theme = useTheme();
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const isLink = variant === 'link';
  const isDisabled = disabled || loading;

  const pressed = useSharedValue(0);
  const restingOpacity = isDisabled ? DISABLED_OPACITY : 1;
  const pressStyle = useAnimatedStyle(() =>
    isLink
      ? { opacity: restingOpacity * (1 - pressed.value * (1 - PRESSED_OPACITY)) }
      : {
          opacity: restingOpacity,
          transform: [{ scale: 1 - pressed.value * (1 - PRESSED_SCALE) }],
        }
  );

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPressIn={(event) => {
        pressed.value = withSpring(1, PRESS_SPRING);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        pressed.value = withSpring(0, PRESS_SPRING);
        onPressOut?.(event);
      }}
      onPress={(event) => {
        if (isPrimary) haptics.tap();
        onPress?.(event);
      }}
      style={[
        styles.base,
        isPrimary && [styles.boxed, { backgroundColor: theme.primary }],
        isSecondary && [
          styles.boxed,
          styles.secondary,
          { borderColor: theme.border, backgroundColor: theme.background },
        ],
        style,
        pressStyle,
      ]}
      {...pressableProps}>
      {loading ? (
        <ActivityIndicator color={isPrimary ? theme.onPrimary : theme.primary} />
      ) : (
        <>
          {icon}
          <ThemedText
            type={size === 'small' ? 'smallBold' : 'default'}
            themeColor={isPrimary ? 'onPrimary' : isSecondary ? 'text' : 'primary'}
            style={size === 'medium' && styles.mediumLabel}>
            {title}
          </ThemedText>
        </>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  boxed: {
    minHeight: 44,
    borderRadius: Radius.small,
    paddingHorizontal: Spacing.three,
  },
  secondary: {
    borderWidth: 1,
  },
  mediumLabel: {
    fontWeight: 600,
  },
});
