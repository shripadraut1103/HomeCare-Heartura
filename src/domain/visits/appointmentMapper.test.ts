import {
  isWithinApiLimit,
  monthRange,
  toStartsAt,
  toVisit,
} from '@/domain/visits/appointmentMapper';
import type { ApiAppointment } from '@/domain/visits/interfaces/AppointmentApi';

const appointment: ApiAppointment = {
  id: 'a1',
  patient: {
    id: 'p1',
    name: 'Aisha Vance',
    mrn: 'HCT-10431',
    dob: '1994-04-12',
    sex: 'F',
    phone: '(201) 555-0311',
    address: '512 Prospect Ave, Hackensack, NJ 07601',
    place_of_service: '12',
    services: ['PT'],
    status: 'active',
    residence: null,
  },
  provider: {
    id: 'm1',
    name: 'Helena Ruiz, DPT',
    discipline: 'pt',
    discipline_label: 'Physical therapy',
    role: 'therapist',
    supervisor: '',
  },
  service_code: 'S8990',
  service_label: 'PT',
  visit_type: 'daily',
  visit_type_label: 'Daily visit',
  date: '2026-11-18',
  start_time: '09:30',
  end_time: '10:15',
  duration_min: 45,
  units: 3,
  place_of_service: '12',
  place_label: 'Private home',
  address: { id: 'ad1', line: '600 First Ave, Raritan, NJ 08869' },
  evv_required: true,
  payer: 'medicaid',
  payer_label: 'NJ Medicaid',
  status: 'no_show',
  status_label: 'No-show',
  status_note: '',
  notes: '',
  series: null,
  authorization: {
    id: 'au1',
    pa_number: '26041988',
    start_date: '2026-09-01',
    end_date: null,
    total_units: 418,
    units_per_week: 8,
    unit_type: '15min',
  },
  rescheduled_from: null,
  rescheduled_to: null,
  conflict_overridden: false,
  conflict_reason: '',
  created_by_name: 'Helena Ruiz',
  version: 3,
  created_at: '2026-11-01T10:00:00Z',
  updated_at: '2026-11-01T10:00:00Z',
};

describe('appointmentMapper', () => {
  it('reads the date and HH:MM time as local wall-clock time', () => {
    const startsAt = new Date(toStartsAt('2026-11-18', '09:30'));
    expect([startsAt.getHours(), startsAt.getMinutes(), startsAt.getDate()]).toEqual([9, 30, 18]);
  });

  it('turns an API appointment into the visit the screens show', () => {
    expect(toVisit(appointment)).toMatchObject({
      id: 'a1',
      version: 3,
      patientName: 'Aisha Vance',
      patientTag: 'HCT-10431',
      durationMinutes: 45,
      status: 'noShow',
      summary: 'PT · Daily visit · NJ Medicaid',
      location: 'Private home · EVV required',
      address: '600 First Ave, Raritan, NJ 08869',
      payer: 'NJ Medicaid · PA 26041988',
      units: { summary: '3 units (45 min)', detail: 'Authorized 8 units a week.' },
      notes: undefined,
    });
  });

  it('falls back to the patient’s address and keeps unknown statuses scheduled', () => {
    const visit = toVisit({ ...appointment, address: null, status: 'something_new' });
    expect(visit.address).toBe('512 Prospect Ave, Hackensack, NJ 07601');
    expect(visit.status).toBe('scheduled');
  });

  it('asks for the six weeks a month view shows, within the 62-day limit', () => {
    const range = monthRange(new Date(2026, 10, 18));
    expect(range).toEqual({ from: '2026-11-01', to: '2026-12-12' });
    expect(isWithinApiLimit(range.from, range.to)).toBe(true);
  });
});
