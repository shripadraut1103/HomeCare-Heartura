import {
  BottomSheetFlatList,
  useBottomSheetModal,
  type BottomSheetModal,
} from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import { useEffect, useState, type Ref } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
  type ListRenderItem,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppBottomSheet } from '@/components/sheet/AppBottomSheet';
import { SheetHeader } from '@/components/sheet/SheetHeader';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { InfoNote } from '@/components/ui/InfoNote';
import { SegmentedControl, type Segment } from '@/components/ui/SegmentedControl';
import { Spacing } from '@/constants/Theme';
import { NotificationCard } from '@/domain/notifications/components/NotificationCard';
import {
  useMarkNotificationsRead,
  useNotificationDays,
  useNotificationList,
} from '@/domain/notifications/hooks/useNotifications';
import type {
  AppNotification,
  NotificationCategory,
} from '@/domain/notifications/interfaces/NotificationInterfaces';
import { NOTIFICATION_CATEGORIES } from '@/domain/notifications/notificationMapper';
import { getNotificationTarget } from '@/domain/notifications/notificationTargets';
import { useTheme } from '@/hooks/useTheme';
import { useAppSelector } from '@/store/hooks';
import { formatRelativeDay, parseIsoDate } from '@/utils/dateFormat';
import { haptics } from '@/utils/haptics';

const MAX_HEIGHT_RATIO = 0.92;

const CATEGORY_LABELS: Record<NotificationCategory, string> = {
  plans: 'Plans & progress',
  office: 'From office',
  evv: 'EVV & schedule',
};

const FOOTNOTES: Partial<Record<NotificationCategory, string>> = {
  evv: 'Clock-out reminders pop up in the app 5 minutes before the visit ends.',
};

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
  const unread = useAppSelector((state) => state.notifications.unread);
  const markRead = useMarkNotificationsRead();
  const days = useNotificationDays();
  const [dayIndex, setDayIndex] = useState(0);
  const [category, setCategory] = useState<NotificationCategory>(
    () => NOTIFICATION_CATEGORIES.find((value) => unread.byCategory[value] > 0) ?? 'evv'
  );
  const safeIndex = Math.min(dayIndex, Math.max(0, days.days.length - 1));
  const day = days.days[safeIndex];
  const list = useNotificationList(day?.date, category);
  const { reload: reloadDays } = days;
  const { reload: reloadList } = list;

  useEffect(() => reloadDays(), [reloadDays]);
  useEffect(() => reloadList(), [reloadList]);

  const segments: Segment<NotificationCategory>[] = NOTIFICATION_CATEGORIES.map((value) => ({
    value,
    label: CATEGORY_LABELS[value],
    count: unread.byCategory[value],
  }));
  const footnote = FOOTNOTES[category];

  const openNotification = (notification: AppNotification) => {
    if (!notification.read) markRead([notification.id]);
    const target = getNotificationTarget(notification);
    if (!target) return;
    if (target.type === 'visit') {
      onOpenVisit(target.visitId);
    } else {
      dismiss();
      router.push(target.href);
    }
  };

  const markAllRead = () => {
    haptics.tap();
    markRead();
  };

  const renderNotification: ListRenderItem<AppNotification> = ({ item }) => (
    <View style={styles.item}>
      <NotificationCard
        notification={item}
        onPress={openNotification}
        openable={getNotificationTarget(item) !== null}
      />
    </View>
  );

  const stepDay = (step: number) => {
    haptics.selection();
    setDayIndex(safeIndex + step);
  };

  const listHeader = (
    <View style={{ backgroundColor: theme.background }}>
      <SheetHeader title="Notifications" onClose={() => dismiss()} />
      <View style={styles.tabs}>
        <SegmentedControl segments={segments} value={category} onChange={setCategory} />
        {day ? (
          <View style={styles.dayRow}>
            <DayArrow
              direction="older"
              disabled={safeIndex >= days.days.length - 1}
              onPress={() => stepDay(1)}
            />
            <View style={styles.dayLabel}>
              <ThemedText style={styles.dayText}>
                {formatRelativeDay(parseIsoDate(day.date))}
              </ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.dayMeta}>
                {day.unread > 0 ? `${day.unread} unread` : `${day.count} total`}
              </ThemedText>
            </View>
            <DayArrow direction="newer" disabled={safeIndex === 0} onPress={() => stepDay(-1)} />
          </View>
        ) : null}
        {unread.total > 0 ? (
          <Button
            variant="link"
            size="small"
            title="Mark all as read"
            style={styles.markAll}
            onPress={markAllRead}
          />
        ) : null}
      </View>
    </View>
  );

  const loading = (days.loading && !days.loaded) || (list.loading && !list.loaded);
  const error = days.error && !days.loaded ? days.error : list.loaded ? null : list.error;

  return (
    <BottomSheetFlatList
      data={list.notifications}
      keyExtractor={keyExtractor}
      renderItem={renderNotification}
      ListHeaderComponent={listHeader}
      stickyHeaderIndices={STICKY_HEADER}
      ItemSeparatorComponent={Separator}
      contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.four }}
      ListEmptyComponent={
        loading ? (
          <ActivityIndicator style={styles.state} accessibilityLabel="Loading notifications" />
        ) : error ? (
          <View style={styles.state}>
            <ThemedText themeColor="textSecondary" style={styles.empty}>
              {error}
            </ThemedText>
            <Button
              title="Try again"
              variant="secondary"
              size="small"
              onPress={() => (days.loaded ? reloadList() : reloadDays())}
            />
          </View>
        ) : (
          <ThemedText themeColor="textSecondary" style={[styles.empty, styles.state]}>
            {day ? 'Nothing in this tab on this day.' : 'You’re all caught up.'}
          </ThemedText>
        )
      }
      ListFooterComponent={
        footnote ? <InfoNote text={footnote} style={styles.footnote} /> : undefined
      }
    />
  );
}

function DayArrow({
  direction,
  disabled,
  onPress,
}: {
  direction: 'older' | 'newer';
  disabled: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  const older = direction === 'older';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={older ? 'Earlier day' : 'Later day'}
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [
        styles.arrow,
        { borderColor: theme.border },
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}>
      <Icon
        name={
          older
            ? { ios: 'chevron.left', android: 'chevron_left' }
            : { ios: 'chevron.right', android: 'chevron_right' }
        }
        size={18}
        color={theme.text}
      />
    </Pressable>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const ARROW_SIZE = 40;

const styles = StyleSheet.create({
  tabs: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.three,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  dayLabel: {
    flex: 1,
    alignItems: 'center',
  },
  dayText: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: 600,
  },
  dayMeta: {
    fontSize: 14,
    lineHeight: 19,
  },
  arrow: {
    width: ARROW_SIZE,
    height: ARROW_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: ARROW_SIZE / 2,
  },
  disabled: {
    opacity: 0.35,
  },
  pressed: {
    opacity: 0.6,
  },
  markAll: {
    alignSelf: 'flex-end',
  },
  item: {
    paddingHorizontal: Spacing.three,
  },
  separator: {
    height: Spacing.three - Spacing.one,
  },
  state: {
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.five,
  },
  empty: {
    textAlign: 'center',
  },
  footnote: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
  },
});
