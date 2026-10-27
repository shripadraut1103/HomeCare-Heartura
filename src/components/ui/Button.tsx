import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, type PressableProps } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Radius, Spacing } from '@/constants/Theme';
import { useTheme } from '@/hooks/useTheme';

export type ButtonProps = Omit<PressableProps, 'children'> & {
  title: string;
  /** `primary` is a filled button; `link` is a borderless text button. */
  variant?: 'primary' | 'link';
  size?: 'small' | 'medium';
  loading?: boolean;
  icon?: ReactNode;
};

export function Button({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled,
  icon,
  style,
  ...pressableProps
}: ButtonProps) {
  const theme = useTheme();
  const isPrimary = variant === 'primary';
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={(state) => [
        styles.base,
        isPrimary && [styles.primary, { backgroundColor: theme.primary }],
        state.pressed && styles.pressed,
        isDisabled && styles.disabled,
        typeof style === 'function' ? style(state) : style,
      ]}
      {...pressableProps}>
      {loading ? (
        <ActivityIndicator color={isPrimary ? theme.onPrimary : theme.primary} />
      ) : (
        <>
          {icon}
          <ThemedText
            type={size === 'small' ? 'smallBold' : 'default'}
            themeColor={isPrimary ? 'onPrimary' : 'primary'}
            style={size === 'medium' && styles.mediumLabel}>
            {title}
          </ThemedText>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  primary: {
    minHeight: 44,
    borderRadius: Radius.small,
    paddingHorizontal: Spacing.three,
  },
  mediumLabel: {
    fontWeight: 600,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.5,
  },
});
