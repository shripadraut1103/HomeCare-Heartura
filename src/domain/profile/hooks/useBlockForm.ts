import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import type { BlockedDay } from '@/domain/profile/interfaces/ProfileInterfaces';
import { blockDaySchema, type BlockDayFormValues } from '@/domain/profile/schemas/blockDaySchema';
import {
  createBlockDayAction,
  fetchBlockDaysAction,
  updateBlockDayAction,
  type BlockDayDraft,
} from '@/domain/profile/store/async-actions/AvailabilityAsyncActions';
import { setToastMessage } from '@/store/common-reducer/ToastReducer';
import { useAppDispatch } from '@/store/hooks';
import { parseIsoDate, parseTimeOfDay, toIsoDate, toTimeOfDay } from '@/utils/dateFormat';
import { haptics } from '@/utils/haptics';

const FIELD_NAMES: Record<string, keyof BlockDayFormValues> = {
  title: 'title',
  start_date: 'startDate',
  end_date: 'endDate',
  start_time: 'startTime',
  end_time: 'endTime',
};

const today = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

const defaultsFor = (block?: BlockedDay): BlockDayFormValues => {
  if (!block) {
    const date = today();
    return {
      title: '',
      startDate: date,
      endDate: date,
      specificHours: false,
      startTime: parseTimeOfDay('09:00', date),
      endTime: parseTimeOfDay('17:00', date),
      notifyOffice: true,
    };
  }
  const startDate = parseIsoDate(block.startDate);
  return {
    title: block.title,
    startDate,
    endDate: parseIsoDate(block.endDate),
    specificHours: block.hours !== undefined,
    startTime: parseTimeOfDay(block.hours?.start ?? '09:00', startDate),
    endTime: parseTimeOfDay(block.hours?.end ?? '17:00', startDate),
    notifyOffice: block.notifyOffice,
  };
};

const toDraft = (values: BlockDayFormValues): BlockDayDraft => ({
  title: values.title.trim(),
  startDate: toIsoDate(values.startDate),
  endDate: toIsoDate(values.endDate),
  hours: values.specificHours
    ? { start: toTimeOfDay(values.startTime), end: toTimeOfDay(values.endTime) }
    : undefined,
  notifyOffice: values.notifyOffice,
});

export function useBlockForm(block: BlockedDay | undefined, onSaved: () => void) {
  const dispatch = useAppDispatch();
  const [saving, setSaving] = useState(false);
  const form = useForm<BlockDayFormValues>({
    resolver: zodResolver(blockDaySchema),
    defaultValues: defaultsFor(block),
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

  const save = async (values: BlockDayFormValues) => {
    const draft = toDraft(values);
    setSaving(true);
    const result = block
      ? await dispatch(updateBlockDayAction({ id: block.id, draft }))
      : await dispatch(createBlockDayAction(draft));
    setSaving(false);
    const payload =
      createBlockDayAction.fulfilled.match(result) || updateBlockDayAction.fulfilled.match(result)
        ? result.payload
        : null;
    if (!payload || 'error' in payload) {
      haptics.error();
      let fieldError = false;
      for (const [apiField, messages] of Object.entries(payload?.fields ?? {})) {
        const name = FIELD_NAMES[apiField];
        if (name && messages[0]) {
          form.setError(name, { message: messages[0] });
          fieldError = true;
        }
      }
      if (payload?.code === 'EDIT_CONFLICT') void dispatch(fetchBlockDaysAction());
      if (!fieldError) {
        dispatch(
          setToastMessage({
            message:
              payload?.code === 'EDIT_CONFLICT'
                ? 'This block was changed somewhere else. We reloaded it; please try again.'
                : payload?.error || 'Couldn’t save this block. Try again.',
            type: 'error',
          })
        );
      }
      return;
    }
    haptics.success();
    dispatch(setToastMessage({ message: `${block ? 'Updated' : 'Blocked'}: ${draft.title}` }));
    onSaved();
  };

  const submit = () => {
    void form.handleSubmit(save, () => haptics.error())();
  };

  return { control: form.control, startDate, specificHours, saving, changeStartDate, submit };
}
