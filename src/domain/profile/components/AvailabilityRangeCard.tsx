import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Spacing } from '@/constants/Theme';
import { formatRangeDates, formatSlot, WEEKDAYS } from '@/domain/profile/availability';
import { ProfileCard } from '@/domain/profile/components/ProfileCard';
import type { AvailabilityRange } from '@/domain/profile/interfaces/ProfileInterfaces';
import { useTheme } from '@/hooks/useTheme';

const DAY_COLUMN_WIDTH = 56;

type AvailabilityRangeCardProps = {
  range: AvailabilityRange;
  onEdit: (range: AvailabilityRange) => void;
};

export function AvailabilityRangeCard({ range, onEdit }: AvailabilityRangeCardProps) {
  const theme = useTheme();
  const dates = formatRangeDates(range);

  return (
    <ProfileCard padded>
      <View style={styles.header}>
        <Icon
          name={{ ios: 'calendar', android: 'calendar_month' }}
          size={22}
          color={theme.primary}
        />
        <ThemedText accessibilityRole="header" style={styles.dates}>
          {dates}
        </ThemedText>
        <Button
          variant="link"
          title="Edit"
          color="textSecondary"
          accessibilityLabel={`Edit availability ${dates}`}
          onPress={() => onEdit(range)}
          icon={
            <Icon name={{ ios: 'pencil', android: 'edit' }} size={18} color={theme.textSecondary} />
          }
        />
      </View>
      {WEEKDAYS.map((day, index) => {
        const slots = range.days[day.id];
        const hours = slots.length > 0 ? slots.map(formatSlot).join('  ·  ') : 'Not available';
        return (
          <View
            key={day.id}
            accessible
            accessibilityLabel={`${day.long}, ${hours}`}
            style={[
              styles.row,
              index < WEEKDAYS.length - 1 && [styles.divider, { borderBottomColor: theme.border }],
            ]}>
            <ThemedText style={styles.day}>{day.short}</ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.hours}>
              {hours}
            </ThemedText>
          </View>
        );
      })}
    </ProfileCard>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two + Spacing.one,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  dates: {
    flex: 1,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: 700,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three - Spacing.one,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  day: {
    width: DAY_COLUMN_WIDTH,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: 600,
  },
  hours: {
    flex: 1,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: 400,
  },
});
