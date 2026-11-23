import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { getCurrentRange, WEEKDAYS } from '@/domain/profile/availability';
import { rangeId } from '@/domain/profile/availabilityMapper';
import { useAvailabilityRanges } from '@/domain/profile/hooks/useProfile';
import type { AvailabilityRange, TimeSlot } from '@/domain/profile/interfaces/ProfileInterfaces';
import {
  availabilitySchema,
  type AvailabilityFormValues,
} from '@/domain/profile/schemas/availabilitySchema';
import {
  fetchWeeklyHoursAction,
  saveWeeklyHoursAction,
} from '@/domain/profile/store/async-actions/AvailabilityAsyncActions';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import { setToastMessage } from '@/store/common-reducer/ToastReducer';
import { useAppDispatch } from '@/store/hooks';
import { confirm } from '@/utils/confirm';
import { parseIsoDate, parseTimeOfDay, toIsoDate, toTimeOfDay } from '@/utils/dateFormat';
import { haptics } from '@/utils/haptics';

const WEEKDAYS_ON: AvailabilityRange['days'] = {
  mon: [{ start: '09:00', end: '17:00' }],
  tue: [{ start: '09:00', end: '17:00' }],
  wed: [{ start: '09:00', end: '17:00' }],
  thu: [{ start: '09:00', end: '17:00' }],
  fri: [{ start: '09:00', end: '17:00' }],
  sat: [],
  sun: [],
};

const toFormSlot = (slot: TimeSlot) => ({
  start: parseTimeOfDay(slot.start),
  end: parseTimeOfDay(slot.end),
});

const toFormDays = (days: AvailabilityRange['days']): AvailabilityFormValues['days'] =>
  WEEKDAYS.map(({ id }) => ({
    weekday: id,
    enabled: days[id].length > 0,
    slots: days[id].map(toFormSlot),
  }));

const today = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

const aYearLater = (date: Date) =>
  new Date(date.getFullYear() + 1, date.getMonth(), date.getDate() - 1);

const overlaps = (a: AvailabilityRange, b: AvailabilityRange) =>
  a.startDate <= b.endDate && b.startDate <= a.endDate;

export function useAvailabilityForm(id: string | undefined) {
  const dispatch = useAppDispatch();
  const ranges = useAvailabilityRanges();
  const existing = id ? ranges.find((range) => range.id === id) : undefined;
  const [saving, setSaving] = useState(false);

  const form = useForm<AvailabilityFormValues>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: existing
      ? {
          startDate: parseIsoDate(existing.startDate),
          endDate: parseIsoDate(existing.endDate),
          days: toFormDays(existing.days),
        }
      : {
          startDate: today(),
          endDate: aYearLater(today()),
          days: toFormDays(getCurrentRange(ranges)?.days ?? WEEKDAYS_ON),
        },
  });
  const { leave } = useUnsavedChangesGuard(
    form.formState.isDirty,
    'Your changes to this availability won’t be saved.'
  );

  const save = async (next: AvailabilityRange[], success: string) => {
    setSaving(true);
    const result = await dispatch(saveWeeklyHoursAction(next));
    setSaving(false);
    const payload = saveWeeklyHoursAction.fulfilled.match(result) ? result.payload : null;
    if (!payload || 'error' in payload) {
      haptics.error();
      const conflict = payload?.code === 'EDIT_CONFLICT';
      if (conflict) void dispatch(fetchWeeklyHoursAction());
      dispatch(
        setToastMessage({
          message: conflict
            ? 'Your availability was changed somewhere else. We reloaded it; please try again.'
            : payload?.error || 'Couldn’t save your availability. Try again.',
          type: 'error',
        })
      );
      return false;
    }
    haptics.success();
    dispatch(setToastMessage({ message: success }));
    return true;
  };

  const submit = () => {
    form.clearErrors('root.noDays');
    void form.handleSubmit(
      async (values) => {
        if (!values.days.some((day) => day.enabled)) {
          haptics.error();
          form.setError('root.noDays', { message: 'Turn on at least one day.' });
          return;
        }
        const days = Object.fromEntries(
          values.days.map((day) => [
            day.weekday,
            day.enabled
              ? day.slots
                  .map((slot) => ({ start: toTimeOfDay(slot.start), end: toTimeOfDay(slot.end) }))
                  .sort((a, b) => a.start.localeCompare(b.start))
              : [],
          ])
        ) as AvailabilityRange['days'];
        const startDate = toIsoDate(values.startDate);
        const endDate = toIsoDate(values.endDate);
        const range: AvailabilityRange = {
          id: rangeId(startDate, endDate),
          startDate,
          endDate,
          days,
        };
        const others = ranges.filter((other) => other.id !== existing?.id);
        if (others.some((other) => overlaps(other, range))) {
          haptics.error();
          form.setError('startDate', {
            message: 'These dates overlap another availability range.',
          });
          return;
        }
        const next = [...others, range].sort((a, b) => a.startDate.localeCompare(b.startDate));
        if (await save(next, 'Availability saved')) leave();
      },
      () => haptics.error()
    )();
  };

  const remove = async () => {
    if (!existing) return;
    const confirmed = await confirm({
      title: 'Delete this availability?',
      message: 'Your preferred hours for these dates will be removed.',
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!confirmed) return;
    const next = ranges.filter((range) => range.id !== existing.id);
    if (await save(next, 'Availability deleted')) leave();
  };

  return {
    control: form.control,
    setValue: form.setValue,
    getValues: form.getValues,
    isEditing: existing !== undefined,
    notFound: id !== undefined && existing === undefined,
    noDaysError: form.formState.errors.root?.noDays?.message,
    saving,
    submit,
    remove: () => void remove(),
  };
}

export type AvailabilityForm = ReturnType<typeof useAvailabilityForm>;
