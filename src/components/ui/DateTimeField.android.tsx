import { DatePickerDialog, Host, TimePickerDialog } from '@expo/ui/jetpack-compose';
import { useState } from 'react';

import {
  DateTimeFieldBox,
  DateTimeValueText,
  type DateTimeFieldProps,
} from '@/components/ui/DateTimeFieldBox';
import { useTheme } from '@/hooks/useTheme';

const toUtcMidnight = (date: Date) =>
  new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

const fromUtcMidnight = (date: Date) =>
  new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());

export function DateTimeField({
  value,
  onChange,
  onClear,
  minimumDate,
  ...boxProps
}: DateTimeFieldProps) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const initial = value ?? minimumDate ?? new Date();

  return (
    <>
      <DateTimeFieldBox
        {...boxProps}
        hasValue={value !== null}
        onClear={onClear}
        focused={open}
        onPress={() => setOpen(true)}>
        <DateTimeValueText value={value} mode={boxProps.mode} />
      </DateTimeFieldBox>
      {open ? (
        <Host matchContents>
          {boxProps.mode === 'date' ? (
            <DatePickerDialog
              initialDate={toUtcMidnight(initial).toISOString()}
              selectableDates={minimumDate ? { start: toUtcMidnight(minimumDate) } : undefined}
              color={theme.primary}
              onDateSelected={(date) => {
                onChange(fromUtcMidnight(date));
                close();
              }}
              onDismissRequest={close}
            />
          ) : (
            <TimePickerDialog
              initialDate={initial.toISOString()}
              color={theme.primary}
              onDateSelected={(date) => {
                onChange(date);
                close();
              }}
              onDismissRequest={close}
            />
          )}
        </Host>
      ) : null}
    </>
  );
}
