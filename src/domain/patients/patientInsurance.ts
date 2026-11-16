import type { CoverageLevel, InsurancePlan } from '@/domain/patients/interfaces/PatientInterfaces';

export const COVERAGE_LABELS: Record<CoverageLevel, string> = {
  primary: 'Primary',
  secondary: 'Secondary',
  tertiary: 'Tertiary',
};

export const COVERAGE_LEVELS = Object.keys(COVERAGE_LABELS) as CoverageLevel[];

export const PAYERS: readonly { name: string; planType?: string }[] = [
  { name: 'NJ Medicaid', planType: 'State plan (FFS)' },
  { name: 'Horizon NJ Health', planType: 'Managed care (MCO)' },
  { name: 'Aetna Better Health of NJ', planType: 'Managed care (MCO)' },
  { name: 'UnitedHealthcare Community Plan', planType: 'Managed care (MCO)' },
  { name: 'WellCare Health Plans', planType: 'Managed care (MCO)' },
  { name: 'Private pay', planType: 'Self-pay' },
  { name: 'Other' },
];

export const SELF_SUFFIX = ' (self)';

export const relationshipFor = (subscriber: string) =>
  subscriber.trim().endsWith(SELF_SUFFIX.trim()) ? 'Self' : subscriber.trim();

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
