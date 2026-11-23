import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useFocusEffect } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Spacing } from '@/constants/Theme';
import { ResourceGate } from '@/domain/patients/components/ChartListParts';
import { AddBlockSheet, type BlockSheetData } from '@/domain/profile/components/AddBlockSheet';
import { MenuRow, type MenuRowTone } from '@/domain/profile/components/MenuRow';
import { ProfileCard } from '@/domain/profile/components/ProfileCard';
import { SettingsScreenLayout } from '@/domain/profile/components/SettingsScreenLayout';
import { useBlockDaysLoader, useBlockedDays } from '@/domain/profile/hooks/useProfile';
import type { BlockedDay } from '@/domain/profile/interfaces/ProfileInterfaces';
import {
  deleteBlockDayAction,
  fetchBlockDaysAction,
  undoBlockDayRemoval,
} from '@/domain/profile/store/async-actions/AvailabilityAsyncActions';
import { useTheme } from '@/hooks/useTheme';
import { setToastMessage } from '@/store/common-reducer/ToastReducer';
import { useAppDispatch } from '@/store/hooks';
import { formatNumericDate, formatTime, parseIsoDate, parseTimeOfDay } from '@/utils/dateFormat';
import { haptics } from '@/utils/haptics';

const TONES: readonly MenuRowTone[] = ['blue', 'amber', 'teal', 'purple', 'rose'];

const formatTimeOfDay = (value: string) => formatTime(parseTimeOfDay(value)).toLowerCase();

const describeBlock = (block: BlockedDay) => {
  const start = formatNumericDate(parseIsoDate(block.startDate));
  const dates =
    block.endDate === block.startDate
      ? start
      : `${start} – ${formatNumericDate(parseIsoDate(block.endDate))}`;
  const hours = block.hours
    ? `${formatTimeOfDay(block.hours.start)} – ${formatTimeOfDay(block.hours.end)}`
    : 'All day';
  return [dates, hours, block.notifyOffice ? 'Office notified' : 'Not shared with office'].join(
    ' · '
  );
};

export default function BlockDaysScreen() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const blockedDays = useBlockedDays();
  const { loaded, error, reload } = useBlockDaysLoader();
  const sheet = useRef<BottomSheetModal<BlockSheetData>>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  useFocusEffect(reload);

  const remove = async (block: BlockedDay) => {
    haptics.tap();
    setRemoving(block.id);
    const result = await dispatch(deleteBlockDayAction(block));
    setRemoving(null);
    const payload = deleteBlockDayAction.fulfilled.match(result) ? result.payload : null;
    if (!payload || 'error' in payload) {
      haptics.error();
      if (payload?.code === 'EDIT_CONFLICT' || payload?.code === 'NOT_FOUND') {
        void dispatch(fetchBlockDaysAction());
      }
      dispatch(
        setToastMessage({
          message: payload?.error || `Couldn’t remove ${block.title}. Try again.`,
          type: 'error',
        })
      );
      return;
    }
    dispatch(
      setToastMessage({
        message: `Removed ${block.title}`,
        action: { label: 'Undo', onPress: undoBlockDayRemoval({ id: block.id }) },
      })
    );
  };

  return (
    <SettingsScreenLayout title="Block days" overlay={<AddBlockSheet ref={sheet} />}>
      <Button
        title="Add block"
        size="large"
        onPress={() => sheet.current?.present({})}
        icon={<Icon name={{ ios: 'plus', android: 'add' }} size={20} color={theme.onPrimary} />}
      />
      <View style={styles.section}>
        <SectionHeader title="Blocked days" />
        <ResourceGate state={{ loading: !loaded, loaded, error, retry: reload }}>
          {blockedDays.length === 0 ? (
            <EmptyState message="No blocked days. Add one when you’re not available." />
          ) : (
            <ProfileCard>
              {blockedDays.map((block, index) => (
                <Animated.View
                  key={block.id}
                  entering={FadeIn.duration(220)}
                  exiting={FadeOut.duration(180)}
                  layout={LinearTransition.duration(220)}>
                  <MenuRow
                    icon={{ ios: 'xmark.circle', android: 'cancel' }}
                    tone={TONES[index % TONES.length]}
                    title={block.title}
                    subtitle={describeBlock(block)}
                    chevron={false}
                    onPress={() => sheet.current?.present({ block })}
                    trailing={
                      removing === block.id ? (
                        <ActivityIndicator style={styles.delete} />
                      ) : (
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`Remove ${block.title}`}
                          hitSlop={8}
                          disabled={removing !== null}
                          onPress={() => void remove(block)}
                          style={({ pressed }) => [styles.delete, pressed && styles.pressed]}>
                          <Icon
                            name={{ ios: 'trash', android: 'delete' }}
                            size={22}
                            color={theme.textSecondary}
                          />
                        </Pressable>
                      )
                    }
                  />
                </Animated.View>
              ))}
            </ProfileCard>
          )}
        </ResourceGate>
      </View>
    </SettingsScreenLayout>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.three - Spacing.one,
  },
  delete: {
    padding: Spacing.one,
  },
  pressed: {
    opacity: 0.6,
  },
});
