import type { ReactNode } from 'react';
import { Controller } from 'react-hook-form';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';
import { AppSwitch } from '@/components/ui/AppSwitch';
import { DateTimeField } from '@/components/ui/DateTimeField';
import { FormTextField } from '@/components/ui/FormTextField';
import { RadioMark } from '@/components/ui/RadioList';
import { SegmentedControl, type Segment } from '@/components/ui/SegmentedControl';
import { Radius, Spacing } from '@/constants/Theme';
import { WEEKDAY_LETTERS, WEEKDAY_NAMES } from '@/domain/schedule/calendar';
import type { AppointmentForm } from '@/domain/schedule/hooks/useAppointmentForm';
import type { RepeatEnd, RepeatUnit } from '@/domain/schedule/recurrence';
import { useTheme } from '@/hooks/useTheme';
import { formatNumericDate } from '@/utils/dateFormat';
import { haptics } from '@/utils/haptics';

const WEEKDAY_SIZE = 42;
const UNIT_WIDTH = 140;

const UNITS: readonly Segment<RepeatUnit>[] = [
  { value: 'day', label: 'day' },
  { value: 'week', label: 'week' },
];

export function RepeatSection({ form }: { form: AppointmentForm }) {
  const theme = useTheme();
  const { values, errors } = form;

  return (
    <Animated.View
      layout={LinearTransition.duration(200)}
      style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Repeat Appointment</ThemedText>
        <AppSwitch
          accessibilityLabel="Repeat appointment"
          value={values.repeat}
          onValueChange={(repeat) => form.set('repeat', repeat)}
        />
      </View>

      {values.repeat ? (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(120)}
          style={styles.body}>
          <View style={styles.group}>
            <ThemedText themeColor="textSecondary" style={styles.label}>
              Repeat every
            </ThemedText>
            <View style={styles.everyRow}>
              <View style={styles.flex}>
                <FormTextField
                  control={form.control}
                  name="repeatEvery"
                  label="Repeat every"
                  hideLabel
                  keyboardType="number-pad"
                  maxLength={2}
                  returnKeyType="done"
                  style={styles.input}
                />
              </View>
              <View style={styles.unit}>
                <SegmentedControl
                  segments={UNITS}
                  value={values.repeatUnit}
                  onChange={(unit) => form.set('repeatUnit', unit)}
                />
              </View>
            </View>
          </View>

          {values.repeatUnit === 'week' ? (
            <View style={styles.group}>
              <ThemedText themeColor="textSecondary" style={styles.label}>
                Repeat on
              </ThemedText>
              <View style={styles.weekdays}>
                {WEEKDAY_LETTERS.map((letter, weekday) => {
                  const on = values.repeatDays.includes(weekday);
                  return (
                    <Pressable
                      key={WEEKDAY_NAMES[weekday]}
                      accessibilityRole="checkbox"
                      accessibilityLabel={WEEKDAY_NAMES[weekday]}
                      accessibilityState={{ checked: on }}
                      onPress={() => {
                        haptics.selection();
                        form.toggleRepeatDay(weekday);
                      }}
                      style={[
                        styles.weekday,
                        on
                          ? { backgroundColor: theme.primary, borderColor: theme.primary }
                          : { borderColor: theme.border },
                      ]}>
                      <ThemedText
                        themeColor={on ? 'onPrimary' : 'text'}
                        style={styles.weekdayLabel}>
                        {letter}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
              {errors.repeatDays?.message ? (
                <ThemedText type="small" themeColor="error" accessibilityRole="alert">
                  {errors.repeatDays.message}
                </ThemedText>
              ) : null}
            </View>
          ) : null}

          <View style={styles.group} accessibilityRole="radiogroup">
            <ThemedText themeColor="textSecondary" style={styles.label}>
              Ends
            </ThemedText>
            <EndOption form={form} value="never" label="Never" />
            <EndOption form={form} value="on" label="On">
              <Controller
                control={form.control}
                name="endsOn"
                render={({ field, fieldState }) => (
                  <DateTimeField
                    label="End date"
                    hideLabel
                    mode="date"
                    value={field.value}
                    minimumDate={values.date}
                    onChange={(date) => {
                      form.set('ends', 'on');
                      form.set('endsOn', date);
                    }}
                    error={fieldState.error?.message}
                  />
                )}
              />
            </EndOption>
            <EndOption form={form} value="after" label="After">
              <FormTextField
                control={form.control}
                name="endsAfter"
                label="Number of appointments"
                hideLabel
                keyboardType="number-pad"
                maxLength={3}
                returnKeyType="done"
                onFocus={() => form.set('ends', 'after')}
                style={styles.input}
              />
            </EndOption>
          </View>

          <ThemedText themeColor="accent" style={styles.summary}>
            {occurrenceSummary(form)}
          </ThemedText>
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

function occurrenceSummary({ occurrences, values }: AppointmentForm) {
  const count = occurrences.length;
  if (count === 0) return 'No appointments match these days.';
  const first = formatNumericDate(occurrences[0]);
  const last = formatNumericDate(occurrences[count - 1]);
  const noun = count === 1 ? 'appointment' : 'appointments';
  return values.ends === 'never'
    ? `${count} ${noun} over the next year · from ${first}`
    : `${count} ${noun} · ${first} to ${last}`;
}

type EndOptionProps = {
  form: AppointmentForm;
  value: RepeatEnd;
  label: string;
  children?: ReactNode;
};

function EndOption({ form, value, label, children }: EndOptionProps) {
  const selected = form.values.ends === value;

  return (
    <View style={styles.endRow}>
      <Pressable
        accessibilityRole="radio"
        accessibilityLabel={`Ends ${label.toLowerCase()}`}
        accessibilityState={{ checked: selected }}
        hitSlop={8}
        onPress={() => {
          if (selected) return;
          haptics.selection();
          form.set('ends', value);
        }}
        style={styles.endChoice}>
        <RadioMark selected={selected} />
        <ThemedText style={styles.endLabel}>{label}</ThemedText>
      </Pressable>
      {children ? <View style={styles.flex}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.three,
    borderRadius: Radius.large,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  title: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: 600,
  },
  body: {
    gap: Spacing.four,
    paddingTop: Spacing.four,
  },
  group: {
    gap: Spacing.two,
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 500,
  },
  everyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  flex: {
    flex: 1,
  },
  unit: {
    width: UNIT_WIDTH,
  },
  input: {
    minHeight: 48,
  },
  weekdays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekday: {
    width: WEEKDAY_SIZE,
    height: WEEKDAY_SIZE,
    borderRadius: WEEKDAY_SIZE / 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdayLabel: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: 600,
  },
  endRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    minHeight: 52,
  },
  endChoice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    minWidth: 84,
  },
  endLabel: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: 400,
  },
  summary: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: 500,
  },
});
