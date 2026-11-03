import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Icon, type IconName } from '@/components/ui/Icon';
import { IconCircle } from '@/components/ui/IconCircle';
import { Radius, Shadows, Spacing, type ThemeColor } from '@/constants/Theme';
import type {
  AppNotification,
  NotificationKind,
} from '@/domain/notifications/interfaces/NotificationInterfaces';
import { useTheme } from '@/hooks/useTheme';

const CLOCK: IconName = { ios: 'clock', android: 'schedule' };
const DOCUMENT: IconName = { ios: 'doc', android: 'description' };
const WARNING: IconName = { ios: 'exclamationmark.triangle', android: 'warning' };

type KindStyle = { icon: IconName; color: ThemeColor; background: ThemeColor };

const amber = (icon: IconName): KindStyle => ({
  icon,
  color: 'toneAmberFg',
  background: 'toneAmberBg',
});
const blue = (icon: IconName): KindStyle => ({
  icon,
  color: 'toneBlueFg',
  background: 'toneBlueBg',
});

const KIND_STYLE: Record<NotificationKind, KindStyle> = {
  carePlanExpiring: amber(DOCUMENT),
  progressNoteDue: blue(DOCUMENT),
  officeMessage: blue({ ios: 'bubble.left', android: 'chat_bubble' }),
  coverageRequest: amber(WARNING),
  allotmentChanged: blue({ ios: 'envelope', android: 'mail' }),
  authorizationEnding: amber(WARNING),
  missedClockIn: amber(CLOCK),
  missedClockOut: amber(CLOCK),
  scheduleChange: blue({ ios: 'calendar', android: 'calendar_month' }),
  signaturePending: amber({ ios: 'signature', android: 'signature' }),
};

type NotificationCardProps = {
  notification: AppNotification;
  onPress?: (notification: AppNotification) => void;
};

export function NotificationCard({ notification, onPress }: NotificationCardProps) {
  const theme = useTheme();
  const kind = KIND_STYLE[notification.kind];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${notification.title}. ${notification.message}`}
      onPress={onPress ? () => onPress(notification) : undefined}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.background },
        pressed && styles.pressed,
      ]}>
      <IconCircle icon={kind.icon} color={kind.color} backgroundColor={kind.background} size={36} />
      <View style={styles.body}>
        <ThemedText numberOfLines={2} style={styles.title}>
          {notification.title}
        </ThemedText>
        <ThemedText numberOfLines={1} themeColor="textSecondary" style={styles.message}>
          {notification.message}
        </ThemedText>
      </View>
      <Icon
        name={{ ios: 'chevron.right', android: 'chevron_right' }}
        size={18}
        color={theme.textSecondary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three - Spacing.one,
    paddingVertical: Spacing.three - Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.medium,
    ...Shadows.card,
  },
  pressed: {
    opacity: 0.85,
  },
  body: {
    flex: 1,
    gap: Spacing.half,
  },
  title: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: 600,
  },
  message: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: 400,
  },
});
