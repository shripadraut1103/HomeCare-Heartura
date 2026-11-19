import { serviceError } from '@/config/ApiError';
import {
  bookingDefaults,
  conflictsFrom,
  describeConflict,
  formFieldErrors,
  payerOptions,
  placeOptions,
  preferredProviderId,
  providerOptions,
  serviceOptions,
  toApiRepeat,
  toApiWeekday,
  toAppointmentUpdate,
  toBookingSlot,
  visitTypeOptions,
} from '@/domain/schedule/bookingMapper';
import type {
  ApiBookablePatient,
  ApiSchedulingReference,
} from '@/domain/schedule/interfaces/BookingApi';
import { formatTime } from '@/utils/dateFormat';

const provider = (id: string, name: string, discipline: string, label: string) => ({
  id,
  name,
  discipline,
  discipline_label: label,
  role: 'therapist',
  supervisor: '',
});

const reference: ApiSchedulingReference = {
  statuses: [],
  visit_types: [
    { value: 'daily', label: 'Daily visit' },
    { value: 'evaluation', label: 'Evaluation' },
  ],
  services: [
    { value: 'S8990', label: 'PT' },
    { value: 'S9129', label: 'OT' },
  ],
  payers: [
    { value: 'medicaid', label: 'Medicaid · authorization' },
    { value: 'private_pay', label: 'Private pay' },
  ],
  places_of_service: [
    { value: '12', label: 'Private home', evv_required: true },
    { value: '02', label: 'Virtual', evv_required: false },
  ],
  repeat_units: [],
  repeat_ends: [],
  duration: { min: 15, max: 480, step: 15 },
  minutes_per_unit: 15,
  max_repeats: 366,
  providers: [
    provider('m1', 'Helena Ruiz, DPT', 'pt', 'Physical therapy'),
    provider('m2', 'Omar Haddad, PT', 'pt', 'Physical therapy'),
    provider('m3', 'Lena Park, OTR', 'ot', 'Occupational therapy'),
  ],
};

const plan: ApiBookablePatient = {
  id: 'p1',
  name: 'Aisha Vance',
  mrn: 'HCT-10431',
  dob: '1994-04-12',
  sex: 'F',
  phone: '',
  address: '',
  place_of_service: '14',
  services: ['PT'],
  status: 'active',
  residence: null,
  addresses: [
    { id: 'ad1', kind: 'home', line: '1 Main St', use_for_evv: false },
    { id: 'ad2', kind: 'group_home', line: '2 Oak Ave', use_for_evv: true },
  ],
  private_pay_enabled: false,
  primary_payer: 'NJ Medicaid',
  service_plans: [
    {
      service_code: 'S8990',
      provider_ids: ['m2'],
      authorizations: [
        {
          id: 'au1',
          source: 'medicaid',
          pa_number: '26041988',
          start_date: '2026-11-01',
          end_date: '2026-12-31',
        },
      ],
    },
  ],
};

describe('bookingMapper', () => {
  it('offers only the patient’s services, or every service when they have none', () => {
    expect(serviceOptions(reference, plan)).toEqual([{ value: 'S8990', label: 'PT' }]);
    expect(serviceOptions(reference, { ...plan, service_plans: [] })).toHaveLength(2);
  });

  it('offers the service’s providers, else the providers of that discipline', () => {
    expect(providerOptions(reference, plan, 'S8990').map((option) => option.value)).toEqual(['m2']);
    const open = { ...plan, service_plans: [{ ...plan.service_plans[0], provider_ids: [] }] };
    expect(providerOptions(reference, open, 'S8990').map((option) => option.value)).toEqual([
      'm1',
      'm2',
    ]);
  });

  it('offers Medicaid only while an authorization covers the date', () => {
    expect(payerOptions(reference, plan, 'S8990', '2026-11-20')).toEqual([
      { value: 'medicaid', label: 'NJ Medicaid · PA 26041988' },
    ]);
    expect(payerOptions(reference, plan, 'S8990', '2027-01-04')).toEqual([
      { value: 'medicaid', label: 'NJ Medicaid' },
    ]);
    expect(payerOptions(reference, { ...plan, primary_payer: '' }, 'S8990', '2027-01-04')).toEqual(
      []
    );
    expect(
      payerOptions(
        reference,
        { ...plan, primary_payer: '', private_pay_enabled: true },
        'S8990',
        '2027-01-04'
      )
    ).toEqual([{ value: 'private_pay', label: 'Private pay' }]);
    expect(
      payerOptions(
        reference,
        { ...plan, service_plans: [], primary_payer: 'Thinkitive' },
        null,
        '2026-11-20'
      )
    ).toEqual([{ value: 'medicaid', label: 'Thinkitive' }]);
  });

  it('labels places with their code and EVV rule', () => {
    expect(placeOptions(reference)[1]).toEqual({ value: '02', label: 'Virtual · 02 · no EVV' });
    expect(
      placeOptions({
        ...reference,
        places_of_service: [{ value: '12', label: 'Private home · 12', evv_required: true }],
      })[0].label
    ).toBe('Private home · 12 · EVV required');
  });

  it('books a prospect for the evaluation only', () => {
    expect(visitTypeOptions(reference, 'prospect').map((option) => option.value)).toEqual([
      'evaluation',
    ]);
    expect(
      bookingDefaults(reference, { ...plan, status: 'prospect' }, '2026-11-20').visitType
    ).toBe('evaluation');
  });

  it('pre-fills the form from the booking plan', () => {
    expect(bookingDefaults(reference, plan, '2026-11-20')).toEqual({
      service: 'S8990',
      provider: 'm2',
      payer: 'medicaid',
      location: '12',
      address: 'ad2',
      visitType: 'daily',
    });
    const withHome = { ...plan, place_of_service: '02' };
    expect(bookingDefaults(reference, withHome, '2026-11-20').location).toBe('02');
  });

  it('prefers the signed-in provider among several', () => {
    const open = { ...plan, service_plans: [{ ...plan.service_plans[0], provider_ids: [] }] };
    const id = preferredProviderId(reference, { first_name: 'Omar', last_name: 'Haddad' });
    expect(id).toBe('m2');
    expect(bookingDefaults(reference, open, '2026-11-20', id).provider).toBe('m2');
    expect(bookingDefaults(reference, open, '2026-11-20').provider).toBeNull();
  });

  it('sends dates, 24-hour times and the place as a string code', () => {
    expect(
      toBookingSlot({
        patientId: 'p1',
        providerId: 'm2',
        serviceCode: 'S8990',
        visitType: 'daily',
        date: new Date(2026, 10, 20),
        startTime: new Date(2026, 10, 20, 14, 5),
        durationMin: 45,
        placeOfService: '02',
        addressId: null,
        payer: 'medicaid',
      })
    ).toEqual({
      patient: 'p1',
      provider: 'm2',
      service_code: 'S8990',
      visit_type: 'daily',
      date: '2026-11-20',
      start_time: '14:05',
      duration_min: 45,
      place_of_service: '02',
      address: null,
      payer: 'medicaid',
    });
  });

  it('turns Sunday-first weekdays into the API’s Monday = 0', () => {
    expect([0, 1, 6].map(toApiWeekday)).toEqual([6, 0, 5]);
    expect(
      toApiRepeat({
        every: 1,
        unit: 'week',
        weekdays: [3, 1],
        ends: 'after',
        endsOn: null,
        endsAfter: 8,
      })
    ).toEqual({
      interval: 1,
      unit: 'week',
      weekdays: [0, 2],
      ends: 'after',
      until: null,
      count: 8,
    });
    expect(
      toApiRepeat({
        every: 2,
        unit: 'day',
        weekdays: [1],
        ends: 'on',
        endsOn: new Date(2027, 0, 31),
        endsAfter: 8,
      })
    ).toEqual({
      interval: 2,
      unit: 'day',
      weekdays: [],
      ends: 'on',
      until: '2027-01-31',
      count: null,
    });
  });

  it('sends only the changed fields with the version when editing', () => {
    const original = {
      providerId: 'm2',
      serviceCode: 'S8990',
      visitType: 'daily',
      placeOfService: '12',
      addressId: 'ad2',
      payer: 'medicaid',
      date: '2026-11-20',
      startTime: '10:00',
      notes: '',
      rescheduledTo: null,
      durationMin: 45,
    };
    const slot = {
      patient: 'p1',
      provider: 'm2',
      service_code: 'S8990',
      visit_type: 'daily' as const,
      date: '2026-11-20',
      start_time: '11:30',
      duration_min: 60,
      place_of_service: '12',
      address: 'ad2',
      payer: 'medicaid' as const,
    };
    expect(toAppointmentUpdate(original, slot, 'Gate 4', 3)).toEqual({
      version: 3,
      start_time: '11:30',
      duration_min: 60,
      notes: 'Gate 4',
    });
  });

  it('reads the conflicts of a refused booking', () => {
    const conflict = {
      id: 'c1',
      date: '2026-11-20',
      start_time: '09:30',
      end_time: '10:15',
      who: ['provider'],
      patient_mrn: 'HCT-2',
      provider_name: 'Omar Haddad, PT',
      service: 'PT',
    };
    const error = serviceError('SCHEDULE_CONFLICT', 'Overlaps', 409, {
      conflicts: [conflict, 'x'],
    });
    expect(conflictsFrom(error)).toEqual([conflict]);
    expect(conflictsFrom(serviceError('SCHEDULE_CONFLICT', 'Overlaps', 409))).toBeNull();
    expect(describeConflict(conflict)).toEqual({
      title: `11/20/2026 · ${formatTime(new Date(2026, 10, 20, 9, 30))} – ${formatTime(new Date(2026, 10, 20, 10, 15))}`,
      detail: 'Provider busy · PT · Omar Haddad, PT · HCT-2',
    });
  });

  it('maps API field errors onto the form fields', () => {
    expect(
      formFieldErrors({ start_time: ['Pick a time'], duration_min: ['Too long'], other: ['x'] })
    ).toEqual([
      { name: 'startTime', message: 'Pick a time' },
      { name: 'duration', message: 'Too long' },
    ]);
  });
});
