import { useEffect } from 'react';
import { AccessibilityInfo, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';

import { useTabBarSpace } from '@/components/AppTabs';
import { ThemedText } from '@/components/ThemedText';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Radius, Shadows, Spacing } from '@/constants/Theme';
import { useTheme } from '@/hooks/useTheme';
import { clearToastMessage, type ToastType } from '@/store/common-reducer/ToastReducer';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { haptics } from '@/utils/haptics';

const VISIBLE_MS = 4000;
const VISIBLE_WITH_ACTION_MS = 6000;

const ICONS: Record<ToastType, IconName> = {
  success: { ios: 'checkmark.circle.fill', android: 'check_circle' },
  error: { ios: 'exclamationmark.circle.fill', android: 'error' },
  warning: { ios: 'exclamationmark.triangle.fill', android: 'warning' },
};

export function ToastHost() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const bottom = useTabBarSpace();
  const { message, type, action, id } = useAppSelector((state) => state.toast);

  useEffect(() => {
    if (!message) return;
    AccessibilityInfo.announceForAccessibility(message);
    const timer = setTimeout(
      () => dispatch(clearToastMessage()),
      action ? VISIBLE_WITH_ACTION_MS : VISIBLE_MS
    );
    return () => clearTimeout(timer);
    // `id` restarts the timer when a new toast replaces the current one.
  }, [id, message, action, dispatch]);

  if (!message) return null;

  const iconColor =
    type === 'success' ? theme.success : type === 'error' ? theme.error : theme.warning;

  return (
    <View pointerEvents="box-none" style={[styles.host, { bottom }]}>
      <Animated.View
        key={id}
        entering={FadeInDown.duration(220)}
        exiting={FadeOutDown.duration(180)}
        accessibilityLiveRegion="polite"
        style={[styles.toast, { backgroundColor: theme.text }]}>
        <Icon name={ICONS[type]} size={20} color={iconColor} />
        <ThemedText style={[styles.message, { color: theme.background }]}>{message}</ThemedText>
        {action ? (
          <Pressable
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => {
              haptics.tap();
              dispatch(action.onPress);
              dispatch(clearToastMessage());
            }}
            style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
            <ThemedText themeColor="primaryMuted" style={styles.actionLabel}>
              {action.label}
            </ThemedText>
          </Pressable>
        ) : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: Spacing.three,
    right: Spacing.three,
    alignItems: 'center',
  },
  toast: {
    width: '100%',
    maxWidth: 560,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two + Spacing.half,
    paddingVertical: Spacing.three - Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.medium,
    ...Shadows.floating,
  },
  message: {
    flex: 1,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: 500,
  },
  action: {
    paddingHorizontal: Spacing.one,
  },
  actionLabel: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: 700,
  },
  pressed: {
    opacity: 0.6,
  },
});
