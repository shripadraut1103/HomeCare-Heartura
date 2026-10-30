import {
  BottomSheetFlatList,
  useBottomSheetModal,
  type BottomSheetModal,
} from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import { useState, type Ref } from 'react';
import { StyleSheet, useWindowDimensions, View, type ListRenderItem } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppBottomSheet } from '@/components/sheet/AppBottomSheet';
import { SheetHeader } from '@/components/sheet/SheetHeader';
import { ThemedText } from '@/components/ThemedText';
import { Icon } from '@/components/ui/Icon';
import { SegmentedControl, type Segment } from '@/components/ui/SegmentedControl';
import { Spacing } from '@/constants/Theme';
import { NotificationCard } from '@/domain/notifications/components/NotificationCard';
import { useNotifications } from '@/domain/notifications/hooks/useNotifications';
import type {
  AppNotification,
  NotificationCategory,
} from '@/domain/notifications/interfaces/NotificationInterfaces';
import { getNotificationTarget } from '@/domain/notifications/notificationTargets';
import { useTheme } from '@/hooks/useTheme';

const MAX_HEIGHT_RATIO = 0.92;

const CATEGORIES: readonly { value: NotificationCategory; label: string; footnote?: string }[] = [
  { value: 'plansProgress', label: 'Plans & progress' },
  { value: 'office', label: 'From office' },
  {
    value: 'evvSchedule',
    label: 'EVV & schedule',
    footnote: 'Clock-out reminders pop up in the app 5 minutes before the visit ends.',
  },
];

const STICKY_HEADER = [0];

const keyExtractor = (notification: AppNotification) => notification.id;

type NotificationsSheetProps = {
  ref: Ref<BottomSheetModal<undefined>>;
  onOpenVisit: (visitId: string) => void;
};

export function NotificationsSheet({ ref, onOpenVisit }: NotificationsSheetProps) {
  const { height } = useWindowDimensions();

  return (
    <AppBottomSheet<undefined> ref={ref} maxDynamicContentSize={height * MAX_HEIGHT_RATIO}>
      <NotificationsContent onOpenVisit={onOpenVisit} />
    </AppBottomSheet>
  );
}

function NotificationsContent({ onOpenVisit }: Pick<NotificationsSheetProps, 'onOpenVisit'>) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { dismiss } = useBottomSheetModal();
  const notifications = useNotifications();
  const [category, setCategory] = useState<NotificationCategory>('evvSchedule');

  const segments: Segment<NotificationCategory>[] = CATEGORIES.map(({ value, label }) => ({
    value,
    label,
    count: notifications.filter((notification) => notification.category === value).length,
  }));
  const visible = notifications.filter((notification) => notification.category === category);
  const footnote = CATEGORIES.find(({ value }) => value === category)?.footnote;

  const openNotification = (notification: AppNotification) => {
    const target = getNotificationTarget(notification);
    if (!target) return;
    if (target.type === 'visit') {
      onOpenVisit(target.visitId);
    } else {
      dismiss();
      router.push(target.href);
    }
  };

  const renderNotification: ListRenderItem<AppNotification> = ({ item }) => (
    <View style={styles.item}>
      <NotificationCard notification={item} onPress={openNotification} />
    </View>
  );

  const listHeader = (
    <View style={{ backgroundColor: theme.background }}>
      <SheetHeader title="Notifications" onClose={() => dismiss()} />
      <View style={styles.tabs}>
        <SegmentedControl segments={segments} value={category} onChange={setCategory} />
      </View>
    </View>
  );

  return (
    <BottomSheetFlatList
      data={visible}
      keyExtractor={keyExtractor}
      renderItem={renderNotification}
      ListHeaderComponent={listHeader}
      stickyHeaderIndices={STICKY_HEADER}
      ItemSeparatorComponent={Separator}
      contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.four }}
      ListEmptyComponent={
        <ThemedText themeColor="textSecondary" style={styles.empty}>
          You’re all caught up.
        </ThemedText>
      }
      ListFooterComponent={
        footnote ? (
          <View style={styles.footnote}>
            <Icon
              name={{ ios: 'info.circle', android: 'info' }}
              size={16}
              color={theme.textSecondary}
            />
            <ThemedText themeColor="textSecondary" style={styles.footnoteText}>
              {footnote}
            </ThemedText>
          </View>
        ) : undefined
      }
    />
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  tabs: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.three,
  },
  item: {
    paddingHorizontal: Spacing.three,
  },
  separator: {
    height: Spacing.three - Spacing.one,
  },
  empty: {
    textAlign: 'center',
    paddingVertical: Spacing.five,
  },
  footnote: {
    paddingHorizontal: Spacing.three,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    paddingTop: Spacing.three,
  },
  footnoteText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 400,
  },
});
