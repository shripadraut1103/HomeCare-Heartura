import { router, useLocalSearchParams } from 'expo-router';
import { Controller, useWatch } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Spacing } from '@/constants/Theme';
import { WEEKDAYS } from '@/domain/profile/availability';
import { AvailabilityDayEditor } from '@/domain/profile/components/AvailabilityDayEditor';
import { DateTimeField } from '@/components/ui/DateTimeField';
import { ModalFormLayout } from '@/domain/profile/components/ModalFormLayout';
import { useAvailabilityForm } from '@/domain/profile/hooks/useAvailabilityForm';
import { useTheme } from '@/hooks/useTheme';
import { toIsoDate } from '@/utils/dateFormat';

export default function EditAvailabilityScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const form = useAvailabilityForm(id);
  const startDate = useWatch({ control: form.control, name: 'startDate' });

  if (form.notFound) {
    return (
      <ModalFormLayout
        title="Edit availability"
        footer={<Button title="Close" style={styles.flex} onPress={() => router.back()} />}>
        <ThemedText themeColor="textSecondary" style={styles.missing}>
          This availability isn’t there any more.
        </ThemedText>
      </ModalFormLayout>
    );
  }

  const changeStartDate = (date: Date) => {
    form.setValue('startDate', date, { shouldDirty: true });
    const endDate = form.getValues('endDate');
    if (endDate && toIsoDate(endDate) < toIsoDate(date)) {
      form.setValue('endDate', date, { shouldDirty: true });
    }
  };

  return (
    <ModalFormLayout
      title={form.isEditing ? 'Edit availability' : 'Add availability'}
      footer={
        <>
          <Button
            title="Cancel"
            variant="secondary"
            style={styles.flex}
            onPress={() => router.back()}
          />
          <Button title="Save availability" style={styles.flex} onPress={form.submit} />
        </>
      }>
      <View style={[styles.dates, { borderBottomColor: theme.border }]}>
        <Controller
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <DateTimeField
              label="Applies from"
              mode="date"
              required
              value={field.value}
              onChange={changeStartDate}
            />
          )}
        />
        <Controller
          control={form.control}
          name="endDate"
          render={({ field, fieldState }) => (
            <DateTimeField
              label="To"
              labelHint="(optional)"
              mode="date"
              value={field.value}
              minimumDate={startDate}
              onChange={field.onChange}
              onClear={() => field.onChange(null)}
              error={fieldState.error?.message}
            />
          )}
        />
      </View>

      <View>
        {WEEKDAYS.map((day, index) => (
          <AvailabilityDayEditor
            key={day.id}
            control={form.control}
            index={index}
            label={day.long}
            isLast={index === WEEKDAYS.length - 1}
          />
        ))}
        {form.noDaysError ? (
          <ThemedText
            type="small"
            themeColor="error"
            accessibilityRole="alert"
            style={styles.noDays}>
            {form.noDaysError}
          </ThemedText>
        ) : null}
      </View>

      {form.isEditing ? (
        <Button
          variant="link"
          title="Delete this availability"
          color="error"
          style={styles.delete}
          onPress={form.remove}
          icon={<Icon name={{ ios: 'trash', android: 'delete' }} size={20} color={theme.error} />}
        />
      ) : null}
    </ModalFormLayout>
  );
}

const styles = StyleSheet.create({
  dates: {
    flexDirection: 'row',
    gap: Spacing.three,
    paddingBottom: Spacing.four,
    marginBottom: -Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  noDays: {
    paddingTop: Spacing.two,
  },
  delete: {
    alignSelf: 'center',
    paddingVertical: Spacing.two,
  },
  missing: {
    textAlign: 'center',
    paddingVertical: Spacing.five,
  },
  flex: {
    flex: 1,
  },
});
