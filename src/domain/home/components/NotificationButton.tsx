import { Pressable, StyleSheet } from 'react-native';

import { CountBadge } from '@/components/ui/CountBadge';
import { Icon } from '@/components/ui/Icon';
import { useTheme } from '@/hooks/useTheme';

const HIT_SIZE = 44;

type NotificationButtonProps = {
  unreadCount: number;
  onPress?: () => void;
};

export function NotificationButton({ unreadCount, onPress }: NotificationButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'
      }
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      <Icon name={{ ios: 'bell', android: 'notifications' }} size={28} color={theme.text} />
      <CountBadge count={unreadCount} style={styles.badge} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: HIT_SIZE,
    height: HIT_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
  },
  pressed: {
    opacity: 0.6,
  },
});
