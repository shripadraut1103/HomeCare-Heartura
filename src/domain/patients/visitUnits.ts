import type { Patient } from '@/domain/patients/interfaces/PatientInterfaces';

export const UNIT_MINUTES = 15;
export const VISIT_DURATIONS = [30, 45, 60, 75, 90] as const;

const AUTHORIZATION = /PA \d+/;

export const unitsForMinutes = (minutes: number) => Math.floor(minutes / UNIT_MINUTES);

export function authorizationFor(payer: string) {
  return AUTHORIZATION.exec(payer)?.[0];
}

export function payerLabel(payer: string) {
  const name = payer.split(' · ')[0];
  return authorizationFor(payer) ? `${name} · authorization` : name;
}

export function unitCheck(minutes: number, units: Patient['units']) {
  const needed = unitsForMinutes(minutes);
  const regular = Math.max(0, units.authorizedPerWeek - units.usedThisWeek);
  const available = Math.max(0, units.remainingInclMakeup);
  return {
    needed,
    available,
    makeup: Math.max(0, available - regular),
    fits: needed <= available,
  };
}
