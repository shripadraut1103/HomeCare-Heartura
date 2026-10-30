import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Spacing, type ThemeColor } from '@/constants/Theme';
import { useTheme } from '@/hooks/useTheme';
import { haptics } from '@/utils/haptics';

const RADIO_SIZE = 22;
const RADIO_DOT_SIZE = 12;
const COLOR_DOT_SIZE = 10;

export type RadioOption<T extends string> = {
  value: T;
  label: string;
  dotColor?: ThemeColor;
};

type RadioListProps<T extends string> = {
  options: readonly RadioOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function RadioList<T extends string>({ options, value, onChange }: RadioListProps<T>) {
  const theme = useTheme();

  return (
    <View accessibilityRole="radiogroup">
      {options.map((option, index) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            accessibilityLabel={option.label}
            onPress={() => {
              if (selected) return;
              haptics.selection();
              onChange(option.value);
            }}
            style={[
              styles.row,
              index < options.length - 1 && [styles.divider, { borderBottomColor: theme.border }],
            ]}>
            <View
              style={[
                styles.radio,
                { borderColor: selected ? theme.primary : theme.textSecondary },
              ]}>
              {selected ? (
                <View style={[styles.radioDot, { backgroundColor: theme.primary }]} />
              ) : null}
            </View>
            {option.dotColor ? (
              <View style={[styles.colorDot, { backgroundColor: theme[option.dotColor] }]} />
            ) : null}
            <ThemedText style={styles.label}>{option.label}</ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  radio: {
    width: RADIO_SIZE,
    height: RADIO_SIZE,
    borderRadius: RADIO_SIZE / 2,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: RADIO_DOT_SIZE,
    height: RADIO_DOT_SIZE,
    borderRadius: RADIO_DOT_SIZE / 2,
  },
  colorDot: {
    width: COLOR_DOT_SIZE,
    height: COLOR_DOT_SIZE,
    borderRadius: COLOR_DOT_SIZE / 2,
  },
  label: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: 400,
  },
});
