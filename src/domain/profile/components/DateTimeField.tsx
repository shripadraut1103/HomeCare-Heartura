import { useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';

import {
  DateTimeFieldBox,
  fieldPlaceholder,
  formatFieldValue,
  type DateTimeFieldProps,
} from '@/domain/profile/components/DateTimeFieldBox';
import { useTheme } from '@/hooks/useTheme';

const DATE = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
const TIME = /^(\d{1,2}):(\d{2})\s*(am|pm)$/i;

function parse(text: string, mode: DateTimeFieldProps['mode'], base: Date): Date | null {
  if (mode === 'date') {
    const match = DATE.exec(text.trim());
    if (!match) return null;
    const date = new Date(Number(match[3]), Number(match[1]) - 1, Number(match[2]));
    return date.getMonth() === Number(match[1]) - 1 ? date : null;
  }
  const match = TIME.exec(text.trim());
  if (!match) return null;
  const hours = (Number(match[1]) % 12) + (match[3].toLowerCase() === 'pm' ? 12 : 0);
  const minutes = Number(match[2]);
  if (Number(match[1]) > 12 || minutes > 59) return null;
  return new Date(base.getFullYear(), base.getMonth(), base.getDate(), hours, minutes);
}

export function DateTimeField({
  value,
  onChange,
  onClear,
  minimumDate,
  error,
  ...boxProps
}: DateTimeFieldProps) {
  const theme = useTheme();
  const [draft, setDraft] = useState<string | null>(null);
  const [invalid, setInvalid] = useState(false);
  const text = draft ?? (value ? formatFieldValue(value, boxProps.mode) : '');

  const commit = () => {
    if (draft === null) return;
    if (draft.trim() === '' && onClear) {
      setInvalid(false);
      setDraft(null);
      onClear();
      return;
    }
    const parsed = parse(draft, boxProps.mode, value ?? new Date());
    const valid = parsed !== null && (!minimumDate || parsed >= minimumDate);
    setInvalid(!valid);
    if (valid) {
      onChange(parsed);
      setDraft(null);
    }
  };

  return (
    <DateTimeFieldBox
      {...boxProps}
      hasValue={false}
      error={invalid ? `Use ${fieldPlaceholder(boxProps.mode)}` : error}>
      <TextInput
        accessibilityLabel={boxProps.label}
        value={text}
        onChangeText={setDraft}
        onBlur={commit}
        onSubmitEditing={commit}
        placeholder={fieldPlaceholder(boxProps.mode)}
        placeholderTextColor={theme.textSecondary}
        style={[styles.input, { color: theme.text }]}
      />
    </DateTimeFieldBox>
  );
}

const styles = StyleSheet.create({
  input: {
    fontSize: 16,
    paddingVertical: 0,
  },
});
