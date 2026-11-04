import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Icon } from '@/components/ui/Icon';
import { Radius, Spacing } from '@/constants/Theme';
import { useTheme } from '@/hooks/useTheme';
import { formatClockTime, formatNumericDate } from '@/utils/dateFormat';

export type DateTimeMode = 'date' | 'time';

export type DateTimeFieldProps = {
  label: string;
  mode: DateTimeMode;
  value: Date | null;
  onChange: (value: Date) => void;
  onClear?: () => void;
  minimumDate?: Date;
  required?: boolean;
  labelHint?: string;
  hideLabel?: boolean;
  error?: string;
};

export const formatFieldValue = (value: Date, mode: DateTimeMode) =>
  mode === 'date' ? formatNumericDate(value) : formatClockTime(value).toUpperCase();

export const fieldPlaceholder = (mode: DateTimeMode) =>
  mode === 'date' ? 'MM/DD/YYYY' : 'hh:mm AM';

type DateTimeFieldBoxProps = Pick<
  DateTimeFieldProps,
  'label' | 'mode' | 'required' | 'labelHint' | 'hideLabel' | 'error' | 'onClear'
> & {
  hasValue: boolean;
  focused?: boolean;
  onPress?: () => void;
  children: ReactNode;
};

export function DateTimeFieldBox({
  label,
  mode,
  required = false,
  labelHint,
  hideLabel = false,
  error,
  onClear,
  hasValue,
  focused = false,
  onPress,
  children,
}: DateTimeFieldBoxProps) {
  const theme = useTheme();
  const borderColor = error ? theme.error : focused ? theme.primary : theme.border;
  const canClear = onClear !== undefined && hasValue;

  return (
    <View style={styles.container}>
      {hideLabel ? null : (
        <ThemedText type="smallBold" themeColor="textSecondary" style={styles.label}>
          {label}
          {labelHint ? (
            <ThemedText
              themeColor="textSecondary"
              style={styles.hint}>{`  ${labelHint}`}</ThemedText>
          ) : null}
          {required ? <ThemedText themeColor="error">{'  *'}</ThemedText> : null}
        </ThemedText>
      )}
      <Pressable
        accessibilityRole={onPress ? 'button' : undefined}
        accessibilityLabel={label}
        accessibilityHint={
          onPress ? `Opens a ${mode === 'date' ? 'calendar' : 'time'} picker` : undefined
        }
        disabled={!onPress}
        onPress={onPress}
        style={[styles.box, { borderColor, backgroundColor: theme.background }]}>
        <View style={styles.value}>{children}</View>
        {canClear ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Clear ${label.toLowerCase()}`}
            hitSlop={8}
            onPress={onClear}>
            <Icon
              name={{ ios: 'xmark.circle.fill', android: 'cancel' }}
              size={20}
              color={theme.textSecondary}
            />
          </Pressable>
        ) : (
          <Icon
            name={
              mode === 'date'
                ? { ios: 'calendar', android: 'calendar_month' }
                : { ios: 'clock', android: 'schedule' }
            }
            size={20}
            color={theme.textSecondary}
          />
        )}
      </Pressable>
      {error ? (
        <ThemedText type="small" themeColor="error" accessibilityRole="alert">
          {error}
        </ThemedText>
      ) : null}
    </View>
  );
}

export function DateTimeValueText({ value, mode }: { value: Date | null; mode: DateTimeMode }) {
  return value ? (
    <ThemedText style={styles.valueText}>{formatFieldValue(value, mode)}</ThemedText>
  ) : (
    <ThemedText themeColor="textSecondary" style={styles.valueText}>
      {fieldPlaceholder(mode)}
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: Spacing.one,
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: 500,
  },
  hint: {
    fontWeight: 400,
  },
  box: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: Radius.small,
    paddingHorizontal: Spacing.three - Spacing.one,
  },
  value: {
    flex: 1,
  },
  valueText: {
    fontSize: 16,
    fontVariant: ['tabular-nums'],
  },
});
