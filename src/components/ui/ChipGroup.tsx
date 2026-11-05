import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Radius, Spacing, type ThemeColor } from '@/constants/Theme';
import { useTheme } from '@/hooks/useTheme';
import { haptics } from '@/utils/haptics';

type ChipGroupProps = {
  options: readonly string[];
  selected: readonly string[];
  onToggle: (option: string) => void;
  dotColors?: Partial<Record<string, ThemeColor>>;
  single?: boolean;
};

export function ChipGroup({
  options,
  selected,
  onToggle,
  dotColors,
  single = false,
}: ChipGroupProps) {
  const theme = useTheme();

  return (
    <View style={styles.wrap}>
      {options.map((option) => {
        const isSelected = selected.includes(option);
        const dotColor = dotColors?.[option];
        return (
          <Pressable
            key={option}
            accessibilityRole={single ? 'radio' : 'checkbox'}
            accessibilityState={single ? { selected: isSelected } : { checked: isSelected }}
            onPress={() => {
              haptics.selection();
              onToggle(option);
            }}
            style={({ pressed }) => [
              styles.chip,
              {
                backgroundColor: isSelected ? theme.primaryMuted : theme.background,
                borderColor: isSelected ? theme.primary : theme.border,
              },
              pressed && styles.pressed,
            ]}>
            {dotColor ? <View style={[styles.dot, { backgroundColor: theme[dotColor] }]} /> : null}
            <ThemedText themeColor={isSelected ? 'primary' : 'textSecondary'} style={styles.label}>
              {option}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two + Spacing.half,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: 500,
  },
});
