import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';

import { blockDaySchema, type BlockDayFormValues } from '@/domain/profile/schemas/blockDaySchema';
import { addBlockedDay } from '@/domain/profile/store/BlockDaysReducer';
import { setToastMessage } from '@/store/common-reducer/ToastReducer';
import { useAppDispatch } from '@/store/hooks';
import { parseTimeOfDay, toIsoDate, toTimeOfDay } from '@/utils/dateFormat';
import { haptics } from '@/utils/haptics';

const createDefaults = (): BlockDayFormValues => {
  const today = new Date();
  const date = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return {
    title: '',
    startDate: date,
    endDate: date,
    specificHours: false,
    startTime: parseTimeOfDay('09:00', date),
    endTime: parseTimeOfDay('17:00', date),
    notifyOffice: true,
  };
};

export function useAddBlockForm(onAdded: () => void) {
  const dispatch = useAppDispatch();
  const form = useForm<BlockDayFormValues>({
    resolver: zodResolver(blockDaySchema),
    defaultValues: createDefaults(),
  });
  const [startDate, specificHours] = useWatch({
    control: form.control,
    name: ['startDate', 'specificHours'],
  });

  const changeStartDate = (date: Date) => {
    form.setValue('startDate', date, { shouldDirty: true });
    if (toIsoDate(form.getValues('endDate')) < toIsoDate(date)) {
      form.setValue('endDate', date, { shouldDirty: true });
    }
    if (form.formState.isSubmitted) void form.trigger('endDate');
  };

  const submit = () => {
    void form.handleSubmit(
      (values) => {
        dispatch(
          addBlockedDay({
            id: `block-${Date.now()}`,
            title: values.title.trim(),
            startDate: toIsoDate(values.startDate),
            endDate: toIsoDate(values.endDate),
            hours: values.specificHours
              ? { start: toTimeOfDay(values.startTime), end: toTimeOfDay(values.endTime) }
              : undefined,
            notifyOffice: values.notifyOffice,
          })
        );
        dispatch(setToastMessage({ message: `Blocked: ${values.title.trim()}` }));
        haptics.success();
        onAdded();
      },
      () => haptics.error()
    )();
  };

  return { control: form.control, startDate, specificHours, changeStartDate, submit };
}
