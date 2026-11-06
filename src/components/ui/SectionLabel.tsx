import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Spacing } from '@/constants/Theme';
import { useTheme } from '@/hooks/useTheme';

const DOT_SIZE = 8;

export function SectionLabel({ title, style }: { title: string; style?: StyleProp<ViewStyle> }) {
  const theme = useTheme();

  return (
    <View style={[styles.row, style]}>
      <View style={[styles.dot, { backgroundColor: theme.accent }]} />
      <ThemedText accessibilityRole="header" themeColor="accent" style={styles.title}>
        {title.toUpperCase()}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two + Spacing.half,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
  title: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: 700,
    letterSpacing: 1.2,
  },
});
