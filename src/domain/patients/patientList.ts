import type { ThemeColor } from '@/constants/Theme';
import type {
  Patient,
  PatientSort,
  PatientStatus,
} from '@/domain/patients/interfaces/PatientInterfaces';
import { SERVICE_LOCATIONS } from '@/domain/schedule/appointmentOptions';
import { formatNumericDate, parseIsoDate } from '@/utils/dateFormat';

export type StatusFilter = PatientStatus | 'all';

type StatusStyle = {
  label: string;
  filterLabel: string;
  color: ThemeColor;
  background: ThemeColor;
};

export const PATIENT_STATUS: Record<PatientStatus, StatusStyle> = {
  active: { label: 'Active', filterLabel: 'Active', color: 'success', background: 'successMuted' },
  suspended: {
    label: 'Suspended',
    filterLabel: 'Suspended',
    color: 'toneRedFg',
    background: 'toneRedBg',
  },
  inactive: {
    label: 'Inactive',
    filterLabel: 'Inactive',
    color: 'textSecondary',
    background: 'backgroundElement',
  },
  prospect: {
    label: 'Prospect',
    filterLabel: 'Prospects',
    color: 'toneBlueFg',
    background: 'toneBlueBg',
  },
  deniedServices: {
    label: 'Denied services',
    filterLabel: 'Denied Services',
    color: 'toneAmberFg',
    background: 'toneAmberBg',
  },
  discharged: {
    label: 'Discharged',
    filterLabel: 'Discharged',
    color: 'tonePurpleFg',
    background: 'tonePurpleBg',
  },
};

export const STATUS_ORDER: readonly PatientStatus[] = [
  'active',
  'suspended',
  'inactive',
  'prospect',
  'deniedServices',
  'discharged',
];

const AVATAR_TONES: readonly { color: ThemeColor; background: ThemeColor }[] = [
  { color: 'toneAmberFg', background: 'toneAmberBg' },
  { color: 'success', background: 'successMuted' },
  { color: 'tonePurpleFg', background: 'tonePurpleBg' },
  { color: 'toneBlueFg', background: 'toneBlueBg' },
  { color: 'accent', background: 'toneTealBg' },
];

export function avatarTone(name: string) {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) % 997;
  return AVATAR_TONES[hash % AVATAR_TONES.length];
}

export function ageFrom(dateOfBirth: string, now = new Date()) {
  const born = parseIsoDate(dateOfBirth);
  let age = now.getFullYear() - born.getFullYear();
  const birthday = new Date(now.getFullYear(), born.getMonth(), born.getDate());
  if (now < birthday) age -= 1;
  return age;
}

export const patientDob = (patient: Patient) =>
  formatNumericDate(parseIsoDate(patient.dateOfBirth));

export const patientSummary = (patient: Patient, now = new Date()) =>
  `${ageFrom(patient.dateOfBirth, now)} yrs • DOB ${patientDob(patient)} • ${patient.discipline}`;

export function locationLabel(serviceLocation: string) {
  const option = SERVICE_LOCATIONS.find((location) => location.value === serviceLocation);
  return option ? option.label.split(' · ').slice(0, 2).join(' · ') : serviceLocation;
}

export function matchesQuery(patient: Patient, query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return [patient.name, patient.code, patient.medicaidId ?? ''].some((value) =>
    value.toLowerCase().includes(needle)
  );
}

export function countByStatus(patients: readonly Patient[]): Record<StatusFilter, number> {
  const counts = { all: patients.length } as Record<StatusFilter, number>;
  for (const status of STATUS_ORDER) counts[status] = 0;
  for (const patient of patients) counts[patient.status] += 1;
  return counts;
}

export function visiblePatients(
  patients: readonly Patient[],
  status: StatusFilter,
  query: string,
  sort: PatientSort
) {
  return patients
    .filter(
      (patient) => (status === 'all' || patient.status === status) && matchesQuery(patient, query)
    )
    .sort((a, b) =>
      sort === 'name'
        ? a.name.localeCompare(b.name)
        : ageFrom(a.dateOfBirth) - ageFrom(b.dateOfBirth) || a.name.localeCompare(b.name)
    );
}
