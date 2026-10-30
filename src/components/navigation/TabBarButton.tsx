import type { TabTriggerSlotProps } from 'expo-router/ui';
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';
import { CountBadge } from '@/components/ui/CountBadge';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Radius, Spacing } from '@/constants/Theme';
import { useTheme } from '@/hooks/useTheme';
import { haptics } from '@/utils/haptics';

const INDICATOR_WIDTH = 60;
const INDICATOR_HEIGHT = 36;
const FOCUS_ANIMATION = { duration: 180 };

export type TabBarButtonProps = Omit<TabTriggerSlotProps, 'ref'> & {
  label: string;
  icon: IconName;
  badgeCount?: number;
};

export function TabBarButton({
  label,
  icon,
  badgeCount = 0,
  isFocused = false,
  onPress,
  ...pressableProps
}: TabBarButtonProps) {
  const theme = useTheme();
  const color = isFocused ? theme.primary : theme.textSecondary;

  const focus = useSharedValue(isFocused ? 1 : 0);
  useEffect(() => {
    focus.value = withTiming(isFocused ? 1 : 0, FOCUS_ANIMATION);
  }, [focus, isFocused]);

  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: focus.value,
    transform: [{ scaleX: 0.6 + focus.value * 0.4 }],
  }));

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={badgeCount > 0 ? `${label}, ${badgeCount} new` : label}
      onPress={(event) => {
        if (!isFocused) haptics.selection();
        onPress?.(event);
      }}
      {...pressableProps}
      style={styles.button}>
      <View style={styles.iconWrap}>
        <Animated.View
          style={[styles.indicator, { backgroundColor: theme.primaryMuted }, indicatorStyle]}
        />
        <Icon name={icon} size={24} color={color} />
        <CountBadge count={badgeCount} style={styles.badge} />
      </View>
      <ThemedText
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.85}
        style={[styles.label, { color }, isFocused && styles.labelFocused]}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexGrow: 1,
    alignItems: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.one,
  },
  iconWrap: {
    width: INDICATOR_WIDTH,
    height: INDICATOR_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator: {
    ...StyleSheet.absoluteFill,
    borderRadius: Radius.full,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: 4,
  },
  label: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: 500,
  },
  labelFocused: {
    fontWeight: 600,
  },
});
