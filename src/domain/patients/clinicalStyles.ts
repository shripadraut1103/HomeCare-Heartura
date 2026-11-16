import type { ThemeColor } from '@/constants/Theme';
import type {
  AllergySeverity,
  AllergyStatus,
  DiagnosisStatus,
  DiagnosisType,
  IncidentStatus,
} from '@/domain/patients/interfaces/PatientInterfaces';

export type ClinicalPill = { label: string; color: ThemeColor; background: ThemeColor };

const ACTIVE: ClinicalPill = { label: 'Active', color: 'success', background: 'successMuted' };

export const DIAGNOSIS_STATUS: Record<DiagnosisStatus, ClinicalPill> = {
  active: ACTIVE,
  monitoring: { label: 'Monitoring', color: 'toneAmberFg', background: 'toneAmberBg' },
  resolved: { label: 'Resolved', color: 'textSecondary', background: 'backgroundElement' },
};

export const DIAGNOSIS_TYPE: Record<DiagnosisType, string> = {
  chronic: 'Chronic',
  acute: 'Acute',
};

export const SEVERITY: Record<AllergySeverity, ClinicalPill> = {
  mild: { label: 'Mild', color: 'textSecondary', background: 'backgroundElement' },
  moderate: { label: 'Moderate', color: 'toneAmberFg', background: 'toneAmberBg' },
  severe: { label: 'Severe', color: 'toneRedFg', background: 'toneRedBg' },
};

export const ALLERGY_STATUS: Record<AllergyStatus, ClinicalPill> = {
  active: ACTIVE,
  inactive: { label: 'Inactive', color: 'textSecondary', background: 'backgroundElement' },
};

export const ALLERGY_TYPES = ['Medication', 'Food', 'Environmental', 'Other'] as const;

export const optionsOf = <T extends string>(labels: Record<T, string | ClinicalPill>) =>
  (Object.keys(labels) as T[]).map((value) => {
    const label = labels[value];
    return { value, label: typeof label === 'string' ? label : label.label };
  });

export const INCIDENT_STATUS: Record<IncidentStatus, ClinicalPill> = {
  open: { label: 'Open', color: 'toneAmberFg', background: 'toneAmberBg' },
  closed: { label: 'Closed', color: 'textSecondary', background: 'backgroundElement' },
};

export const INCIDENT_TYPES = [
  'Fall',
  'Behavioral',
  'Injury',
  'Medication error',
  'Property damage',
  'Other',
] as const;

export const INCIDENT_LOCATIONS = [
  'Group home',
  'Day program',
  'Home',
  'Community',
  'Vehicle',
  'Other',
] as const;

export const INJURY_SIDES = ['No injury', 'Left side', 'Right side', 'Both sides', 'Head'] as const;
