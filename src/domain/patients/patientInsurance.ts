import type { ThemeColor } from '@/constants/Theme';
import type {
  CoverageLevel,
  InsurancePlan,
  PatientChart,
} from '@/domain/patients/interfaces/PatientInterfaces';

export const COVERAGE_LABELS: Record<CoverageLevel, string> = {
  primary: 'Primary',
  secondary: 'Secondary',
  tertiary: 'Tertiary',
};

export const COVERAGE_LEVELS = Object.keys(COVERAGE_LABELS) as CoverageLevel[];

export const INSURED_RELATIONSHIPS: readonly { value: string; label: string }[] = [
  { value: 'self', label: 'Self' },
  { value: 'parent', label: 'Parent' },
  { value: 'guardian', label: 'Guardian' },
  { value: 'spouse', label: 'Spouse' },
  { value: 'other', label: 'Other' },
];

type EligibilityStyle = { label: string; color: ThemeColor; background: ThemeColor };

const ELIGIBILITY: Record<string, EligibilityStyle> = {
  eligible: { label: 'Eligible', color: 'success', background: 'successMuted' },
  not_eligible: { label: 'Not eligible', color: 'toneRedFg', background: 'toneRedBg' },
  pending: { label: 'Pending', color: 'toneAmberFg', background: 'toneAmberBg' },
  error: { label: 'Could not check', color: 'textSecondary', background: 'backgroundElement' },
};

export function eligibilityPill(eligibility: PatientChart['eligibility']): EligibilityStyle | null {
  const status =
    eligibility.status ??
    (eligibility.eligible === null ? '' : eligibility.eligible ? 'eligible' : 'not_eligible');
  if (!status) return null;
  const style = ELIGIBILITY[status] ?? {
    label: status,
    color: 'textSecondary',
    background: 'backgroundElement',
  };
  return { ...style, label: eligibility.label || style.label };
}

export const nextCoverage = (plans: readonly InsurancePlan[]): CoverageLevel =>
  COVERAGE_LEVELS.find((level) => !plans.some((plan) => plan.coverage === level)) ?? 'secondary';

export const sortByCoverage = (plans: readonly InsurancePlan[]) =>
  [...plans].sort(
    (a, b) => COVERAGE_LEVELS.indexOf(a.coverage) - COVERAGE_LEVELS.indexOf(b.coverage)
  );

export function insuranceRows(plan: InsurancePlan) {
  return [
    ['Insurance name', plan.name],
    ['Member ID', plan.memberId],
    ['Relationship', plan.relationship],
    ['Plan name', plan.planName],
    ['Plan type', plan.planType],
    ['Group ID', plan.groupId],
    ['Effective start', plan.effectiveStart],
    ['Effective end', plan.effectiveEnd],
  ].filter((row): row is [string, string] => Boolean(row[1]));
}
