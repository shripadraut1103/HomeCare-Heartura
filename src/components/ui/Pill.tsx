import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Radius, Spacing, type ThemeColor } from '@/constants/Theme';
import { useTheme } from '@/hooks/useTheme';

const DOT_SIZE = 6;

type PillProps = {
  label: string | number;
  color?: ThemeColor;
  backgroundColor?: ThemeColor;
  dot?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Pill({
  label,
  color = 'textSecondary',
  backgroundColor = 'backgroundElement',
  dot = false,
  style,
}: PillProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.pill,
        { backgroundColor: theme[backgroundColor], borderColor: theme.border },
        style,
      ]}>
      {dot ? <View style={[styles.dot, { backgroundColor: theme[color] }]} /> : null}
      <ThemedText themeColor={color} numberOfLines={1} style={styles.label}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.one + Spacing.half,
    paddingHorizontal: Spacing.two + Spacing.half,
    paddingVertical: Spacing.half,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: 500,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
});
