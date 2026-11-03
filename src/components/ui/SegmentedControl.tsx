import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';
import { CountBadge } from '@/components/ui/CountBadge';
import { Radius, Shadows, Spacing } from '@/constants/Theme';
import { useTheme } from '@/hooks/useTheme';
import { haptics } from '@/utils/haptics';

const INDICATOR_SPRING = { damping: 24, stiffness: 280, mass: 0.8 };

type SegmentLayout = { x: number; width: number };

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
  const [layouts, setLayouts] = useState<Partial<Record<T, SegmentLayout>>>({});
  const target = layouts[value];
  const x = useSharedValue(0);
  const width = useSharedValue(0);

  useEffect(() => {
    if (!target) return;
    if (width.value === 0) {
      x.value = target.x;
      width.value = target.width;
    } else {
      x.value = withSpring(target.x, INDICATOR_SPRING);
      width.value = withSpring(target.width, INDICATOR_SPRING);
    }
  }, [target, x, width]);

  const indicatorStyle = useAnimatedStyle(() => ({
    width: width.value,
    transform: [{ translateX: x.value }],
  }));

  return (
    <View
      accessibilityRole="tablist"
      style={[
        styles.track,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border },
      ]}>
      {target ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.indicator,
            { backgroundColor: theme.background, borderColor: theme.border },
            indicatorStyle,
          ]}
        />
      ) : null}
      {segments.map((segment) => {
        const selected = segment.value === value;
        return (
          <Pressable
            key={segment.value}
            onLayout={({ nativeEvent: { layout } }) =>
              setLayouts((current) => {
                const known = current[segment.value];
                if (known && known.x === layout.x && known.width === layout.width) return current;
                return { ...current, [segment.value]: { x: layout.x, width: layout.width } };
              })
            }
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
              selected &&
                !target && [
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
  indicator: {
    position: 'absolute',
    top: Spacing.one,
    bottom: Spacing.one,
    left: 0,
    borderRadius: Radius.small,
    borderWidth: StyleSheet.hairlineWidth,
    ...Shadows.card,
  },
  label: {
    flexShrink: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 600,
  },
});
