import {
  authorizationFor,
  payerLabel,
  unitCheck,
  unitsForMinutes,
} from '@/domain/patients/visitUnits';

describe('visitUnits', () => {
  it('needs one unit per 15 minutes', () => {
    expect(unitsForMinutes(45)).toBe(3);
    expect(unitsForMinutes(50)).toBe(3);
  });

  it('labels a payer by its authorization', () => {
    expect(authorizationFor('NJ Medicaid · PA 26041988')).toBe('PA 26041988');
    expect(payerLabel('NJ Medicaid · PA 26041988')).toBe('NJ Medicaid · authorization');
    expect(payerLabel('Private pay')).toBe('Private pay');
  });

  it('blocks a visit that needs more units than are left, counting makeup units', () => {
    const units = { usedThisWeek: 8, authorizedPerWeek: 8, remainingInclMakeup: 2 };
    expect(unitCheck(45, units)).toEqual({ needed: 3, available: 2, makeup: 2, fits: false });
    expect(unitCheck(30, units).fits).toBe(true);
  });
});
