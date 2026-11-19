import type {
  ApiAllergy,
  ApiCoverage,
  ApiDiagnosis,
  ApiIncident,
  ApiPatient,
  ApiPatientChart,
  ApiPatientDocument,
} from '@/domain/patients/interfaces/PatientApi';
import {
  noteTitle,
  toAllergy,
  toChartFields,
  toDiagnosis,
  toDocument,
  toHistoryEntry,
  toIncident,
  toIncidentRequest,
  toInsurancePlan,
  toNumericDate,
  toPatientFields,
} from '@/domain/patients/patientChartMapper';
import { eligibilityPill } from '@/domain/patients/patientInsurance';
import PatientsReducer, { refreshPatient } from '@/domain/patients/store/PatientsReducer';
import { createAppointmentsAction } from '@/domain/visits/store/async-actions/VisitAsyncActions';
import {
  createAllergyAction,
  createIncidentAction,
  createNoteAction,
  fetchDiagnosesAction,
  fetchHistoryAction,
  fetchIncidentsAction,
  fetchPatientAction,
  fetchPatientChartAction,
  updateIncidentAction,
  uploadDocumentAction,
} from '@/domain/patients/store/async-actions/PatientAsyncActions';

const note = (id: string, critical: boolean) => ({
  id,
  title: '',
  note_date: '2026-10-01',
  text: `Note ${id}`,
  is_critical: critical,
  author_name: 'Kim Lee',
  created_at: '2026-10-01T10:00:00Z',
});

const failed = { error: 'Network error', code: 'NETWORK', status: 0, details: {}, fields: {} };

const chart: ApiPatientChart = {
  id: 'p1',
  mrn: 'MRN-1',
  first_name: 'Ava',
  last_name: 'Stone',
  status: 'active',
  dob: '1974-07-25',
  sex: 'female',
  language: 'other',
  ddd_id: 'DDD-1',
  medicaid_id: 'M1',
  services: ['pt'],
  guardians: [
    { name: 'Reagan Dorsey', relationship: 'guardian', email: '', phone: '(908) 555-0199' },
  ],
  addresses: ['12 Main St, Somerville, NJ', '600 First Ave, Raritan, NJ'],
  phones: [{ type: 'cell', number: '(908) 555-0101', ext: '' }],
  email: '',
  alert: null,
  diagnoses: [
    {
      id: 'd1',
      code: 'F70',
      description: 'Mild intellectual disabilities',
      primary: true,
      type: 'chronic',
      onset: '1974-07-25',
      status: 'active',
      noted_by: 'Dr. Burke',
    },
  ],
  primary_diagnosis: { code: 'F70', description: 'Mild intellectual disabilities' },
  allergies: [
    {
      id: 'a1',
      substance: 'Penicillin',
      reaction: 'Hives',
      severity: 'severe',
      kind: 'medication',
      onset: null,
      status: 'active',
      recorded_by: '',
    },
  ],
  group_home: null,
  support_coordination: null,
  ordering_physician: '',
  primary_care: { name: '', address: '', phone: '', email: '', fax: '' },
  insurance: { primary: 'NJ Medicaid', member_id: 'M1', secondary: '' },
  activity: [],
  critical_notes: [note('n1', true)],
  recent_notes: [note('n1', true), note('n2', false)],
  is_new: true,
  payers: [
    { name: 'NJ Medicaid', priority: 'primary', plan_type: 'medicaid', member_id: 'M1' },
    { name: 'Private pay', priority: '', plan_type: 'private_pay', member_id: '' },
  ],
  units_this_week: { used: 3, authorized: 6, remaining: 5, makeup: 2 },
  eligibility: {
    payer: 'NJ Medicaid',
    status: 'error',
    status_label: 'Could not check',
    eligible: null,
    checked_at: null,
  },
  address_list: [
    { type: 'day_program', type_label: 'Day program', line: '600 First Ave', is_primary: false },
    { type: 'home', type_label: 'Home', line: '12 Main St', is_primary: true },
  ],
  service_details: [
    {
      id: 's1',
      code: 'pt',
      label: 'Physical therapy',
      start_date: '2026-08-06',
      end_date: '2027-08-05',
      status: 'seeking',
      status_label: 'Seeking coverage',
      payer: 'NJ Medicaid',
      units: {
        unit_type: '15min',
        pa_number: '26050093',
        authorization_start: '2026-08-06',
        authorization_end: null,
        week_used: 3,
        week_allowed: 6,
        remaining: 5,
        used: 42,
        authorized: 312,
        accrued: 48,
        missed: 6,
        makeup: null,
        makeup_until: null,
      },
    },
  ],
};

const coverage = (overrides: Partial<ApiCoverage>): ApiCoverage => ({
  id: 'c1',
  payer_name: 'NJ Medicaid',
  plan: 'Waiver',
  plan_type_label: 'Medicaid',
  member_id: 'M1',
  group_id: '',
  effective_start: '2026-07-01',
  effective_end: null,
  priority: 'primary',
  is_active: true,
  insured_relationship_label: 'Self',
  eligibility_status: 'eligible',
  card_front_url: 'https://files/front',
  ...overrides,
});

const incident: ApiIncident = {
  id: 'i1',
  number: 1003,
  label: '',
  summary: 'Fall on the stairs',
  occurred_on: '2026-10-02',
  occurred_time: '15:20:00',
  type_label: 'Fall',
  location_label: 'Group home',
  injury_side_label: 'No injury',
  witnessed_by: '',
  what_happened: '',
  action_taken: '',
  notify_back_office: true,
  status: 'closed',
  reported_by: { id: 'u1', full_name: 'Priya Chandran' },
};

const diagnosis: ApiDiagnosis = {
  id: 'd2',
  name: 'Epilepsy',
  icd10: 'G40.909',
  type: 'chronic',
  type_label: 'Chronic',
  onset: '2010-01-02',
  status: 'monitoring',
  status_label: 'Monitoring',
  noted_by: 'Dr. Burke',
  primary: false,
  from_intake: false,
  version: 1,
};

const allergy: ApiAllergy = {
  id: 'a2',
  substance: 'Pollen',
  kind: 'environmental',
  kind_label: 'Environmental',
  reaction: 'Sneezing',
  severity: 'mild',
  severity_label: 'Mild',
  onset: null,
  status: 'active',
  status_label: 'Active',
  recorded_by: 'Kim Lee',
  version: 1,
};

const document: ApiPatientDocument = {
  id: 'doc1',
  name: '',
  file_name: 'isp.pdf',
  category: 'isp',
  category_label: 'ISP',
  section: 'providers',
  section_label: 'Providers',
  status: 'received',
  status_label: 'Received',
  document_date: '2026-09-03',
  uploaded_at: '2026-11-06T10:00:00Z',
  uploaded_by: 'Helena Ruiz',
  size: 1000,
  mime_type: 'application/pdf',
  version: 1,
};

const apiPatient = {
  id: 'p1',
  mrn: 'MRN-1',
  first_name: 'Ava',
  last_name: 'Stone',
  dob: '1974-07-25',
  primary_provider: null,
  ddd_id: 'DDD-1',
  medicaid_id: 'M1',
  services: ['pt'],
  services_label: 'PT',
  group_home: null,
  support_coordinator: null,
  status: 'active',
  status_label: 'Active',
  status_note: '',
  location: null,
  county: '',
  providers: [{ id: 'u1', name: 'Kim Lee', discipline: 'pt' }],
  version: 1,
  created_at: '',
  updated_at: '',
} satisfies ApiPatient;

const arg = { patientId: 'p1' };

describe('patientChartMapper', () => {
  it('maps the facesheet into the chart fields', () => {
    const fields = toChartFields(chart);
    expect(fields).toMatchObject({
      sex: 'Female',
      language: 'Other — interpreter',
      dddId: 'DDD-1',
      guardian: 'Reagan Dorsey · Court-appointed guardian · (908) 555-0199',
      phones: ['(908) 555-0101 · Cell'],
      addresses: [
        { label: 'Home', line: '12 Main St' },
        { label: 'Day program', line: '600 First Ave' },
      ],
      insurance: { primary: 'NJ Medicaid', secondary: undefined },
      eligibility: {
        payer: 'NJ Medicaid',
        eligible: null,
        status: 'error',
        label: 'Could not check',
      },
    });
    expect(fields.services?.[0]).toMatchObject({
      code: 'pt',
      name: 'Physical therapy',
      start: '08/06/2026',
      end: '08/05/2027',
      status: 'seeking',
      statusLabel: 'Seeking coverage',
      payer: 'NJ Medicaid',
      units: { used: 42, total: 312, accrued: 48, missed: 6, makeup: null },
    });
    expect(fields.diagnoses?.[0]).toMatchObject({ rank: 'primary', onset: '07/25/1974' });
    expect(fields.allergies?.[0]).toMatchObject({ name: 'Penicillin', kind: 'Medication' });
    expect(fields.notes?.map((item) => item.id)).toEqual(['n1', 'n2']);
  });

  it('maps the header fields: new tag, payers with PA, weekly units, primary address', () => {
    expect(toPatientFields(chart)).toEqual({
      isNew: true,
      payers: ['NJ Medicaid · PA 26050093', 'Private pay'],
      units: { usedThisWeek: 3, authorizedPerWeek: 6, remainingInclMakeup: 5 },
      address: '12 Main St',
      phone: '(908) 555-0101',
      guardian: 'Reagan Dorsey',
    });
    expect(toPatientFields({ ...chart, units_this_week: null, address_list: [] })).toMatchObject({
      units: { usedThisWeek: 0, authorizedPerWeek: 0, remainingInclMakeup: 0 },
      address: '12 Main St, Somerville, NJ',
    });
  });

  it('shows the eligibility label from the API and hides it when there is no check', () => {
    expect(eligibilityPill(toChartFields(chart).eligibility!)).toMatchObject({
      label: 'Could not check',
      color: 'textSecondary',
    });
    expect(eligibilityPill({ payer: '', eligible: true })).toMatchObject({ label: 'Eligible' });
    expect(eligibilityPill({ payer: '', eligible: null })).toBeNull();
  });

  it('maps the per-tab lists', () => {
    expect(toDiagnosis(diagnosis)).toMatchObject({
      code: 'G40.909',
      description: 'Epilepsy',
      rank: 'secondary',
      status: 'monitoring',
      onset: '01/02/2010',
      version: 1,
    });
    expect(toAllergy(allergy)).toMatchObject({ name: 'Pollen', kind: 'Environmental' });
    expect(toDocument(document)).toMatchObject({
      title: 'isp.pdf',
      kind: 'ISP',
      status: 'received',
      statusLabel: 'Received',
      date: '11/06/2026',
      documentDate: '09/03/2026',
      section: 'Providers',
    });
    expect(noteTitle('First line\nsecond')).toBe('First line');
  });

  it('maps history, incidents and coverages', () => {
    expect(
      toHistoryEntry({
        id: 'h1',
        kind: 'family',
        name: 'Hypertension',
        date: null,
        facility: '',
        status: '',
        relative: 'Father',
        onset_age: 50,
        detail: '',
        note: '',
      })
    ).toMatchObject({ category: 'family', relative: 'Father', onsetAge: '50', status: undefined });

    const mapped = toIncident(incident);
    expect(mapped).toMatchObject({
      code: 'INC-1003',
      status: 'closed',
      reportedBy: 'Priya Chandran',
    });
    expect(new Date(mapped.occurredAt).getHours()).toBe(15);

    expect(toInsurancePlan(coverage({}))).toMatchObject({
      coverage: 'primary',
      effectiveStart: '07/01/2026',
      effectiveEnd: undefined,
      cardFront: 'https://files/front',
    });
  });
});

describe('PatientsReducer per-resource loading', () => {
  const withPatient = () =>
    PatientsReducer(undefined, fetchPatientAction.fulfilled({ data: apiPatient }, 'r0', 'p1'));

  it('marks loaded resources stale on reopen and after a visit change', () => {
    const page = { count: 0, page: 1, page_size: 100, total_pages: 1, next: null, previous: null };
    let state = PatientsReducer(withPatient(), fetchDiagnosesAction.pending('r1', arg));
    state = PatientsReducer(state, refreshPatient('p1'));
    expect(state.resources.p1.diagnoses?.stale).toBe(false);

    state = PatientsReducer(
      state,
      fetchDiagnosesAction.fulfilled({ data: { ...page, results: [] } }, 'r1', arg)
    );
    state = PatientsReducer(state, refreshPatient('p1'));
    expect(state.resources.p1.diagnoses?.stale).toBe(true);

    state = PatientsReducer(state, fetchDiagnosesAction.pending('r2', arg));
    expect(state.resources.p1.diagnoses).toMatchObject({ loading: true, stale: false });

    state = {
      ...state,
      resources: { p1: { appointments: { loading: false, loaded: true, error: null } } },
    };
    state = PatientsReducer(
      state,
      createAppointmentsAction.fulfilled(
        { data: [{ id: 'v1', patient: { id: 'p1' } }] } as never,
        'r3',
        {} as never
      )
    );
    expect(state.resources.p1.appointments?.stale).toBe(true);
  });

  it('shows a timestamp on the local calendar day', () => {
    const iso = new Date(2026, 10, 19, 20, 30).toISOString();
    expect(toNumericDate(iso)).toBe('11/19/2026');
    expect(toNumericDate('2026-11-19')).toBe('11/19/2026');
  });

  it('tracks loading, success and failure per resource', () => {
    let state = PatientsReducer(withPatient(), fetchDiagnosesAction.pending('r1', arg));
    expect(state.resources.p1.diagnoses).toMatchObject({
      loading: true,
      loaded: false,
      error: null,
    });

    state = PatientsReducer(state, fetchDiagnosesAction.fulfilled(failed, 'r1', arg));
    expect(state.resources.p1.diagnoses).toMatchObject({
      loading: false,
      loaded: false,
      error: 'Network error',
    });

    const page = { count: 1, page: 1, page_size: 100, total_pages: 1, next: null, previous: null };
    state = PatientsReducer(
      state,
      fetchDiagnosesAction.fulfilled({ data: { ...page, results: [diagnosis] } }, 'r2', arg)
    );
    expect(state.resources.p1.diagnoses).toMatchObject({
      loading: false,
      loaded: true,
      error: null,
    });
    expect(state.charts.p1.diagnoses.map((item) => item.id)).toEqual(['d2']);

    state = PatientsReducer(state, fetchPatientChartAction.fulfilled({ data: chart }, 'r3', arg));
    expect(state.charts.p1.diagnoses.map((item) => item.id)).toEqual(['d2']);
    expect(state.charts.p1.allergies.map((item) => item.id)).toEqual(['a1']);
  });

  it('fills the header and services from the chart, with the team from the patient', () => {
    const state = PatientsReducer(
      withPatient(),
      fetchPatientChartAction.fulfilled({ data: chart }, 'r1', arg)
    );
    expect(state.byId.p1).toMatchObject({
      isNew: true,
      payers: ['NJ Medicaid · PA 26050093', 'Private pay'],
      units: { usedThisWeek: 3, authorizedPerWeek: 6, remainingInclMakeup: 5 },
      address: '12 Main St',
    });
    expect(state.charts.p1.services[0]).toMatchObject({
      statusLabel: 'Seeking coverage',
      team: ['Kim Lee'],
    });
    expect(state.resources.p1.chart?.loaded).toBe(true);
  });

  it('keeps the header fields when the list reloads or the patient arrives after the chart', () => {
    let state = PatientsReducer(
      undefined,
      fetchPatientChartAction.fulfilled({ data: chart }, 'r1', arg)
    );
    state = PatientsReducer(state, fetchPatientAction.fulfilled({ data: apiPatient }, 'r2', 'p1'));
    expect(state.byId.p1).toMatchObject({ isNew: true, address: '12 Main St' });
    state = PatientsReducer(state, fetchPatientAction.fulfilled({ data: apiPatient }, 'r3', 'p1'));
    expect(state.byId.p1.payers).toHaveLength(2);
  });

  it('keeps the chart error for the tab to show', () => {
    const state = PatientsReducer(
      withPatient(),
      fetchPatientChartAction.fulfilled(failed, 'r1', arg)
    );
    expect(state.resources.p1.chart?.error).toBe('Network error');
  });

  it('loads one history kind without touching the others', () => {
    const entry = (id: string, kind: string) => ({
      id,
      kind,
      name: id,
      date: null,
      facility: '',
      status: '',
      relative: '',
      onset_age: null,
      detail: '',
      note: '',
    });
    let state = PatientsReducer(
      withPatient(),
      fetchHistoryAction.fulfilled({ data: [entry('m1', 'medical')] }, 'r1', {
        patientId: 'p1',
        kind: 'medical',
      })
    );
    state = PatientsReducer(
      state,
      fetchHistoryAction.fulfilled({ data: [entry('s1', 'surgical')] }, 'r2', {
        patientId: 'p1',
        kind: 'surgical',
      })
    );
    expect(state.charts.p1.history.map((item) => item.id)).toEqual(['m1', 's1']);
    expect(state.resources.p1['history:medical']?.loaded).toBe(true);
    expect(state.resources.p1['history:surgical']?.loaded).toBe(true);
  });

  it('adds saved records from the POST response', () => {
    let state = PatientsReducer(
      withPatient(),
      createAllergyAction.fulfilled({ data: allergy }, 'r1', {
        patientId: 'p1',
        body: { substance: 'Pollen' },
      })
    );
    state = PatientsReducer(
      state,
      createNoteAction.fulfilled({ data: { ...note('n9', false), version: 1 } }, 'r2', {
        patientId: 'p1',
        body: { title: 'x', note_date: '2026-11-19', text: 'x', is_critical: false },
      })
    );
    state = PatientsReducer(
      state,
      uploadDocumentAction.fulfilled({ data: document }, 'r3', {
        patientId: 'p1',
        upload: {
          section: 'providers',
          category: 'isp',
          file: { uri: 'file:///isp.pdf', name: 'isp.pdf', type: 'application/pdf' },
        },
      })
    );
    state = PatientsReducer(
      state,
      createAllergyAction.fulfilled(failed, 'r4', { patientId: 'p1', body: { substance: 'x' } })
    );
    expect(state.charts.p1.allergies.map((item) => item.id)).toEqual(['a2']);
    expect(state.charts.p1.notes[0].id).toBe('n9');
    expect(state.charts.p1.documents[0].id).toBe('doc1');
  });
});

describe('incidents API', () => {
  const loaded = () =>
    PatientsReducer(
      undefined,
      fetchIncidentsAction.fulfilled(
        { data: [{ ...incident, status: 'open', version: 1 }] },
        'r1',
        arg
      )
    );

  it('builds the POST body in local date and time', () => {
    const body = toIncidentRequest(new Date(2026, 10, 19, 9, 5), {
      type: 'fall',
      what_happened: 'Slipped',
    });
    expect(body).toEqual({
      occurred_on: '2026-11-19',
      occurred_time: '09:05:00',
      type: 'fall',
      what_happened: 'Slipped',
    });
  });

  it('maps acknowledged and unknown statuses', () => {
    expect(toIncident({ ...incident, status: 'acknowledged' }).status).toBe('acknowledged');
    expect(toIncident({ ...incident, status: 'reported' }).status).toBe('open');
  });

  it('adds a reported incident to the top of the list', () => {
    const created = { ...incident, id: 'i2', number: 1004, status: 'open', version: 1 };
    const state = PatientsReducer(
      loaded(),
      createIncidentAction.fulfilled({ data: created }, 'r2', {
        patientId: 'p1',
        body: toIncidentRequest(new Date(), { type: 'fall', what_happened: 'x' }),
      })
    );
    expect(state.charts.p1.incidents.map((item) => item.id)).toEqual(['i2', 'i1']);
  });

  it('replaces the incident after a comment or close', () => {
    const updated = { ...incident, status: 'closed', comment: 'Reported to DDD', version: 2 };
    const state = PatientsReducer(
      loaded(),
      updateIncidentAction.fulfilled({ data: updated }, 'r3', {
        patientId: 'p1',
        incidentId: 'i1',
        body: { version: 1, status: 'closed' },
      })
    );
    expect(state.charts.p1.incidents[0]).toMatchObject({
      status: 'closed',
      comment: 'Reported to DDD',
      version: 2,
    });
  });
});
