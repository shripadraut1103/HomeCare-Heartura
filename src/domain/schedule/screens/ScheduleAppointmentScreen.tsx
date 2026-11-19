import { router, useLocalSearchParams } from 'expo-router';
import { useRef, type ComponentRef } from 'react';
import { Controller } from 'react-hook-form';
import { ActivityIndicator, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { DICTATION_BUTTON_SIZE, DictationButton } from '@/components/ui/DictationButton';
import { FormTextField } from '@/components/ui/FormTextField';
import { Select } from '@/components/ui/Select';
import { TextField } from '@/components/ui/TextField';
import { Spacing } from '@/constants/Theme';
import { ModalFormLayout } from '@/domain/profile/components/ModalFormLayout';
import { AppointmentDateTime } from '@/domain/schedule/components/AppointmentDateTime';
import {
  CheckNotes,
  ConflictList,
  UnitsTiles,
} from '@/domain/schedule/components/BookingCheckSummary';
import { PatientPicker } from '@/domain/schedule/components/PatientPicker';
import { RepeatSection } from '@/domain/schedule/components/RepeatSection';
import { useAppointmentForm } from '@/domain/schedule/hooks/useAppointmentForm';
import { parseIsoDate } from '@/utils/dateFormat';

export default function ScheduleAppointmentScreen() {
  const { date, patientId, visitId } = useLocalSearchParams<{
    date?: string;
    patientId?: string;
    visitId?: string;
  }>();
  const form = useAppointmentForm({
    date: date ? parseIsoDate(date) : undefined,
    patientId,
    visitId,
  });
  const notesRef = useRef<ComponentRef<typeof TextInput>>(null);
  const { patient, scheduling } = form;
  const ready = Boolean(patient && form.plan && scheduling.reference);
  const title = form.isEditing ? 'Edit Appointment' : 'Schedule Appointment';
  const action = form.needsOverride ? 'Book Anyway' : form.isEditing ? 'Save Changes' : title;

  return (
    <ModalFormLayout
      title={title}
      footer={
        <>
          <Button
            title="Cancel"
            variant="secondary"
            style={styles.cancel}
            disabled={form.saving}
            onPress={() => router.back()}
          />
          <Button
            title={action}
            style={styles.submit}
            disabled={!form.canSubmit}
            loading={form.saving}
            accessibilityHint={form.canSubmit ? undefined : 'Fill in the required fields first'}
            onPress={() => form.submit()}
          />
        </>
      }>
      {!scheduling.reference ? (
        <View style={styles.field}>
          {scheduling.error ? (
            <>
              <ThemedText themeColor="error" style={styles.hint}>
                {scheduling.error}
              </ThemedText>
              <Button title="Try again" variant="secondary" onPress={scheduling.retry} />
            </>
          ) : (
            <ActivityIndicator />
          )}
        </View>
      ) : null}

      <PatientPicker
        selected={patient}
        onSelect={form.selectPatient}
        onClear={form.isEditing ? undefined : form.clearPatient}
        loading={Boolean(form.values.patientId) && !patient}
        error={form.planError ?? form.errors.patientId?.message}
      />

      <View
        pointerEvents={ready ? 'auto' : 'none'}
        accessibilityElementsHidden={!ready}
        importantForAccessibility={ready ? 'auto' : 'no-hide-descendants'}
        style={[styles.details, !ready && styles.locked]}>
        <View style={styles.field}>
          <Controller
            control={form.control}
            name="location"
            render={({ field, fieldState }) => (
              <Select
                label="Service location"
                required
                options={form.places}
                value={field.value}
                onChange={(value) => form.set('location', value)}
                error={fieldState.error?.message}
                disabled={!ready}
              />
            )}
          />
          {ready ? (
            <ThemedText themeColor="textSecondary" style={styles.hint}>
              Pre-filled from the patient profile.
            </ThemedText>
          ) : null}
        </View>

        {form.addresses.length > 1 ? (
          <Controller
            control={form.control}
            name="address"
            render={({ field, fieldState }) => (
              <Select
                label="Address"
                options={form.addresses}
                value={field.value}
                onChange={(value) => form.set('address', value)}
                error={fieldState.error?.message}
                disabled={!ready}
              />
            )}
          />
        ) : null}

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
                  disabled={!ready}
                />
              )}
            />
          </View>
          <View style={styles.flex}>
            <Controller
              control={form.control}
              name="provider"
              render={({ field, fieldState }) => (
                <Select
                  label="Provider"
                  required
                  options={form.providers}
                  value={field.value}
                  onChange={(value) => form.set('provider', value)}
                  error={fieldState.error?.message}
                  disabled={!ready || form.providers.length < 2}
                />
              )}
            />
          </View>
        </View>

        <Controller
          control={form.control}
          name="visitType"
          render={({ field, fieldState }) => (
            <Select
              label="Visit type"
              required
              options={form.visitTypes}
              value={field.value}
              onChange={(value) => form.set('visitType', value)}
              error={fieldState.error?.message}
              disabled={!ready || form.visitTypes.length < 2}
            />
          )}
        />

        <View style={styles.field}>
          <Controller
            control={form.control}
            name="payer"
            render={({ field, fieldState }) => (
              <Select
                label="Payer"
                required
                options={form.payers}
                value={field.value}
                onChange={(value) => form.set('payer', value)}
                error={fieldState.error?.message}
                disabled={!ready}
              />
            )}
          />
          {ready && form.values.service && form.payers.length === 0 ? (
            <ThemedText themeColor="error" style={styles.hint}>
              No authorization covers this date and private pay is off for this patient.
            </ThemedText>
          ) : null}
        </View>

        {form.check.result?.units ? <UnitsTiles units={form.check.result.units} /> : null}

        <AppointmentDateTime form={form} />

        <CheckNotes
          result={form.check.result}
          checking={form.check.checking}
          error={form.check.error}
          evvRequired={ready ? form.evvRequired : undefined}
        />

        {form.needsOverride ? (
          <>
            <ConflictList conflicts={form.conflicts} />
            <FormTextField
              control={form.control}
              name="conflictReason"
              label="Reason for booking anyway"
              required
              labelStyle={styles.notesLabel}
              placeholder="For example: family asked for back-to-back visits"
              maxLength={500}
            />
          </>
        ) : null}

        {form.isEditing ? null : <RepeatSection form={form} />}

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
