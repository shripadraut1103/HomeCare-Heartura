import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Spacing } from '@/constants/Theme';
import { AddBlockSheet } from '@/domain/profile/components/AddBlockSheet';
import { MenuRow, type MenuRowTone } from '@/domain/profile/components/MenuRow';
import { ProfileCard } from '@/domain/profile/components/ProfileCard';
import { SettingsScreenLayout } from '@/domain/profile/components/SettingsScreenLayout';
import { useBlockedDays } from '@/domain/profile/hooks/useProfile';
import type { BlockedDay } from '@/domain/profile/interfaces/ProfileInterfaces';
import { addBlockedDay, removeBlockedDay } from '@/domain/profile/store/BlockDaysReducer';
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
  const addSheet = useRef<BottomSheetModal>(null);

  const remove = (block: BlockedDay) => {
    haptics.tap();
    dispatch(removeBlockedDay({ id: block.id }));
    dispatch(
      setToastMessage({
        message: `Removed ${block.title}`,
        action: { label: 'Undo', onPress: addBlockedDay(block) },
      })
    );
  };

  return (
    <SettingsScreenLayout title="Block days" overlay={<AddBlockSheet ref={addSheet} />}>
      <Button
        title="Add block"
        size="large"
        onPress={() => addSheet.current?.present()}
        icon={<Icon name={{ ios: 'plus', android: 'add' }} size={20} color={theme.onPrimary} />}
      />
      <View style={styles.section}>
        <SectionHeader title="Blocked days" />
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
                  trailing={
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Remove ${block.title}`}
                      hitSlop={8}
                      onPress={() => remove(block)}
                      style={({ pressed }) => [styles.delete, pressed && styles.pressed]}>
                      <Icon
                        name={{ ios: 'trash', android: 'delete' }}
                        size={22}
                        color={theme.textSecondary}
                      />
                    </Pressable>
                  }
                />
              </Animated.View>
            ))}
          </ProfileCard>
        )}
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
