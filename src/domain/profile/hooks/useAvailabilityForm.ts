import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { getCurrentRange, WEEKDAYS } from '@/domain/profile/availability';
import { useAvailabilityRanges } from '@/domain/profile/hooks/useProfile';
import type { AvailabilityRange, TimeSlot } from '@/domain/profile/interfaces/ProfileInterfaces';
import {
  availabilitySchema,
  type AvailabilityFormValues,
} from '@/domain/profile/schemas/availabilitySchema';
import { removeAvailability, saveAvailability } from '@/domain/profile/store/AvailabilityReducer';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import { setToastMessage } from '@/store/common-reducer/ToastReducer';
import { useAppDispatch } from '@/store/hooks';
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

export function useAvailabilityForm(rangeId: string | undefined) {
  const dispatch = useAppDispatch();
  const ranges = useAvailabilityRanges();
  const existing = rangeId ? ranges.find((range) => range.id === rangeId) : undefined;

  const form = useForm<AvailabilityFormValues>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: existing
      ? {
          startDate: parseIsoDate(existing.startDate),
          endDate: existing.endDate ? parseIsoDate(existing.endDate) : null,
          days: toFormDays(existing.days),
        }
      : {
          startDate: today(),
          endDate: null,
          days: toFormDays(getCurrentRange(ranges)?.days ?? WEEKDAYS_ON),
        },
  });
  const { leave } = useUnsavedChangesGuard(
    form.formState.isDirty,
    'Your changes to this availability won’t be saved.'
  );

  const submit = () => {
    form.clearErrors('root.noDays');
    void form.handleSubmit(
      (values) => {
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
        dispatch(
          saveAvailability({
            id: existing?.id ?? `availability-${Date.now()}`,
            startDate: toIsoDate(values.startDate),
            endDate: values.endDate ? toIsoDate(values.endDate) : undefined,
            days,
          })
        );
        dispatch(setToastMessage({ message: 'Availability saved' }));
        haptics.success();
        leave();
      },
      () => haptics.error()
    )();
  };

  const remove = () => {
    if (!existing) return;
    haptics.tap();
    dispatch(removeAvailability({ id: existing.id }));
    dispatch(
      setToastMessage({
        message: 'Availability deleted',
        action: { label: 'Undo', onPress: saveAvailability(existing) },
      })
    );
    leave();
  };

  return {
    control: form.control,
    setValue: form.setValue,
    getValues: form.getValues,
    isEditing: existing !== undefined,
    notFound: rangeId !== undefined && existing === undefined,
    noDaysError: form.formState.errors.root?.noDays?.message,
    submit,
    remove,
  };
}

export type AvailabilityForm = ReturnType<typeof useAvailabilityForm>;
