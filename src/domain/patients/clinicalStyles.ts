import type {
  ApiIncidentLocation,
  ApiIncidentType,
  ApiInjurySide,
} from '@/domain/patients/interfaces/PatientApi';
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

export const ALLERGY_KINDS: readonly { value: 'medication' | 'environmental'; label: string }[] = [
  { value: 'medication', label: 'Medication' },
  { value: 'environmental', label: 'Environmental' },
];

export const NEW_DIAGNOSIS_STATUSES: readonly { value: 'active' | 'monitoring'; label: string }[] =
  [
    { value: 'active', label: 'Active' },
    { value: 'monitoring', label: 'Monitoring' },
  ];

export const optionsOf = <T extends string>(labels: Record<T, string | ClinicalPill>) =>
  (Object.keys(labels) as T[]).map((value) => {
    const label = labels[value];
    return { value, label: typeof label === 'string' ? label : label.label };
  });

export const INCIDENT_STATUS: Record<IncidentStatus, ClinicalPill> = {
  open: { label: 'Open', color: 'toneAmberFg', background: 'toneAmberBg' },
  acknowledged: { label: 'Acknowledged', color: 'toneBlueFg', background: 'toneBlueBg' },
  closed: { label: 'Closed', color: 'textSecondary', background: 'backgroundElement' },
};

export const INCIDENT_TYPES: readonly { value: ApiIncidentType; label: string }[] = [
  { value: 'fall', label: 'Fall' },
  { value: 'injury', label: 'Injury' },
  { value: 'behavioral', label: 'Behavioral' },
  { value: 'medication-error', label: 'Medication error' },
  { value: 'elopement', label: 'Elopement' },
  { value: 'other', label: 'Other' },
];

export const INCIDENT_LOCATIONS: readonly { value: ApiIncidentLocation; label: string }[] = [
  { value: 'group-home', label: 'Group home' },
  { value: 'day-program', label: 'Day program' },
  { value: 'community', label: 'Community' },
  { value: 'vehicle', label: 'Vehicle' },
  { value: '', label: 'Not specified' },
];

export const INJURY_SIDES: readonly { value: ApiInjurySide; label: string }[] = [
  { value: 'none', label: 'No injury' },
  { value: 'left', label: 'Left side' },
  { value: 'right', label: 'Right side' },
  { value: 'both', label: 'Both sides' },
];
