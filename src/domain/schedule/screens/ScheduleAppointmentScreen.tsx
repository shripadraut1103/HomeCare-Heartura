import { router, useLocalSearchParams } from 'expo-router';
import { useRef, type ComponentRef } from 'react';
import { Controller } from 'react-hook-form';
import { StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { DICTATION_BUTTON_SIZE, DictationButton } from '@/components/ui/DictationButton';
import { Select } from '@/components/ui/Select';
import { TextField } from '@/components/ui/TextField';
import { Radius, Spacing } from '@/constants/Theme';
import { ModalFormLayout } from '@/domain/profile/components/ModalFormLayout';
import { SERVICE_LOCATIONS } from '@/domain/schedule/appointmentOptions';
import { startOfWeek } from '@/domain/schedule/calendar';
import { AppointmentDateTime } from '@/domain/schedule/components/AppointmentDateTime';
import { PatientPicker } from '@/domain/schedule/components/PatientPicker';
import { RepeatSection } from '@/domain/schedule/components/RepeatSection';
import {
  useAppointmentForm,
  type AppointmentForm,
} from '@/domain/schedule/hooks/useAppointmentForm';
import { useTheme } from '@/hooks/useTheme';
import { formatNumericDate, parseIsoDate } from '@/utils/dateFormat';

export default function ScheduleAppointmentScreen() {
  const { date, patientId } = useLocalSearchParams<{ date?: string; patientId?: string }>();
  const form = useAppointmentForm(date ? parseIsoDate(date) : undefined, patientId);
  const notesRef = useRef<ComponentRef<typeof TextInput>>(null);
  const { patient } = form;

  return (
    <ModalFormLayout
      title="Schedule Appointment"
      footer={
        <>
          <Button
            title="Cancel"
            variant="secondary"
            style={styles.cancel}
            onPress={() => router.back()}
          />
          <Button
            title="Schedule Appointment"
            style={styles.submit}
            disabled={!form.canSubmit}
            accessibilityHint={form.canSubmit ? undefined : 'Fill in the required fields first'}
            onPress={form.submit}
          />
        </>
      }>
      <PatientPicker
        patients={form.patients}
        selected={patient}
        onSelect={form.selectPatient}
        onClear={form.clearPatient}
        error={form.errors.patientId?.message}
      />

      <View
        pointerEvents={patient ? 'auto' : 'none'}
        accessibilityElementsHidden={!patient}
        importantForAccessibility={patient ? 'auto' : 'no-hide-descendants'}
        style={[styles.details, !patient && styles.locked]}>
        <View style={styles.field}>
          <Controller
            control={form.control}
            name="location"
            render={({ field, fieldState }) => (
              <Select
                label="Service location"
                required
                options={SERVICE_LOCATIONS}
                value={field.value}
                onChange={(value) => form.set('location', value)}
                error={fieldState.error?.message}
                disabled={!patient}
              />
            )}
          />
          {patient ? (
            <ThemedText themeColor="textSecondary" style={styles.hint}>
              Pre-filled from the patient profile.
            </ThemedText>
          ) : null}
        </View>

        <View style={styles.pair}>
          <View style={styles.flex}>
            <Controller
              control={form.control}
              name="service"
              render={({ field, fieldState }) => (
                <Select
                  label="Service"
                  required
                  options={form.services}
                  value={field.value}
                  onChange={form.changeService}
                  error={fieldState.error?.message}
                  disabled={!patient}
                />
              )}
            />
          </View>
          <ProviderField name={form.providerName} />
        </View>

        <Controller
          control={form.control}
          name="payer"
          render={({ field, fieldState }) => (
            <Select
              label="Payer"
              required
              options={(patient?.payers ?? []).map((payer) => ({ value: payer, label: payer }))}
              value={field.value}
              onChange={(value) => form.set('payer', value)}
              error={fieldState.error?.message}
              disabled={!patient}
            />
          )}
        />

        {patient ? <UnitsSummary form={form} /> : null}

        <AppointmentDateTime form={form} />

        <RepeatSection form={form} />

        <Controller
          control={form.control}
          name="notes"
          render={({ field, fieldState }) => (
            <TextField
              ref={notesRef}
              label="Scheduling notes"
              labelStyle={styles.notesLabel}
              placeholder="Gate code, parking, who will be home"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
              multiline
              textAlignVertical="top"
              maxLength={500}
              style={styles.notes}
              accessory={
                <DictationButton
                  label="scheduling notes"
                  onPress={() => notesRef.current?.focus()}
                />
              }
            />
          )}
        />
      </View>
    </ModalFormLayout>
  );
}

function ProviderField({ name }: { name: string }) {
  const theme = useTheme();

  return (
    <View style={[styles.field, styles.flex]}>
      <ThemedText themeColor="textSecondary" style={styles.label}>
        Provider
        <ThemedText themeColor="error">{'  *'}</ThemedText>
      </ThemedText>
      <View
        accessible
        accessibilityLabel={`Provider, ${name}`}
        style={[styles.provider, { borderColor: theme.border }]}>
        <ThemedText themeColor="textSecondary" numberOfLines={1} style={styles.providerName}>
          {name}
        </ThemedText>
      </View>
    </View>
  );
}

function UnitsSummary({ form }: { form: AppointmentForm }) {
  const theme = useTheme();
  const units = form.patient?.units;
  if (!units) return null;
  const tiles = [
    { value: `${units.usedThisWeek} of ${units.authorizedPerWeek}`, label: 'This week' },
    { value: String(units.remainingInclMakeup), label: 'Remaining incl. makeup' },
  ];

  return (
    <View style={styles.field}>
      <ThemedText themeColor="textSecondary" style={styles.label}>
        {`Units · week of ${formatNumericDate(startOfWeek(form.values.date))}`}
      </ThemedText>
      <View style={styles.pair}>
        {tiles.map((tile) => (
          <View
            key={tile.label}
            accessible
            accessibilityLabel={`${tile.value} ${tile.label}`}
            style={[styles.tile, { backgroundColor: theme.surfaceMuted }]}>
            <ThemedText style={styles.tileValue}>{tile.value}</ThemedText>
            <ThemedText themeColor="textSecondary" numberOfLines={1} style={styles.tileLabel}>
              {tile.label}
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  details: {
    gap: Spacing.four,
  },
  locked: {
    opacity: 0.45,
  },
  field: {
    gap: Spacing.one,
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 500,
  },
  hint: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 400,
  },
  pair: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  flex: {
    flex: 1,
  },
  provider: {
    justifyContent: 'center',
    minHeight: 50,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.medium,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  providerName: {
    fontSize: 17,
    lineHeight: 24,
  },
  tile: {
    flex: 1,
    gap: Spacing.half,
    padding: Spacing.three,
    borderRadius: Radius.medium,
  },
  tileValue: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: 600,
  },
  tileLabel: {
    fontSize: 14,
    lineHeight: 20,
  },
  notesLabel: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 500,
  },
  notes: {
    minHeight: 96,
    paddingTop: Spacing.three,
    paddingRight: DICTATION_BUTTON_SIZE + Spacing.three,
  },
  cancel: {
    flex: 1,
  },
  submit: {
    flex: 2.4,
  },
});
