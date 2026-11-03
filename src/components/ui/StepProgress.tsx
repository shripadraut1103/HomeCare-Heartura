import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Radius, Spacing } from '@/constants/Theme';
import { useTheme } from '@/hooks/useTheme';

const BAR_HEIGHT = 5;

type StepProgressProps = {
  steps: readonly string[];
  current: number;
};

export function StepProgress({ steps, current }: StepProgressProps) {
  const theme = useTheme();

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={`Step ${current + 1} of ${steps.length}: ${steps[current]}`}
      style={[styles.row, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
      {steps.map((step, index) => {
        const reached = index <= current;
        return (
          <View key={step} style={styles.step}>
            <View
              style={[styles.bar, { backgroundColor: reached ? theme.accent : theme.border }]}
            />
            <ThemedText
              themeColor={reached ? 'accent' : 'textSecondary'}
              numberOfLines={1}
              style={[styles.label, index === current && styles.current]}>
              {index + 1}. {step}
            </ThemedText>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.three - Spacing.one,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  step: {
    flex: 1,
    gap: Spacing.two,
  },
  bar: {
    height: BAR_HEIGHT,
    borderRadius: Radius.full,
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 400,
  },
  current: {
    fontWeight: 600,
  },
});
