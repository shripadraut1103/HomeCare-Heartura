import { DatePicker, Host } from '@expo/ui/swift-ui';
import { datePickerStyle } from '@expo/ui/swift-ui/modifiers';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Radius, Spacing } from '@/constants/Theme';
import {
  DateTimeFieldBox,
  DateTimeValueText,
  type DateTimeFieldProps,
} from '@/components/ui/DateTimeFieldBox';
import { useTheme } from '@/hooks/useTheme';

export function DateTimeField({
  value,
  onChange,
  onClear,
  minimumDate,
  ...boxProps
}: DateTimeFieldProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const selection = value ?? minimumDate ?? new Date();

  const show = () => {
    if (!value) onChange(selection);
    setOpen(true);
  };

  return (
    <>
      <DateTimeFieldBox
        {...boxProps}
        hasValue={value !== null}
        onClear={onClear}
        focused={open}
        onPress={show}>
        <DateTimeValueText value={value} mode={boxProps.mode} />
      </DateTimeFieldBox>
      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <Pressable accessibilityLabel="Close picker" style={styles.backdrop} onPress={close} />
        <View
          style={[
            styles.panel,
            { backgroundColor: theme.background, paddingBottom: insets.bottom + Spacing.three },
          ]}>
          <Host matchContents style={styles.picker}>
            <DatePicker
              selection={selection}
              range={minimumDate ? { start: minimumDate } : undefined}
              displayedComponents={[boxProps.mode === 'date' ? 'date' : 'hourAndMinute']}
              onDateChange={onChange}
              modifiers={[datePickerStyle(boxProps.mode === 'date' ? 'graphical' : 'wheel')]}
            />
          </Host>
          <Button title="Done" onPress={close} />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  panel: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    borderTopLeftRadius: Radius.large,
    borderTopRightRadius: Radius.large,
  },
  picker: {
    alignSelf: 'center',
  },
});
