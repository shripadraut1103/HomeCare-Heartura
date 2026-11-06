import type { Patient } from '@/domain/patients/interfaces/PatientInterfaces';

// TEMPORARY: the provider's caseload until the patients API exists.

let nextCode = 10400;

const patient = (
  seed: Pick<Patient, 'id' | 'name' | 'dateOfBirth'> & Partial<Patient>
): Patient => ({
  tag: 'HR',
  code: `HCT-${nextCode++}`,
  status: 'active',
  discipline: 'PT',
  serviceLocation: 'private-home',
  payers: ['NJ Medicaid · PA 26050093'],
  address: '512 Prospect Ave, Hackensack, NJ 07601',
  phone: '(201) 555-0311',
  units: { usedThisWeek: 3, authorizedPerWeek: 6, remainingInclMakeup: 6 },
  ...seed,
});

export const MOCK_PATIENTS: Patient[] = [
  patient({
    id: 'p-aaliyah-kaplan',
    name: 'Aaliyah Kaplan',
    code: 'HCT-10427',
    medicaidId: '0012847391',
    dateOfBirth: '1974-09-01',
    serviceLocation: 'community',
    payers: ['NJ Medicaid · PA 26050093', 'Private pay'],
    address: '500 Amwell Rd, Hillsborough, NJ 08844',
    phone: '(908) 262-2132',
  }),
  patient({
    id: 'p-andre-nguyen',
    name: 'Andre Nguyen',
    dateOfBirth: '1981-04-26',
    discipline: 'PT · DSP',
  }),
  patient({
    id: 'p-andre-washington',
    name: 'Andre Washington',
    dateOfBirth: '1967-02-04',
    serviceLocation: 'group-home',
  }),
  patient({
    id: 'p-brian-deluca',
    name: 'Brian DeLuca',
    status: 'suspended',
    dateOfBirth: '1975-10-20',
    discipline: 'PT · DSP',
  }),
  patient({
    id: 'p-brian-fischer',
    name: 'Brian Fischer',
    status: 'suspended',
    dateOfBirth: '1989-12-14',
    discipline: 'OT · PT · Speech',
    serviceLocation: 'virtual',
  }),
  patient({
    id: 'p-priya-shah',
    name: 'Priya Shah',
    dateOfBirth: '1999-02-09',
    isNew: true,
    address: '47 Main St, Hackensack, NJ 07601',
    guardian: 'Anita Shah (mother)',
    units: { usedThisWeek: 0, authorizedPerWeek: 6, remainingInclMakeup: 6 },
  }),
  patient({
    id: 'p-omar-haddad',
    name: 'Omar Haddad',
    dateOfBirth: '1983-06-30',
    isNew: true,
    serviceLocation: 'group-home',
    units: { usedThisWeek: 0, authorizedPerWeek: 4, remainingInclMakeup: 4 },
  }),
  patient({
    id: 'p-aisha-vance',
    name: 'Aisha Vance',
    dateOfBirth: '1994-04-12',
    payers: ['NJ Medicaid · PA 26041988'],
    units: { usedThisWeek: 8, authorizedPerWeek: 8, remainingInclMakeup: 2 },
  }),
  patient({
    id: 'p-luca-bertrand',
    name: 'Luca Bertrand',
    dateOfBirth: '1988-09-30',
    serviceLocation: 'group-home',
  }),
  patient({
    id: 'p-theo-lindgren',
    name: 'Theo Lindgren',
    dateOfBirth: '2001-02-18',
    payers: ['Private pay'],
  }),
  patient({
    id: 'p-gina-mancuso',
    status: 'inactive',
    name: 'Gina Mancuso',
    dateOfBirth: '1979-11-02',
    payers: ['Private pay'],
  }),
  patient({
    id: 'p-eli-nakamura',
    name: 'Eli Nakamura',
    dateOfBirth: '1991-07-21',
    payers: ['Private pay'],
  }),
  patient({
    id: 'p-maya-okafor',
    status: 'prospect',
    name: 'Maya Okafor',
    dateOfBirth: '2012-03-15',
    payers: ['Private pay'],
  }),
  patient({
    id: 'p-marcus-lee',
    status: 'deniedServices',
    name: 'Marcus Lee',
    dateOfBirth: '1985-12-08',
    discipline: 'DSP',
    serviceLocation: 'community',
  }),
  patient({
    id: 'p-noah-brennan',
    name: 'Noah Brennan',
    dateOfBirth: '1996-05-27',
    serviceLocation: 'community',
  }),
  patient({
    id: 'p-sofia-delgado',
    name: 'Sofia Delgado',
    dateOfBirth: '1972-10-04',
    payers: ['Private pay'],
  }),
  patient({
    id: 'p-grace-whitfield',
    status: 'discharged',
    name: 'Grace Whitfield',
    dateOfBirth: '1968-01-19',
    payers: ['Private pay'],
  }),
  patient({
    id: 'p-hannah-kowalski',
    name: 'Hannah Kowalski',
    dateOfBirth: '1990-08-11',
    address: '88 Maple St, Teaneck, NJ 07666',
    phone: '(201) 555-0178',
  }),
];
