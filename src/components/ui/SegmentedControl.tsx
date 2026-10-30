import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { CountBadge } from '@/components/ui/CountBadge';
import { Radius, Shadows, Spacing } from '@/constants/Theme';
import { useTheme } from '@/hooks/useTheme';
import { haptics } from '@/utils/haptics';

export type Segment<T extends string> = {
  value: T;
  label: string;
  count?: number;
};

type SegmentedControlProps<T extends string> = {
  segments: readonly Segment<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string>({
  segments,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const theme = useTheme();

  return (
    <View
      accessibilityRole="tablist"
      style={[
        styles.track,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border },
      ]}>
      {segments.map((segment) => {
        const selected = segment.value === value;
        return (
          <Pressable
            key={segment.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={
              segment.count === undefined ? segment.label : `${segment.label}, ${segment.count}`
            }
            onPress={() => {
              if (selected) return;
              haptics.selection();
              onChange(segment.value);
            }}
            style={[
              styles.segment,
              selected && [
                styles.selected,
                { backgroundColor: theme.background, borderColor: theme.border },
              ],
            ]}>
            <ThemedText
              themeColor={selected ? 'primary' : 'textSecondary'}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
              style={styles.label}>
              {segment.label}
            </ThemedText>
            {segment.count === undefined ? null : (
              <CountBadge count={segment.count} variant="info" />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    gap: Spacing.one,
    padding: Spacing.one,
    borderRadius: Radius.medium,
    borderWidth: StyleSheet.hairlineWidth,
  },
  segment: {
    flexGrow: 1,
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one + Spacing.half,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.small,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
  },
  selected: {
    ...Shadows.card,
  },
  label: {
    flexShrink: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 600,
  },
});
