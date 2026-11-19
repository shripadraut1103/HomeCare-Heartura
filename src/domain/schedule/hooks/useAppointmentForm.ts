import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useState } from 'react';
import { useForm, useWatch, type UseFormReturn } from 'react-hook-form';

import {
  addressOptions,
  bookingDefaults,
  conflictsFrom,
  DEFAULT_VISIT_TYPE,
  formFieldErrors,
  patientOptionFromPlan,
  payerOptions,
  placeOptions,
  preferredProviderId,
  providerOptions,
  serviceOptions,
  toApiRepeat,
  toAppointmentUpdate,
  toBookingSlot,
  visitTypeOptions,
  type BookingDefaults,
  type BookingDraft,
} from '@/domain/schedule/bookingMapper';
import { addMonths, isSameDay, startOfDay } from '@/domain/schedule/calendar';
import {
  useBookingCheck,
  useBookingPlan,
  useSchedulingReference,
} from '@/domain/schedule/hooks/useBooking';
import type {
  ApiConflict,
  ApiPatientOption,
  ApiPayer,
} from '@/domain/schedule/interfaces/BookingApi';
import { buildOccurrences, MAX_OCCURRENCES } from '@/domain/schedule/recurrence';
import { markedDays as scheduledDays } from '@/domain/schedule/scheduleFilter';
import {
  appointmentSchemaFor,
  isValidDuration,
  type AppointmentFormValues,
} from '@/domain/schedule/schemas/appointmentSchema';
import { useAllVisits, useVisit, visitsOn } from '@/domain/visits/hooks/useVisits';
import type { Visit } from '@/domain/visits/interfaces/VisitInterfaces';
import {
  createAppointmentsAction,
  fetchVisitAction,
  updateAppointmentAction,
} from '@/domain/visits/store/async-actions/VisitAsyncActions';
import { isVisitHappening } from '@/domain/visits/visitStatus';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import { setToastMessage } from '@/store/common-reducer/ToastReducer';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { ServiceError } from '@/types/ServiceInterfaces';
import { confirm } from '@/utils/confirm';
import { parseIsoDate, parseTimeOfDay, toIsoDate } from '@/utils/dateFormat';
import { haptics } from '@/utils/haptics';

const DEFAULT_START_HOUR = 10;
const SLOT_MINUTES = 15;
const MINUTE_MS = 60_000;
const SAVE_FAILED = 'Couldn’t save the appointment. Try again.';
const OVERLAP = 'This time overlaps another visit. Add a reason to book anyway.';

type AppointmentFormOptions = {
  date?: Date;
  patientId?: string;
  visitId?: string;
  startNow?: boolean;
  duration?: number;
};

type Form = UseFormReturn<AppointmentFormValues>;

const atTime = (day: Date, time: Date) =>
  new Date(day.getFullYear(), day.getMonth(), day.getDate(), time.getHours(), time.getMinutes());

const defaultEndDate = (date: Date) => {
  const next = addMonths(date, 12);
  return new Date(next.getFullYear(), next.getMonth() + 1, 0);
};

const firstStart = (day: Date, startNow: boolean) => {
  if (!startNow) {
    return new Date(day.getFullYear(), day.getMonth(), day.getDate(), DEFAULT_START_HOUR);
  }
  const now = new Date();
  const minutes = Math.floor(now.getMinutes() / SLOT_MINUTES) * SLOT_MINUTES;
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), now.getHours(), minutes);
};

function initialValues(
  date: Date,
  patientId: string | undefined,
  visit: Visit | undefined,
  startNow: boolean,
  duration: number | undefined
): AppointmentFormValues {
  const booking = visit?.booking;
  const day = booking ? parseIsoDate(booking.date) : date;
  return {
    patientId: visit?.patientId ?? patientId ?? null,
    location: booking?.placeOfService ?? null,
    service: booking?.serviceCode ?? null,
    provider: booking?.providerId ?? null,
    visitType: booking?.visitType ?? DEFAULT_VISIT_TYPE,
    address: booking?.addressId ?? null,
    payer: booking?.payer ?? null,
    date: day,
    startTime: booking ? parseTimeOfDay(booking.startTime, day) : firstStart(day, startNow),
    duration: String(visit?.durationMinutes ?? duration ?? ''),
    repeat: false,
    repeatEvery: '1',
    repeatUnit: 'week',
    repeatDays: [day.getDay()],
    ends: 'on',
    endsOn: defaultEndDate(day),
    endsAfter: '13',
    notes: booking?.notes ?? '',
    conflictReason: '',
  };
}

function applyDefaults(form: Form, defaults: BookingDefaults) {
  const options = { shouldDirty: true };
  form.setValue('service', defaults.service, options);
  form.setValue('provider', defaults.provider, options);
  form.setValue('payer', defaults.payer, options);
  form.setValue('location', defaults.location, options);
  form.setValue('address', defaults.address, options);
  form.setValue('visitType', defaults.visitType, options);
}

export function useAppointmentForm({
  date: initialDate,
  patientId: initialPatientId,
  visitId,
  startNow = false,
  duration: defaultDuration,
}: AppointmentFormOptions = {}) {
  const dispatch = useAppDispatch();
  const scheduling = useSchedulingReference();
  const { reference } = scheduling;
  const user = useAppSelector((state) => state.auth.me?.user) as
    { first_name?: string; last_name?: string } | undefined;
  const editing = useVisit(visitId);
  const allVisits = useAllVisits();
  const today = startOfDay(new Date());
  const firstDate = initialDate && initialDate >= today ? startOfDay(initialDate) : today;

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchemaFor(editing?.durationMinutes)),
    defaultValues: initialValues(firstDate, initialPatientId, editing, startNow, defaultDuration),
  });
  const values = useWatch({ control: form.control }) as AppointmentFormValues;
  const { leave } = useUnsavedChangesGuard(
    form.formState.isDirty,
    editing
      ? 'Your changes to this appointment haven’t been saved.'
      : 'This appointment hasn’t been scheduled yet.'
  );
  const [picked, setPicked] = useState<ApiPatientOption | null>(null);
  const [saving, setSaving] = useState(false);
  const [rejected, setRejected] = useState<{ key: string; conflicts: ApiConflict[] } | null>(null);
  const prefilledFor = useRef<string | null>(editing?.patientId ?? null);

  const { plan, loading: planLoading, error: planError } = useBookingPlan(values.patientId);

  useEffect(() => {
    if (visitId) void dispatch(fetchVisitAction({ visitId }));
  }, [dispatch, visitId]);

  useEffect(() => {
    if (!plan || !reference || prefilledFor.current === plan.id) return;
    prefilledFor.current = plan.id;
    applyDefaults(
      form,
      bookingDefaults(
        reference,
        plan,
        toIsoDate(form.getValues('date')),
        preferredProviderId(reference, user)
      )
    );
  }, [plan, reference, form, user]);

  const patient = plan
    ? patientOptionFromPlan(plan)
    : picked?.id === values.patientId
      ? picked
      : undefined;
  const isoDate = toIsoDate(values.date);
  const services = reference ? serviceOptions(reference, plan) : [];
  const providers = reference ? providerOptions(reference, plan, values.service) : [];
  const payers = reference ? payerOptions(reference, plan, values.service, isoDate) : [];
  if (editing?.booking && !payers.some((option) => option.value === editing.booking?.payer)) {
    payers.push({ value: editing.booking.payer as ApiPayer, label: editing.payer });
  }
  const places = reference ? placeOptions(reference) : [];
  const visitTypes = reference ? visitTypeOptions(reference, patient?.status) : [];
  const addresses = addressOptions(plan);

  const duration = Number(values.duration);
  const draft: BookingDraft | null =
    plan &&
    values.patientId &&
    values.provider &&
    values.service &&
    values.location &&
    values.payer &&
    values.startTime &&
    (isValidDuration(duration) || duration === editing?.durationMinutes)
      ? {
          patientId: values.patientId,
          providerId: values.provider,
          serviceCode: values.service,
          visitType: values.visitType,
          date: values.date,
          startTime: values.startTime,
          durationMin: duration,
          placeOfService: values.location,
          addressId: values.address,
          payer: values.payer,
        }
      : null;
  const check = useBookingCheck(
    draft ? { ...toBookingSlot(draft), exclude: visitId ?? null } : null
  );
  const rejectedNow = rejected !== null && rejected.key === check.key;
  const conflicts = rejectedNow ? rejected.conflicts : (check.result?.conflicts ?? []);
  const needsOverride = rejectedNow || conflicts.length > 0;
  const evvRequired =
    check.result?.evv_required ??
    reference?.places_of_service.find((place) => place.value === values.location)?.evv_required;

  const start = values.startTime ? atTime(values.date, values.startTime) : null;
  const dayVisits = visitsOn(allVisits, values.date).filter(
    (visit) => visit.id !== visitId && isVisitHappening(visit.status)
  );
  const overlapping = new Set(
    start && duration > 0
      ? dayVisits
          .filter((visit) => {
            const visitStart = new Date(visit.startsAt).getTime();
            const visitEnd = visitStart + visit.durationMinutes * MINUTE_MS;
            return (
              visitStart < start.getTime() + duration * MINUTE_MS && start.getTime() < visitEnd
            );
          })
          .map((visit) => visit.id)
      : []
  );
  const markedDays = scheduledDays(allVisits.filter((visit) => isVisitHappening(visit.status)));
  const maxRepeats = Math.min(reference?.max_repeats ?? MAX_OCCURRENCES, MAX_OCCURRENCES);

  const occurrences = values.repeat
    ? buildOccurrences(values.date, {
        every: Number(values.repeatEvery) || 1,
        unit: values.repeatUnit,
        weekdays: values.repeatDays,
        ends: values.ends,
        endsOn: values.endsOn ?? values.date,
        endsAfter: Number(values.endsAfter) || 1,
      }).slice(0, maxRepeats)
    : [values.date];

  const set = <K extends keyof AppointmentFormValues>(name: K, value: AppointmentFormValues[K]) =>
    form.setValue(name, value as never, {
      shouldDirty: true,
      shouldValidate: form.formState.isSubmitted,
    });

  const keepValidPayer = (service: string | null, date: Date) => {
    if (!reference) return;
    const next = payerOptions(reference, plan, service, toIsoDate(date));
    if (!next.some((option) => option.value === form.getValues('payer'))) {
      set('payer', next[0]?.value ?? null);
    }
  };

  const resetBooking = () => {
    set('service', null);
    set('provider', null);
    set('payer', null);
    set('location', null);
    set('address', null);
    set('visitType', DEFAULT_VISIT_TYPE);
  };

  const selectPatient = (next: ApiPatientOption) => {
    prefilledFor.current = null;
    setPicked(next);
    set('patientId', next.id);
    resetBooking();
  };

  const clearPatient = () => {
    setPicked(null);
    set('patientId', null);
    resetBooking();
  };

  const changeService = (service: string) => {
    set('service', service);
    if (!reference) return;
    const next = providerOptions(reference, plan, service);
    if (!next.some((option) => option.value === form.getValues('provider'))) {
      set('provider', next.length === 1 ? next[0].value : null);
    }
    keepValidPayer(service, form.getValues('date'));
  };

  const changeDate = (date: Date) => {
    const previous = form.getValues('date');
    set('date', date);
    const days = form.getValues('repeatDays');
    if (days.length === 1 && days[0] === previous.getDay()) set('repeatDays', [date.getDay()]);
    keepValidPayer(form.getValues('service'), date);
  };

  const toggleRepeatDay = (weekday: number) => {
    const days = form.getValues('repeatDays');
    set(
      'repeatDays',
      days.includes(weekday) ? days.filter((day) => day !== weekday) : [...days, weekday]
    );
  };

  const fail = (error: ServiceError | null) => {
    haptics.error();
    if (error?.code === 'SCHEDULE_CONFLICT') {
      setRejected({ key: check.key, conflicts: conflictsFrom(error) ?? conflicts });
      dispatch(setToastMessage({ message: OVERLAP, type: 'error' }));
      return;
    }
    if (error?.code === 'EDIT_CONFLICT' && visitId) void dispatch(fetchVisitAction({ visitId }));
    formFieldErrors(error?.fields ?? {}).forEach(({ name, message }) =>
      form.setError(name as keyof AppointmentFormValues, { message })
    );
    dispatch(setToastMessage({ message: error?.error || SAVE_FAILED, type: 'error' }));
  };

  const finish = (message: string) => {
    haptics.success();
    dispatch(setToastMessage({ message }));
    leave();
  };

  const save = async (submitted: AppointmentFormValues, extraNote?: string) => {
    if (!draft || !patient) return;
    const reason = submitted.conflictReason.trim();
    if (needsOverride && !reason) {
      form.setError('conflictReason', { message: 'Add a reason to book anyway' });
      haptics.error();
      return;
    }
    if (
      needsOverride &&
      !(await confirm({
        title: 'Book anyway?',
        message:
          conflicts.length > 1
            ? `This time overlaps ${conflicts.length} other visits.`
            : 'This time overlaps another visit.',
        confirmLabel: 'Book anyway',
      }))
    ) {
      return;
    }
    const override = {
      override_conflicts: needsOverride,
      conflict_reason: needsOverride ? reason : '',
    };
    const notes = [extraNote, submitted.notes.trim()].filter(Boolean).join(' · ');
    const slot = toBookingSlot(draft);

    if (editing) {
      if (!editing.booking || !editing.version) return fail(null);
      const body = toAppointmentUpdate(
        { ...editing.booking, durationMin: editing.durationMinutes },
        slot,
        notes,
        editing.version
      );
      if (Object.keys(body).length === 1) return leave();
      setSaving(true);
      const result = await dispatch(
        updateAppointmentAction({
          visitId: editing.id,
          body: needsOverride ? { ...body, ...override } : body,
        })
      );
      setSaving(false);
      const payload = updateAppointmentAction.fulfilled.match(result) ? result.payload : null;
      if (!payload || 'error' in payload) return fail(payload);
      return finish(`Updated ${patient.name}’s appointment`);
    }

    setSaving(true);
    const result = await dispatch(
      createAppointmentsAction({
        ...slot,
        notes,
        repeat: submitted.repeat
          ? toApiRepeat({
              every: Number(submitted.repeatEvery),
              unit: submitted.repeatUnit,
              weekdays: submitted.repeatDays,
              ends: submitted.ends,
              endsOn: submitted.endsOn,
              endsAfter: Number(submitted.endsAfter),
            })
          : null,
        ...override,
      })
    );
    setSaving(false);
    const payload = createAppointmentsAction.fulfilled.match(result) ? result.payload : null;
    if (!payload || 'error' in payload) return fail(payload);
    const count = payload.data.length;
    finish(
      count > 1
        ? `Scheduled ${count} appointments for ${patient.name}`
        : `Scheduled ${patient.name}`
    );
  };

  const submit = (extraNote?: string) =>
    void form.handleSubmit(
      (submitted) => save(submitted, extraNote),
      () => haptics.error()
    )();

  return {
    control: form.control,
    errors: form.formState.errors,
    values,
    isEditing: Boolean(editing),
    scheduling,
    patient,
    plan,
    planLoading,
    planError,
    services,
    providers,
    payers,
    places,
    visitTypes,
    addresses,
    check,
    conflicts,
    needsOverride,
    evvRequired,
    dayVisits,
    overlapping,
    markedDays,
    isPast: (day: Date) => day < today && !isSameDay(day, today),
    occurrences,
    canSubmit: Boolean(draft) && !saving,
    saving,
    set,
    selectPatient,
    clearPatient,
    changeService,
    changeDate,
    toggleRepeatDay,
    submit,
  };
}

export type AppointmentForm = ReturnType<typeof useAppointmentForm>;
