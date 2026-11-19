import type { ApiPatient } from '@/domain/patients/interfaces/PatientApi';
import { toApiStatus, toChart, toPatient } from '@/domain/patients/patientMapper';
import PatientsReducer from '@/domain/patients/store/PatientsReducer';
import {
  fetchPatientAction,
  fetchPatientsAction,
} from '@/domain/patients/store/async-actions/PatientAsyncActions';

const apiPatient = (overrides: Partial<ApiPatient> = {}): ApiPatient => ({
  id: 'p1',
  mrn: 'MRN-001',
  first_name: 'Ava',
  last_name: 'Stone',
  primary_provider: null,
  dob: '2015-04-02',
  ddd_id: 'DDD-9',
  medicaid_id: 'MCD-7',
  services: ['ot', 'pt'],
  services_label: 'OT, PT',
  group_home: { id: 'g1', name: 'Maple House' },
  support_coordinator: null,
  status: 'denied',
  status_label: 'Denied',
  status_note: '',
  location: { setting: 'group_home', place_of_service: '14', evv_required: true },
  county: 'Hudson',
  providers: [
    { id: 'u1', name: 'Kim Lee', discipline: 'ot' },
    { id: 'u2', name: 'Raj Patel', discipline: 'pt' },
  ],
  version: 3,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  ...overrides,
});

const page = (results: ApiPatient[], next: string | null) => ({
  data: { count: 30, page: 1, page_size: 25, total_pages: 2, next, previous: null, results },
});

describe('toPatient', () => {
  it('maps the API patient to the card fields', () => {
    const patient = toPatient(apiPatient());
    expect(patient).toMatchObject({
      id: 'p1',
      name: 'Ava Stone',
      code: 'MRN-001',
      tag: 'MRN-001',
      status: 'denied',
      medicaidId: 'MCD-7',
      dateOfBirth: '2015-04-02',
      discipline: 'OT · PT',
      serviceLocation: 'group-home',
    });
  });

  it('uses the service location label for the card', () => {
    const patient = toPatient(
      apiPatient({
        service_location: {
          code: '12',
          label: 'Private home · 12',
          evv_required: true,
          address: '',
        },
      })
    );
    expect(patient.locationLabel).toBe('Private home · 12');
  });

  it('falls back safely on values it does not know', () => {
    const patient = toPatient(
      apiPatient({
        status: 'archived',
        status_label: 'Archived',
        medicaid_id: '',
        location: null,
        services: [],
      })
    );
    expect(patient.status).toBe('inactive');
    expect(patient.statusLabel).toBe('Archived');
    expect(patient.medicaidId).toBeUndefined();
    expect(patient.serviceLocation).toBe('');
    expect(patient.locationLabel).toBeUndefined();
    expect(patient.discipline).toBe('OT, PT');
  });
});

describe('toApiStatus', () => {
  it('sends the backend value, and nothing for all', () => {
    expect(toApiStatus('denied')).toBe('denied');
    expect(toApiStatus('request')).toBe('request');
    expect(toApiStatus('all')).toBeUndefined();
    expect(toApiStatus('active')).toBe('active,suspended');
  });
});

describe('toChart', () => {
  it('builds services with their team and keeps what the app already added', () => {
    const first = toChart(apiPatient());
    expect(first.services.map((service) => service.team)).toEqual([['Kim Lee'], ['Raj Patel']]);
    expect(first.providers).toHaveLength(2);
    expect(first.groupHome?.name).toBe('Maple House');

    const withNote = { ...first, notes: [{ id: 'n1' }] } as unknown as typeof first;
    expect(toChart(apiPatient(), withNote).notes).toHaveLength(1);
  });
});

describe('PatientsReducer API cases', () => {
  const initial = PatientsReducer(undefined, { type: 'init' });
  const query = (pageNumber: number) => ({ search: '', page: pageNumber });

  it('replaces the list on page 1 and appends on later pages', () => {
    let state = PatientsReducer(
      initial,
      fetchPatientsAction.fulfilled(page([apiPatient()], 'next'), 'r1', query(1))
    );
    expect(state.list).toMatchObject({ ids: ['p1'], count: 30, page: 1, hasMore: true });
    expect(state.byId.p1.name).toBe('Ava Stone');

    state = PatientsReducer(
      state,
      fetchPatientsAction.fulfilled(page([apiPatient({ id: 'p2' })], null), 'r2', query(2))
    );
    expect(state.list.ids).toEqual(['p1', 'p2']);
    expect(state.list.hasMore).toBe(false);
  });

  it('keeps the error for the screen to show', () => {
    const failed = {
      error: 'Network error',
      code: 'NETWORK',
      status: 0,
      details: null,
      fields: {},
    };
    const state = PatientsReducer(
      initial,
      fetchPatientsAction.fulfilled(failed as never, 'r1', query(1))
    );
    expect(state.list.error).toBe('Network error');
    expect(state.list.loading).toBe(false);
  });

  it('maps request status', () => {
    expect(toPatient(apiPatient({ status: 'request' })).status).toBe('request');
  });

  it('saves a fetched patient and its chart', () => {
    const state = PatientsReducer(
      initial,
      fetchPatientAction.fulfilled({ data: apiPatient({ id: 'p9' }) }, 'r1', 'p9')
    );
    expect(state.byId.p9.code).toBe('MRN-001');
    expect(state.charts.p9.dddId).toBe('DDD-9');
  });
});
