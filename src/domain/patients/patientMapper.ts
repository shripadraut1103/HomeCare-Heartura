import type { ApiPatient } from '@/domain/patients/interfaces/PatientApi';
import type {
  Patient,
  PatientChart,
  PatientService,
  PatientStatus,
} from '@/domain/patients/interfaces/PatientInterfaces';
import type { StatusFilter } from '@/domain/patients/patientList';

// TODO: confirm both lists once the backend shares its status and setting values.
const STATUSES: Record<string, PatientStatus> = {
  active: 'active',
  suspended: 'suspended',
  inactive: 'inactive',
  prospect: 'prospect',
  denied_services: 'deniedServices',
  discharged: 'discharged',
};

const SETTINGS: Record<string, string> = {
  private_home: 'private-home',
  group_home: 'group-home',
  community: 'community',
  virtual: 'virtual',
};

const DISCIPLINES: Record<string, { short: string; name: string }> = {
  ot: { short: 'OT', name: 'Occupational therapy' },
  pt: { short: 'PT', name: 'Physical therapy' },
  speech: { short: 'Speech', name: 'Speech therapy' },
  dsp: { short: 'DSP', name: 'Direct support' },
};

const API_STATUS = Object.fromEntries(
  Object.entries(STATUSES).map(([api, status]) => [status, api])
) as Record<PatientStatus, string>;

// TEMPORARY: matches the web, whose default "Active" view also lists suspended patients.
const ACTIVE_VIEW = 'active,suspended';

export const toApiStatus = (status: StatusFilter) =>
  status === 'all' ? undefined : status === 'active' ? ACTIVE_VIEW : API_STATUS[status];

export function toPatient(api: ApiPatient): Patient {
  return {
    id: api.id,
    name: `${api.first_name} ${api.last_name}`.trim(),
    tag: '',
    code: api.mrn,
    status: STATUSES[api.status] ?? 'inactive',
    medicaidId: api.medicaid_id || undefined,
    dateOfBirth: api.dob,
    discipline:
      api.services.map((service) => DISCIPLINES[service]?.short ?? service).join(' · ') ||
      api.services_label,
    serviceLocation: SETTINGS[api.location?.setting ?? ''] ?? api.location?.setting ?? '',
    // Not in GET /api/patients/: the screens show these as not recorded until the API adds them.
    payers: [],
    address: '',
    phone: '',
    units: { usedThisWeek: 0, authorizedPerWeek: 0, remainingInclMakeup: 0 },
  };
}

/** The chart fields GET /api/patients/{id}/ can fill; the rest wait for `/chart/` and sub-resources. */
export function toChart(api: ApiPatient, existing?: PatientChart): PatientChart {
  const services: PatientService[] = api.services.map((service) => ({
    id: `${api.id}-${service}`,
    name: DISCIPLINES[service]?.name ?? service,
    start: '',
    end: '',
    status: 'active',
    payer: '',
    team: api.providers
      .filter((provider) => provider.discipline === service)
      .map((provider) => provider.name),
  }));
  return {
    patientId: api.id,
    sex: '',
    language: '',
    guardian: '',
    phones: [],
    allergies: [],
    insurance: { primary: '' },
    insurancePlans: [],
    eligibility: { payer: '', eligible: false },
    diagnoses: [],
    notes: [],
    documents: [],
    history: [],
    incidents: [],
    records: [],
    ...existing,
    dddId: api.ddd_id,
    services,
    groupHome: api.group_home
      ? {
          agency: existing?.groupHome?.agency ?? '',
          name: api.group_home.name,
          address: existing?.groupHome?.address ?? '',
          phone: existing?.groupHome?.phone ?? '',
          manager: existing?.groupHome?.manager ?? '',
        }
      : undefined,
  };
}
