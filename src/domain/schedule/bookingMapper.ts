import type { SelectOption } from '@/components/ui/Select';
import type {
  ApiAppointmentUpdate,
  ApiBookablePatient,
  ApiBookingSlot,
  ApiConflict,
  ApiPatientOption,
  ApiPayer,
  ApiRepeat,
  ApiSchedulingReference,
  ApiServicePlanAuthorization,
  ApiVisitType,
} from '@/domain/schedule/interfaces/BookingApi';
import type { VisitBooking } from '@/domain/visits/interfaces/VisitInterfaces';
import type { ServiceError } from '@/types/ServiceInterfaces';
import {
  formatNumericDate,
  formatTime,
  parseIsoDate,
  parseTimeOfDay,
  toIsoDate,
  toTimeOfDay,
} from '@/utils/dateFormat';

export type Option = SelectOption<string>;

export const DEFAULT_PLACE = '12';
export const DEFAULT_VISIT_TYPE: ApiVisitType = 'daily';
const PROSPECT = 'prospect';

const unique = (values: string[]) => [...new Set(values)];

export const isProspect = (status: string | undefined) => status === PROSPECT;

export const toApiWeekday = (jsWeekday: number) => (jsWeekday + 6) % 7;

export function placeOptions(reference: ApiSchedulingReference): Option[] {
  return reference.places_of_service.map((place) => ({
    value: place.value,
    label: [
      place.label.includes(place.value) ? place.label : `${place.label} · ${place.value}`,
      place.evv_required ? 'EVV required' : 'no EVV',
    ].join(' · '),
  }));
}

export function visitTypeOptions(
  reference: ApiSchedulingReference,
  patientStatus: string | undefined
): Option[] {
  const types = reference.visit_types.map(({ value, label }) => ({ value, label }));
  return isProspect(patientStatus) ? types.filter((type) => type.value === 'evaluation') : types;
}

export function serviceOptions(
  reference: ApiSchedulingReference,
  plan: ApiBookablePatient | null
): Option[] {
  const labels = new Map(reference.services.map((service) => [service.value, service.label]));
  const codes = plan?.service_plans.length
    ? plan.service_plans.map((service) => service.service_code)
    : reference.services.map((service) => service.value);
  return unique(codes).map((code) => ({ value: code, label: labels.get(code) ?? code }));
}

function sameDiscipline(reference: ApiSchedulingReference, serviceCode: string) {
  const label = reference.services.find((service) => service.value === serviceCode)?.label ?? '';
  const words = label.toLowerCase().split(/[^a-z]+/);
  return reference.providers.filter(
    (provider) =>
      words.includes(provider.discipline.toLowerCase()) ||
      label.toLowerCase() === provider.discipline_label.toLowerCase()
  );
}

export function providerOptions(
  reference: ApiSchedulingReference,
  plan: ApiBookablePatient | null,
  serviceCode: string | null
): Option[] {
  const planned =
    plan?.service_plans.find((service) => service.service_code === serviceCode)?.provider_ids ?? [];
  const matching = planned.length
    ? reference.providers.filter((provider) => planned.includes(provider.id))
    : serviceCode
      ? sameDiscipline(reference, serviceCode)
      : [];
  const providers = matching.length ? matching : reference.providers;
  return providers.map((provider) => ({
    value: provider.id,
    label: provider.name,
    hint: provider.discipline_label || undefined,
  }));
}

export function coveringAuthorization(
  plan: ApiBookablePatient,
  serviceCode: string | null,
  date: string
): ApiServicePlanAuthorization | undefined {
  return plan.service_plans
    .find((service) => service.service_code === serviceCode)
    ?.authorizations.find(
      (authorization) =>
        authorization.start_date <= date &&
        (!authorization.end_date || authorization.end_date >= date)
    );
}

export function payerOptions(
  reference: ApiSchedulingReference,
  plan: ApiBookablePatient | null,
  serviceCode: string | null,
  date: string
): SelectOption<ApiPayer>[] {
  if (!plan) return [];
  const label = (value: ApiPayer) =>
    reference.payers.find((payer) => payer.value === value)?.label ?? value;
  const options: SelectOption<ApiPayer>[] = [];
  const authorization = coveringAuthorization(plan, serviceCode, date);
  if (authorization || plan.primary_payer) {
    const name = plan.primary_payer || label('medicaid');
    options.push({
      value: 'medicaid',
      label: authorization ? `${name} · PA ${authorization.pa_number}` : name,
    });
  }
  if (plan.private_pay_enabled) options.push({ value: 'private_pay', label: label('private_pay') });
  return options;
}

export function addressOptions(plan: ApiBookablePatient | null): Option[] {
  return (plan?.addresses ?? []).map((address) => ({
    value: address.id,
    label: address.line,
    hint: address.use_for_evv ? 'Used for EVV' : undefined,
  }));
}

export type BookingDefaults = {
  service: string | null;
  provider: string | null;
  payer: ApiPayer | null;
  location: string;
  address: string | null;
  visitType: ApiVisitType;
};

export function bookingDefaults(
  reference: ApiSchedulingReference,
  plan: ApiBookablePatient,
  date: string,
  preferredProviderId?: string | null
): BookingDefaults {
  const services = serviceOptions(reference, plan);
  const service =
    services.length === 1 || plan.service_plans.length ? (services[0]?.value ?? null) : null;
  const providers = providerOptions(reference, plan, service);
  const provider =
    providers.length === 1
      ? providers[0].value
      : (providers.find((option) => option.value === preferredProviderId)?.value ?? null);
  const payers = payerOptions(reference, plan, service, date);
  const places = reference.places_of_service.map((place) => place.value);
  const address =
    plan.addresses.find((item) => item.use_for_evv)?.id ?? plan.addresses[0]?.id ?? null;
  return {
    service,
    provider,
    payer: payers[0]?.value ?? null,
    location: places.includes(plan.place_of_service) ? plan.place_of_service : DEFAULT_PLACE,
    address,
    visitType: isProspect(plan.status) ? 'evaluation' : DEFAULT_VISIT_TYPE,
  };
}

export function preferredProviderId(
  reference: ApiSchedulingReference,
  user: { first_name?: string; last_name?: string } | undefined
) {
  const name = [user?.first_name, user?.last_name].filter(Boolean).join(' ').toLowerCase();
  if (!name) return null;
  return (
    reference.providers.find((provider) => provider.name.toLowerCase().startsWith(name))?.id ?? null
  );
}

export const patientOptionFromPlan = (plan: ApiBookablePatient): ApiPatientOption => ({
  id: plan.id,
  name: plan.name,
  mrn: plan.mrn,
  dob: plan.dob,
  town: plan.residence?.town ?? '',
  status: plan.status,
});

export function describePatient(patient: ApiPatientOption) {
  return [
    patient.mrn,
    patient.dob ? `DOB ${formatNumericDate(parseIsoDate(patient.dob))}` : null,
    patient.town || null,
  ]
    .filter(Boolean)
    .join(' · ');
}

export type BookingDraft = {
  patientId: string;
  providerId: string;
  serviceCode: string;
  visitType: string;
  date: Date;
  startTime: Date;
  durationMin: number;
  placeOfService: string;
  addressId: string | null;
  payer: string;
};

export const toBookingSlot = (draft: BookingDraft): ApiBookingSlot => ({
  patient: draft.patientId,
  provider: draft.providerId,
  service_code: draft.serviceCode,
  visit_type: draft.visitType as ApiVisitType,
  date: toIsoDate(draft.date),
  start_time: toTimeOfDay(draft.startTime),
  duration_min: draft.durationMin,
  place_of_service: draft.placeOfService,
  address: draft.addressId,
  payer: draft.payer as ApiPayer,
});

export type RepeatDraft = {
  every: number;
  unit: 'day' | 'week';
  weekdays: readonly number[];
  ends: 'never' | 'on' | 'after';
  endsOn: Date | null;
  endsAfter: number;
};

export const toApiRepeat = (repeat: RepeatDraft): ApiRepeat => ({
  interval: repeat.every,
  unit: repeat.unit,
  weekdays:
    repeat.unit === 'week'
      ? [...new Set(repeat.weekdays.map(toApiWeekday))].sort((a, b) => a - b)
      : [],
  ends: repeat.ends,
  until: repeat.ends === 'on' && repeat.endsOn ? toIsoDate(repeat.endsOn) : null,
  count: repeat.ends === 'after' ? repeat.endsAfter : null,
});

export function toAppointmentUpdate(
  original: VisitBooking & { durationMin: number },
  slot: ApiBookingSlot,
  notes: string,
  version: number
): ApiAppointmentUpdate {
  const body: ApiAppointmentUpdate = { version };
  if (slot.provider !== original.providerId) body.provider = slot.provider;
  if (slot.service_code !== original.serviceCode) body.service_code = slot.service_code;
  if (slot.visit_type !== original.visitType) body.visit_type = slot.visit_type;
  if (slot.date !== original.date) body.date = slot.date;
  if (slot.start_time !== original.startTime) body.start_time = slot.start_time;
  if (slot.duration_min !== original.durationMin) body.duration_min = slot.duration_min;
  if (slot.place_of_service !== original.placeOfService) {
    body.place_of_service = slot.place_of_service;
  }
  if (slot.address !== original.addressId) body.address = slot.address;
  if (slot.payer !== original.payer) body.payer = slot.payer;
  if (notes !== original.notes) body.notes = notes;
  return body;
}

const isConflict = (value: unknown): value is ApiConflict =>
  typeof value === 'object' && value !== null && 'start_time' in value && 'date' in value;

export function conflictsFrom(error: ServiceError): ApiConflict[] | null {
  const conflicts = error.details.conflicts;
  return Array.isArray(conflicts) ? conflicts.filter(isConflict) : null;
}

export function describeConflict(conflict: ApiConflict) {
  const day = parseIsoDate(conflict.date);
  const start = formatTime(parseTimeOfDay(conflict.start_time, day));
  const end = formatTime(parseTimeOfDay(conflict.end_time, day));
  const who = conflict.who.includes('provider')
    ? conflict.who.includes('patient')
      ? 'Patient and provider busy'
      : 'Provider busy'
    : 'Patient busy';
  return {
    title: `${formatNumericDate(day)} · ${start} – ${end}`,
    detail: [who, conflict.service, conflict.provider_name, conflict.patient_mrn]
      .filter(Boolean)
      .join(' · '),
  };
}

const FORM_FIELDS: Record<string, string> = {
  patient: 'patientId',
  provider: 'provider',
  service_code: 'service',
  visit_type: 'visitType',
  date: 'date',
  start_time: 'startTime',
  duration_min: 'duration',
  place_of_service: 'location',
  address: 'address',
  payer: 'payer',
  notes: 'notes',
  note: 'notes',
  conflict_reason: 'conflictReason',
  repeat: 'repeatEvery',
};

export function formFieldErrors(fields: Record<string, string[]>) {
  return Object.entries(fields).flatMap(([field, messages]) => {
    const name = FORM_FIELDS[field];
    return name && messages[0] ? [{ name, message: messages[0] }] : [];
  });
}
