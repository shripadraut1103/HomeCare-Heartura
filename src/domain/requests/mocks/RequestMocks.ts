import type { PatientRequest } from '@/domain/requests/interfaces/RequestInterfaces';

/**
 * TEMPORARY: patient requests until the API exists.
 * Delete this file once the requests slice is filled from the service.
 */

export const MOCK_PATIENT_REQUESTS: PatientRequest[] = [
  {
    id: 'r1',
    status: 'waiting',
    patientName: 'Leah Morales',
    age: 45,
    disciplines: ['PT'],
    city: 'Edison',
    offer: { discipline: 'PT', visitsPerWeek: 2, durationMinutes: 60 },
    address: '9 Oak Tree Rd, Edison, NJ 08820',
    distanceMiles: 18,
    authorization: 'Authorization pending',
    coordinator: { name: 'Dana Kim', organization: 'Easterseals NJ' },
    assignedBy: { name: 'Denise Ortiz', role: 'Intake', at: '2026-10-12T14:15:00' },
    note: 'Family prefers mornings. Group home staff present during visits.',
  },
  {
    id: 'r2',
    status: 'waiting',
    patientName: 'Darnell Coleman',
    age: 27,
    disciplines: ['OT', 'PT'],
    city: 'Hackensack',
    offer: { discipline: 'PT', visitsPerWeek: 2, durationMinutes: 45 },
    address: '41 Main St, Hackensack, NJ 07601',
    distanceMiles: 11,
    authorization: 'Authorization pending',
    coordinator: { name: 'Tara Whitman', organization: 'Arc of Bergen & Passaic' },
    assignedBy: { name: 'Denise Ortiz', role: 'Intake', at: '2026-10-11T10:40:00' },
  },
  {
    id: 'r3',
    status: 'waiting',
    patientName: 'Wendy Alvarez',
    age: 32,
    disciplines: ['PT'],
    city: 'Bridgewater',
    offer: { discipline: 'PT', visitsPerWeek: 1, durationMinutes: 60 },
    address: '220 Commons Way, Bridgewater, NJ 08807',
    distanceMiles: 24,
    authorization: 'Authorized through 01/31/2027',
    coordinator: { name: 'Dana Kim', organization: 'Easterseals NJ' },
    assignedBy: { name: 'Marcus Lee', role: 'Scheduling', at: '2026-10-10T09:05:00' },
  },
];
