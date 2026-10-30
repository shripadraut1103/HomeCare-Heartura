import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Radius, type ThemeColor } from '@/constants/Theme';
import { useTheme } from '@/hooks/useTheme';

const MIN_SIZE = 22;
const MAX_SHOWN = 99;

const VARIANTS = {
  alert: { background: 'error', text: 'onError', ringed: true },
  info: { background: 'primary', text: 'onPrimary', ringed: false },
} satisfies Record<string, { background: ThemeColor; text: ThemeColor; ringed: boolean }>;

type CountBadgeProps = {
  count: number;
  variant?: keyof typeof VARIANTS;
  style?: StyleProp<ViewStyle>;
};

export function CountBadge({ count, variant = 'alert', style }: CountBadgeProps) {
  const theme = useTheme();
  const colors = VARIANTS[variant];
  if (count <= 0) return null;

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: theme[colors.background] },
        colors.ringed && [styles.ring, { borderColor: theme.background }],
        style,
      ]}>
      <ThemedText themeColor={colors.text} style={styles.label}>
        {count > MAX_SHOWN ? `${MAX_SHOWN}+` : count}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    minWidth: MIN_SIZE,
    height: MIN_SIZE,
    paddingHorizontal: 5,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    borderWidth: 2,
  },
  label: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: 700,
  },
});
