import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Radius, Spacing } from '@/constants/Theme';
import { useTheme } from '@/hooks/useTheme';
import { haptics } from '@/utils/haptics';

const BAR_HEIGHT = 5;

type StepProgressProps = {
  steps: readonly string[];
  current: number;
  selectable?: readonly number[];
  onSelect?: (index: number) => void;
};

export function StepProgress({ steps, current, selectable = [], onSelect }: StepProgressProps) {
  const theme = useTheme();

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={`Step ${current + 1} of ${steps.length}: ${steps[current]}`}
      style={[styles.row, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
      {steps.map((step, index) => {
        const reached = index <= current;
        const content = (
          <>
            <View
              style={[styles.bar, { backgroundColor: reached ? theme.accent : theme.border }]}
            />
            <ThemedText
              themeColor={reached ? 'accent' : 'textSecondary'}
              numberOfLines={1}
              style={[styles.label, index === current && styles.current]}>
              {index + 1}. {step}
            </ThemedText>
          </>
        );

        return onSelect && index !== current && selectable.includes(index) ? (
          <Pressable
            key={step}
            accessibilityRole="button"
            accessibilityLabel={`Go to step ${index + 1}, ${step}`}
            hitSlop={{ top: Spacing.three, bottom: Spacing.two }}
            onPress={() => {
              haptics.selection();
              onSelect(index);
            }}
            style={({ pressed }) => [styles.step, pressed && styles.pressed]}>
            {content}
          </Pressable>
        ) : (
          <View key={step} style={styles.step}>
            {content}
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
  pressed: {
    opacity: 0.6,
  },
});
