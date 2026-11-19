import type { ApiPatient } from '@/domain/patients/interfaces/PatientApi';
import type {
  Patient,
  PatientChart,
  PatientService,
  PatientStatus,
} from '@/domain/patients/interfaces/PatientInterfaces';
import type { StatusFilter } from '@/domain/patients/patientList';

const STATUSES: Record<string, PatientStatus> = {
  active: 'active',
  suspended: 'suspended',
  inactive: 'inactive',
  prospect: 'prospect',
  request: 'request',
  denied: 'denied',
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
    tag: api.mrn,
    code: api.mrn,
    status: STATUSES[api.status] ?? 'inactive',
    statusLabel: STATUSES[api.status] ? undefined : api.status_label || api.status,
    medicaidId: api.medicaid_id || undefined,
    dateOfBirth: api.dob,
    discipline:
      api.services.map((service) => DISCIPLINES[service]?.short ?? service).join(' · ') ||
      api.services_label,
    serviceLocation: SETTINGS[api.location?.setting ?? ''] ?? api.location?.setting ?? '',
    locationLabel: api.service_location?.label || undefined,
    payers: [],
    address: '',
    phone: '',
    units: { usedThisWeek: 0, authorizedPerWeek: 0, remainingInclMakeup: 0 },
  };
}

export const emptyChart = (patientId: string): PatientChart => ({
  patientId,
  sex: '',
  language: '',
  dddId: '',
  guardian: '',
  phones: [],
  allergies: [],
  insurance: { primary: '' },
  insurancePlans: [],
  eligibility: { payer: '', eligible: null },
  diagnoses: [],
  services: [],
  notes: [],
  documents: [],
  history: [],
  incidents: [],
  records: [],
});

export const serviceName = (code: string) => DISCIPLINES[code]?.name ?? code;

export const withTeams = (
  services: readonly PatientService[],
  providers: readonly { name: string; discipline: string }[] = []
): PatientService[] =>
  services.map((service) => ({
    ...service,
    team: providers
      .filter((provider) => provider.discipline === service.code)
      .map((provider) => provider.name),
  }));

export function toChart(api: ApiPatient, existing?: PatientChart): PatientChart {
  const services: readonly PatientService[] = existing?.services.length
    ? existing.services
    : api.services.map((code) => ({
        id: `${api.id}-${code}`,
        code,
        name: serviceName(code),
        start: '',
        end: '',
        status: 'active',
        payer: '',
        team: [],
      }));
  return {
    ...emptyChart(api.id),
    ...existing,
    dddId: api.ddd_id,
    providers: api.providers,
    services: withTeams(services, api.providers),
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
