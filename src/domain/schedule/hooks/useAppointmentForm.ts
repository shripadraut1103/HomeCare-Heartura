import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';

import { usePatients } from '@/domain/patients/hooks/usePatients';
import type { Patient } from '@/domain/patients/interfaces/PatientInterfaces';
import { useProfile } from '@/domain/profile/hooks/useProfile';
import { findLocation, findService, SERVICES } from '@/domain/schedule/appointmentOptions';
import { addMonths, isSameDay, startOfDay } from '@/domain/schedule/calendar';
import { buildOccurrences, MAX_OCCURRENCES } from '@/domain/schedule/recurrence';
import { markedDays as scheduledDays } from '@/domain/schedule/scheduleFilter';
import {
  appointmentSchema,
  type AppointmentFormValues,
} from '@/domain/schedule/schemas/appointmentSchema';
import { useAllVisits, visitsOn } from '@/domain/visits/hooks/useVisits';
import type { Visit } from '@/domain/visits/interfaces/VisitInterfaces';
import { addVisits, removeVisits } from '@/domain/visits/store/VisitsReducer';
import { isVisitHappening } from '@/domain/visits/visitStatus';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import { setToastMessage } from '@/store/common-reducer/ToastReducer';
import { useAppDispatch } from '@/store/hooks';
import { haptics } from '@/utils/haptics';

const DEFAULT_START_HOUR = 10;
const MINUTE_MS = 60_000;

const atTime = (day: Date, time: Date) =>
  new Date(day.getFullYear(), day.getMonth(), day.getDate(), time.getHours(), time.getMinutes());

const defaultEndDate = (date: Date) => {
  const next = addMonths(date, 12);
  return new Date(next.getFullYear(), next.getMonth() + 1, 0);
};

const defaults = (date: Date, patient: Patient | undefined): AppointmentFormValues => ({
  patientId: patient?.id ?? null,
  location: patient?.serviceLocation ?? null,
  service: null,
  payer: patient?.payers.length === 1 ? patient.payers[0] : null,
  date,
  startTime: new Date(date.getFullYear(), date.getMonth(), date.getDate(), DEFAULT_START_HOUR),
  duration: '',
  repeat: false,
  repeatEvery: '1',
  repeatUnit: 'week',
  repeatDays: [date.getDay()],
  ends: 'on',
  endsOn: defaultEndDate(date),
  endsAfter: '13',
  notes: '',
});

export function useAppointmentForm(initialDate: Date | undefined, initialPatientId?: string) {
  const dispatch = useAppDispatch();
  const patients = usePatients();
  const provider = useProfile();
  const allVisits = useAllVisits();
  const today = startOfDay(new Date());
  const firstDate = initialDate && initialDate >= today ? startOfDay(initialDate) : today;

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: defaults(
      firstDate,
      patients.find((item) => item.id === initialPatientId)
    ),
  });
  const values = useWatch({ control: form.control }) as AppointmentFormValues;
  const { leave } = useUnsavedChangesGuard(
    form.formState.isDirty,
    'This appointment hasn’t been scheduled yet.'
  );

  const patient = patients.find((item) => item.id === values.patientId);
  const duration = Number(values.duration);
  const start = values.startTime ? atTime(values.date, values.startTime) : null;

  const dayVisits = visitsOn(allVisits, values.date).filter((visit) =>
    isVisitHappening(visit.status)
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

  const occurrences = values.repeat
    ? buildOccurrences(values.date, {
        every: Number(values.repeatEvery) || 1,
        unit: values.repeatUnit,
        weekdays: values.repeatDays,
        ends: values.ends,
        endsOn: values.endsOn ?? values.date,
        endsAfter: Number(values.endsAfter) || 1,
      })
    : [values.date];

  const set = <K extends keyof AppointmentFormValues>(name: K, value: AppointmentFormValues[K]) =>
    form.setValue(name, value as never, {
      shouldDirty: true,
      shouldValidate: form.formState.isSubmitted,
    });

  const selectPatient = (next: Patient) => {
    set('patientId', next.id);
    set('location', next.serviceLocation);
    set('payer', next.payers.length === 1 ? next.payers[0] : null);
  };

  const clearPatient = () => {
    set('patientId', null);
    set('location', null);
    set('payer', null);
  };

  const changeService = (service: string) => {
    set('service', service);
    if (!form.getValues('duration')) {
      set('duration', String(findService(service)?.defaultMinutes ?? ''));
    }
  };

  const changeDate = (date: Date) => {
    const previous = form.getValues('date');
    set('date', date);
    const days = form.getValues('repeatDays');
    if (days.length === 1 && days[0] === previous.getDay()) set('repeatDays', [date.getDay()]);
  };

  const toggleRepeatDay = (weekday: number) => {
    const days = form.getValues('repeatDays');
    set(
      'repeatDays',
      days.includes(weekday) ? days.filter((day) => day !== weekday) : [...days, weekday]
    );
  };

  const canSubmit = Boolean(
    values.patientId &&
    values.location &&
    values.service &&
    values.payer &&
    values.startTime &&
    values.duration
  );

  const submit = () =>
    void form.handleSubmit(
      (submitted) => {
        const chosen = patients.find((item) => item.id === submitted.patientId);
        const service = findService(submitted.service);
        if (!chosen || !service || !submitted.startTime) return;
        const location = findLocation(submitted.location);
        const minutes = Number(submitted.duration);
        const stamp = Date.now();
        const created: Visit[] = occurrences.slice(0, MAX_OCCURRENCES).map((day, index) => ({
          id: `visit-${stamp}-${index}`,
          patientId: chosen.id,
          patientName: chosen.name,
          patientTag: chosen.tag,
          startsAt: atTime(day, submitted.startTime as Date).toISOString(),
          durationMinutes: minutes,
          status: 'scheduled',
          visitType: service.visitType,
          discipline: 'Physical therapy',
          summary: [chosen.discipline, service.visitType, location?.short]
            .filter(Boolean)
            .join(' · '),
          providerName: provider.name,
          location: location?.label ?? '',
          address: chosen.address,
          phone: chosen.phone,
          guardian: chosen.guardian,
          payer: submitted.payer ?? '',
          units: {
            summary: `${chosen.units.usedThisWeek} of ${chosen.units.authorizedPerWeek} this week · ${chosen.units.remainingInclMakeup} remaining incl. makeup`,
          },
          notes: submitted.notes.trim() || undefined,
        }));
        dispatch(addVisits(created));
        dispatch(
          setToastMessage({
            message:
              created.length === 1
                ? `Scheduled ${chosen.name}`
                : `Scheduled ${created.length} appointments for ${chosen.name}`,
            action: {
              label: 'Undo',
              onPress: removeVisits({ ids: created.map((visit) => visit.id) }),
            },
          })
        );
        haptics.success();
        leave();
      },
      () => haptics.error()
    )();

  return {
    control: form.control,
    errors: form.formState.errors,
    values,
    patient,
    patients,
    providerName: provider.name,
    services: SERVICES,
    dayVisits,
    overlapping,
    markedDays,
    isPast: (day: Date) => day < today && !isSameDay(day, today),
    occurrences,
    canSubmit,
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
