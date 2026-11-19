import { addDays, startOfMonth, startOfWeek } from '@/domain/schedule/calendar';
import type { ApiAppointment } from '@/domain/visits/interfaces/AppointmentApi';
import type { Visit, VisitStatus } from '@/domain/visits/interfaces/VisitInterfaces';
import type { ApiVisitStatusChange } from '@/domain/visits/store/services/VisitServices';
import { toIsoDate } from '@/utils/dateFormat';

const STATUSES: Record<string, VisitStatus> = {
  scheduled: 'scheduled',
  in_progress: 'inProgress',
  completed: 'completed',
  cancelled: 'cancelled',
  no_show: 'noShow',
  rescheduled: 'rescheduled',
};

const API_STATUS: Partial<Record<VisitStatus, ApiVisitStatusChange['status']>> = {
  scheduled: 'scheduled',
  cancelled: 'cancelled',
  noShow: 'no_show',
};

export const toApiVisitStatus = (status: VisitStatus) => API_STATUS[status];

export function toStartsAt(date: string, time: string) {
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = time.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes).toISOString();
}

export function toVisit(appointment: ApiAppointment): Visit {
  const { patient, provider, authorization } = appointment;
  return {
    id: appointment.id,
    version: appointment.version,
    patientId: patient.id,
    patientName: patient.name,
    patientTag: patient.mrn,
    startsAt: toStartsAt(appointment.date, appointment.start_time),
    durationMinutes: appointment.duration_min,
    status: STATUSES[appointment.status] ?? 'scheduled',
    visitType: appointment.visit_type_label,
    discipline: provider.discipline_label,
    summary: [appointment.service_label, appointment.visit_type_label, appointment.payer_label]
      .filter(Boolean)
      .join(' · '),
    providerName: provider.name,
    location: [appointment.place_label, appointment.evv_required ? 'EVV required' : 'EVV exempt']
      .filter(Boolean)
      .join(' · '),
    address: appointment.address?.line ?? patient.address,
    phone: patient.phone,
    payer: authorization
      ? `${appointment.payer_label} · PA ${authorization.pa_number}`
      : appointment.payer_label,
    units: {
      summary: `${appointment.units} units (${appointment.duration_min} min)`,
      detail: authorization?.units_per_week
        ? `Authorized ${authorization.units_per_week} units a week.`
        : undefined,
    },
    notes: appointment.notes || undefined,
    booking: {
      providerId: provider.id,
      serviceCode: appointment.service_code,
      visitType: appointment.visit_type,
      placeOfService: appointment.place_of_service,
      addressId: appointment.address?.id ?? null,
      payer: appointment.payer,
      date: appointment.date,
      startTime: appointment.start_time.slice(0, 5),
      notes: appointment.notes,
      rescheduledTo: appointment.rescheduled_to,
    },
  };
}

const MAX_RANGE_DAYS = 62;

/** The weeks shown for a month, which always fits the API's 62-day limit. */
export function monthRange(day: Date) {
  const from = startOfWeek(startOfMonth(day));
  return { from: toIsoDate(from), to: toIsoDate(addDays(from, 41)) };
}

export const weekRange = (day: Date) => {
  const from = startOfWeek(day);
  return { from: toIsoDate(from), to: toIsoDate(addDays(from, 6)) };
};

export const isWithinApiLimit = (from: string, to: string) =>
  (Date.parse(to) - Date.parse(from)) / 86_400_000 + 1 <= MAX_RANGE_DAYS;
