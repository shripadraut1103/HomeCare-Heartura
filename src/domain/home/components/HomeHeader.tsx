import { StyleSheet, View } from 'react-native';

import { BrandLogo } from '@/components/BrandLogo';
import { ThemedText } from '@/components/ThemedText';
import { Spacing } from '@/constants/Theme';
import { NotificationButton } from '@/domain/home/components/NotificationButton';
import { formatLongDate } from '@/utils/dateFormat';

type HomeHeaderProps = {
  date: Date;
  unreadNotifications: number;
  onNotificationsPress?: () => void;
};

export function HomeHeader({ date, unreadNotifications, onNotificationsPress }: HomeHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.brand}>
        <BrandLogo height={40} />
        <ThemedText themeColor="textSecondary" style={styles.date}>
          {formatLongDate(date)}
        </ThemedText>
      </View>
      <NotificationButton unreadCount={unreadNotifications} onPress={onNotificationsPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: Spacing.two,
  },
  brand: {
    gap: Spacing.one,
  },
  date: {
    fontSize: 15,
    fontWeight: 400,
  },
});
