import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Icon, type IconName } from '@/components/ui/Icon';
import { IconCircle } from '@/components/ui/IconCircle';
import { Radius, Shadows, Spacing, type ThemeColor } from '@/constants/Theme';
import type {
  AppNotification,
  NotificationCategory,
} from '@/domain/notifications/interfaces/NotificationInterfaces';
import { useTheme } from '@/hooks/useTheme';
import { formatClockTime } from '@/utils/dateFormat';

const CATEGORY_ICON: Record<NotificationCategory, IconName> = {
  plans: { ios: 'doc', android: 'description' },
  office: { ios: 'bubble.left', android: 'chat_bubble' },
  evv: { ios: 'clock', android: 'schedule' },
};

type KindStyle = { icon: IconName; color: ThemeColor; background: ThemeColor };

const styleFor = (notification: AppNotification): KindStyle => ({
  icon: CATEGORY_ICON[notification.category],
  color: notification.level === 'attention' ? 'toneAmberFg' : 'toneBlueFg',
  background: notification.level === 'attention' ? 'toneAmberBg' : 'toneBlueBg',
});

type NotificationCardProps = {
  notification: AppNotification;
  onPress?: (notification: AppNotification) => void;
  openable?: boolean;
};

export function NotificationCard({
  notification,
  onPress,
  openable = true,
}: NotificationCardProps) {
  const theme = useTheme();
  const kind = styleFor(notification);
  const time = formatClockTime(new Date(notification.createdAt));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${notification.read ? '' : 'Unread. '}${notification.title}. ${notification.message}. ${time}`}
      onPress={onPress ? () => onPress(notification) : undefined}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.background },
        pressed && styles.pressed,
      ]}>
      <IconCircle icon={kind.icon} color={kind.color} backgroundColor={kind.background} size={36} />
      <View style={styles.body}>
        <ThemedText numberOfLines={2} style={[styles.title, notification.read && styles.titleRead]}>
          {notification.title}
        </ThemedText>
        {notification.message ? (
          <ThemedText numberOfLines={3} themeColor="textSecondary" style={styles.message}>
            {notification.message}
          </ThemedText>
        ) : null}
        <ThemedText themeColor="textSecondary" style={styles.time}>
          {time}
        </ThemedText>
      </View>
      <View style={styles.trailing}>
        {notification.read ? null : (
          <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} />
        )}
        {openable ? (
          <Icon
            name={{ ios: 'chevron.right', android: 'chevron_right' }}
            size={18}
            color={theme.textSecondary}
          />
        ) : null}
      </View>
    </Pressable>
  );
}

const UNREAD_DOT = 10;

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
  titleRead: {
    fontWeight: 500,
  },
  message: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: 400,
  },
  time: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: 400,
  },
  trailing: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  unreadDot: {
    width: UNREAD_DOT,
    height: UNREAD_DOT,
    borderRadius: UNREAD_DOT / 2,
  },
});
