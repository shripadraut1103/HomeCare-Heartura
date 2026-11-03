import { Controller, useFieldArray, useWatch, type Control } from 'react-hook-form';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Spacing } from '@/constants/Theme';
import { DEFAULT_SLOT } from '@/domain/profile/availability';
import { AppSwitch } from '@/domain/profile/components/AppSwitch';
import { DateTimeField } from '@/domain/profile/components/DateTimeField';
import type {
  AvailabilityFormValues,
  AvailabilitySlotValues,
} from '@/domain/profile/schemas/availabilitySchema';
import { useTheme } from '@/hooks/useTheme';
import { parseTimeOfDay } from '@/utils/dateFormat';

const DELETE_SLOT_WIDTH = 32;
const LAST_MINUTE = 23 * 60 + 59;

const minutesOf = (date: Date) => date.getHours() * 60 + date.getMinutes();
const atMinutes = (minutes: number) =>
  parseTimeOfDay(`${Math.floor(minutes / 60)}:${minutes % 60}`);

const nextSlot = (last: AvailabilitySlotValues | undefined): AvailabilitySlotValues => {
  if (!last)
    return { start: parseTimeOfDay(DEFAULT_SLOT.start), end: parseTimeOfDay(DEFAULT_SLOT.end) };
  const start = Math.min(minutesOf(last.end), LAST_MINUTE - 1);
  return { start: atMinutes(start), end: atMinutes(Math.min(start + 60, LAST_MINUTE)) };
};

type AvailabilityDayEditorProps = {
  control: Control<AvailabilityFormValues>;
  index: number;
  label: string;
  isLast: boolean;
};

export function AvailabilityDayEditor({
  control,
  index,
  label,
  isLast,
}: AvailabilityDayEditorProps) {
  const theme = useTheme();
  const { fields, append, remove } = useFieldArray({ control, name: `days.${index}.slots` });
  const [enabled, slots] = useWatch({
    control,
    name: [`days.${index}.enabled`, `days.${index}.slots`],
  });

  return (
    <View style={[styles.day, !isLast && [styles.divider, { borderBottomColor: theme.border }]]}>
      <View style={styles.header}>
        <ThemedText style={styles.dayName}>{label}</ThemedText>
        {enabled ? (
          <Button
            variant="link"
            title="Add slot"
            color="success"
            accessibilityLabel={`Add a time slot on ${label}`}
            onPress={() => append(nextSlot(slots.at(-1)))}
            icon={<Icon name={{ ios: 'plus', android: 'add' }} size={16} color={theme.success} />}
          />
        ) : (
          <ThemedText themeColor="textSecondary" style={styles.unavailable}>
            Not available
          </ThemedText>
        )}
        <Controller
          control={control}
          name={`days.${index}.enabled`}
          render={({ field }) => (
            <AppSwitch
              accessibilityLabel={`Available on ${label}`}
              value={field.value}
              onValueChange={(next) => {
                field.onChange(next);
                if (next && slots.length === 0) append(nextSlot(undefined));
              }}
            />
          )}
        />
      </View>

      {enabled
        ? fields.map((field, slotIndex) => (
            <Animated.View
              key={field.id}
              entering={FadeIn.duration(180)}
              exiting={FadeOut.duration(150)}
              layout={LinearTransition.duration(200)}
              style={styles.slot}>
              <Controller
                control={control}
                name={`days.${index}.slots.${slotIndex}.start`}
                render={({ field: start, fieldState }) => (
                  <DateTimeField
                    label={`${label} slot ${slotIndex + 1} start`}
                    hideLabel
                    mode="time"
                    value={start.value}
                    onChange={start.onChange}
                    error={fieldState.error?.message}
                  />
                )}
              />
              <ThemedText themeColor="textSecondary" style={styles.to}>
                to
              </ThemedText>
              <Controller
                control={control}
                name={`days.${index}.slots.${slotIndex}.end`}
                render={({ field: end, fieldState }) => (
                  <DateTimeField
                    label={`${label} slot ${slotIndex + 1} end`}
                    hideLabel
                    mode="time"
                    value={end.value}
                    onChange={end.onChange}
                    error={fieldState.error?.message}
                  />
                )}
              />
              <View style={styles.deleteSlot}>
                {fields.length > 1 ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${label} slot ${slotIndex + 1}`}
                    hitSlop={8}
                    onPress={() => remove(slotIndex)}>
                    <Icon
                      name={{ ios: 'trash', android: 'delete' }}
                      size={22}
                      color={theme.textSecondary}
                    />
                  </Pressable>
                ) : null}
              </View>
            </Animated.View>
          ))
        : null}
    </View>
  );
}

const styles = StyleSheet.create({
  day: {
    gap: Spacing.two,
    paddingBottom: Spacing.three,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    minHeight: 48,
  },
  dayName: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: 500,
  },
  unavailable: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: 400,
  },
  slot: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  to: {
    fontSize: 14,
    lineHeight: 48,
  },
  deleteSlot: {
    width: DELETE_SLOT_WIDTH,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
