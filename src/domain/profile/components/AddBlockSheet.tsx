import {
  BottomSheetTextInput,
  BottomSheetView,
  useBottomSheetModal,
  type BottomSheetModal,
} from '@gorhom/bottom-sheet';
import type { Ref } from 'react';
import { Controller } from 'react-hook-form';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppBottomSheet } from '@/components/sheet/AppBottomSheet';
import { SheetHeader } from '@/components/sheet/SheetHeader';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { FormTextField } from '@/components/ui/FormTextField';
import { Icon } from '@/components/ui/Icon';
import type { TextFieldProps } from '@/components/ui/TextField';
import { Radius, Spacing } from '@/constants/Theme';
import { DateTimeField } from '@/components/ui/DateTimeField';
import { ToggleRow } from '@/domain/profile/components/ToggleRow';
import { useAddBlockForm } from '@/domain/profile/hooks/useAddBlockForm';
import { useTheme } from '@/hooks/useTheme';
import { haptics } from '@/utils/haptics';

const SheetTextInput = BottomSheetTextInput as NonNullable<TextFieldProps['InputComponent']>;

export function AddBlockSheet({ ref }: { ref: Ref<BottomSheetModal> }) {
  return (
    <AppBottomSheet
      ref={ref}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize">
      {() => <AddBlockContent />}
    </AppBottomSheet>
  );
}

function AddBlockContent() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { dismiss } = useBottomSheetModal();
  const close = () => dismiss();
  const { control, startDate, specificHours, changeStartDate, submit } = useAddBlockForm(close);

  return (
    <BottomSheetView style={{ paddingBottom: insets.bottom + Spacing.three }}>
      <SheetHeader title="Add block" onClose={close} />

      <View style={styles.body}>
        <FormTextField
          control={control}
          name="title"
          label="Title"
          required
          labelStyle={styles.label}
          placeholder="e.g. Vacation, Staff training"
          InputComponent={SheetTextInput}
          style={styles.input}
          returnKeyType="done"
        />

        <View style={styles.pair}>
          <Controller
            control={control}
            name="startDate"
            render={({ field }) => (
              <DateTimeField
                label="Start date"
                mode="date"
                required
                value={field.value}
                onChange={changeStartDate}
              />
            )}
          />
          <Controller
            control={control}
            name="endDate"
            render={({ field, fieldState }) => (
              <DateTimeField
                label="End date"
                mode="date"
                value={field.value}
                minimumDate={startDate}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
        </View>

        <Controller
          control={control}
          name="specificHours"
          render={({ field }) => (
            <ToggleRow
              title="Block specific hours"
              value={field.value}
              onValueChange={field.onChange}
            />
          )}
        />

        {specificHours ? (
          <View style={styles.pair}>
            <Controller
              control={control}
              name="startTime"
              render={({ field }) => (
                <DateTimeField
                  label="From"
                  mode="time"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              control={control}
              name="endTime"
              render={({ field, fieldState }) => (
                <DateTimeField
                  label="To"
                  mode="time"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                />
              )}
            />
          </View>
        ) : null}

        <Controller
          control={control}
          name="notifyOffice"
          render={({ field }) => (
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: field.value }}
              accessibilityLabel="Notify the back office"
              accessibilityHint="The office sees this block when scheduling"
              onPress={() => {
                haptics.selection();
                field.onChange(!field.value);
              }}
              style={[styles.notify, { borderColor: theme.border }]}>
              <View
                style={[
                  styles.checkbox,
                  field.value
                    ? { backgroundColor: theme.primary, borderColor: theme.primary }
                    : { borderColor: theme.textSecondary },
                ]}>
                {field.value ? (
                  <Icon
                    name={{ ios: 'checkmark', android: 'check' }}
                    size={14}
                    color={theme.onPrimary}
                  />
                ) : null}
              </View>
              <View style={styles.notifyBody}>
                <ThemedText style={styles.notifyTitle}>Notify the back office</ThemedText>
                <ThemedText themeColor="textSecondary" style={styles.notifyText}>
                  The office sees this block when scheduling. Untick for a personal block.
                </ThemedText>
              </View>
            </Pressable>
          )}
        />
      </View>

      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        <Button title="Cancel" variant="secondary" style={styles.flex} onPress={close} />
        <Button title="Add block" style={styles.flex} onPress={submit} />
      </View>
    </BottomSheetView>
  );
}

const CHECKBOX_SIZE = 22;

const styles = StyleSheet.create({
  body: {
    gap: Spacing.three,
    padding: Spacing.four,
  },
  label: {
    fontWeight: 500,
  },
  input: {
    minHeight: 48,
  },
  pair: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  notify: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
    padding: Spacing.three,
    borderWidth: 1,
    borderRadius: Radius.medium,
  },
  checkbox: {
    width: CHECKBOX_SIZE,
    height: CHECKBOX_SIZE,
    marginTop: Spacing.half,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderRadius: Radius.small / 2,
  },
  notifyBody: {
    flex: 1,
    gap: Spacing.half,
  },
  notifyTitle: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: 600,
  },
  notifyText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 400,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  flex: {
    flex: 1,
  },
});
