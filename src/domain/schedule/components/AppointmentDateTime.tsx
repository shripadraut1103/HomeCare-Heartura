import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { DateTimeField } from '@/components/ui/DateTimeField';
import { FormTextField } from '@/components/ui/FormTextField';
import { Radius, Spacing } from '@/constants/Theme';
import { addMonths, formatMonthYear, isSameMonth, startOfMonth } from '@/domain/schedule/calendar';
import { CalendarNav } from '@/domain/schedule/components/CalendarNav';
import { MonthGrid } from '@/domain/schedule/components/MonthGrid';
import type { AppointmentForm } from '@/domain/schedule/hooks/useAppointmentForm';
import { useTheme } from '@/hooks/useTheme';
import { formatNumericDate, formatTime } from '@/utils/dateFormat';

const shortWeekday = new Intl.DateTimeFormat('en-US', { weekday: 'short' });

export function AppointmentDateTime({ form }: { form: AppointmentForm }) {
  const theme = useTheme();
  const { values } = form;
  const [month, setMonth] = useState(() => startOfMonth(values.date));
  const today = new Date();

  const selectDay = (day: Date) => {
    if (!isSameMonth(day, month)) setMonth(startOfMonth(day));
    form.changeDate(day);
  };

  return (
    <View style={styles.field}>
      <ThemedText themeColor="textSecondary" style={styles.label}>
        Date & Time
        <ThemedText themeColor="error">{'  *'}</ThemedText>
      </ThemedText>
      <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
        <CalendarNav
          label={formatMonthYear(month)}
          previousLabel="Previous month"
          nextLabel="Next month"
          onPrevious={() => {
            if (!isSameMonth(month, today)) setMonth((current) => addMonths(current, -1));
          }}
          onNext={() => setMonth((current) => addMonths(current, 1))}
        />
        <MonthGrid
          month={month}
          selected={values.date}
          onSelect={selectDay}
          markedDays={form.markedDays}
          isDisabled={form.isPast}
        />

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <ThemedText style={styles.date}>
          {shortWeekday.format(values.date)}
          <ThemedText themeColor="textSecondary" style={styles.dateValue}>
            {` ${formatNumericDate(values.date)}`}
          </ThemedText>
        </ThemedText>

        <View style={styles.pair}>
          <Controller
            control={form.control}
            name="startTime"
            render={({ field, fieldState }) => (
              <DateTimeField
                label="Start time"
                mode="time"
                required
                value={field.value}
                onChange={(time) => form.set('startTime', time)}
                error={fieldState.error?.message}
              />
            )}
          />
          <View style={styles.flex}>
            <FormTextField
              control={form.control}
              name="duration"
              label="Duration (min)"
              required
              labelStyle={styles.inputLabel}
              keyboardType="number-pad"
              maxLength={3}
              returnKeyType="done"
              style={styles.input}
            />
          </View>
        </View>

        <View style={styles.scheduled}>
          <ThemedText themeColor="textSecondary" style={styles.inputLabel}>
            Scheduled time
          </ThemedText>
          {form.dayVisits.length === 0 ? (
            <ThemedText themeColor="textSecondary" style={styles.slotText}>
              Nothing else is booked this day.
            </ThemedText>
          ) : (
            form.dayVisits.map((visit) => {
              const start = new Date(visit.startsAt);
              const end = new Date(start.getTime() + visit.durationMinutes * 60_000);
              const overlaps = form.overlapping.has(visit.id);
              return (
                <View
                  key={visit.id}
                  accessibilityLabel={`${formatTime(start)} to ${formatTime(end)}, ${visit.patientName}${overlaps ? ', overlaps' : ''}`}
                  style={[
                    styles.slot,
                    { backgroundColor: overlaps ? theme.toneAmberBg : theme.surfaceMuted },
                  ]}>
                  <ThemedText themeColor="textSecondary" style={styles.slotText}>
                    {`${formatTime(start)} – ${formatTime(end)}`}
                  </ThemedText>
                  <ThemedText numberOfLines={1} style={[styles.slotText, styles.slotName]}>
                    {visit.patientName}
                  </ThemedText>
                  {overlaps ? (
                    <ThemedText themeColor="toneAmberFg" style={[styles.slotText, styles.overlaps]}>
                      Overlaps
                    </ThemedText>
                  ) : null}
                </View>
              );
            })
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: Spacing.two,
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 500,
  },
  card: {
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.large,
    borderWidth: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  date: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: 600,
  },
  dateValue: {
    fontWeight: 400,
  },
  pair: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  flex: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 500,
  },
  input: {
    minHeight: 48,
  },
  scheduled: {
    gap: Spacing.two,
  },
  slot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three - Spacing.one,
    paddingVertical: Spacing.two,
    borderRadius: Radius.small,
  },
  slotText: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: 400,
  },
  slotName: {
    flex: 1,
    fontWeight: 600,
  },
  overlaps: {
    fontWeight: 600,
  },
});
