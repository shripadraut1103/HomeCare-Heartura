import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Radius, Spacing } from '@/constants/Theme';
import { useTheme } from '@/hooks/useTheme';
import { haptics } from '@/utils/haptics';

type ChipGroupProps = {
  options: readonly string[];
  selected: readonly string[];
  onToggle: (option: string) => void;
};

export function ChipGroup({ options, selected, onToggle }: ChipGroupProps) {
  const theme = useTheme();

  return (
    <View style={styles.wrap}>
      {options.map((option) => {
        const isSelected = selected.includes(option);
        return (
          <Pressable
            key={option}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isSelected }}
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
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.full,
    borderWidth: 1,
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
