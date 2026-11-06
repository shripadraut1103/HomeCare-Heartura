import type { IndividualServicePlan } from '@/domain/patients/interfaces/PatientInterfaces';

/**
 * TEMPORARY: ISPs until the API exists.
 * Delete this file once `useIsp` reads from the service.
 */
export const MOCK_ISPS: IndividualServicePlan[] = [
  {
    patientId: 'p-aaliyah-kaplan',
    planStart: '07/01/2026',
    planEnd: '06/30/2027',
    signedOn: '06/18/2026',
    services: 'PT',
    fileName: 'ISP_Aaliyah_Kaplan_2026-27.pdf',
    outcomes: [
      'Aaliyah will move safely around the home and the day program with the least help possible.',
      'Aaliyah will take part in one community activity each week of their choice.',
      'Aaliyah will keep a daily routine for meals, hygiene and rest with visual supports.',
    ],
    risks: ['Falls on stairs and uneven ground', 'Needs supervision in the community'],
    older: [
      { label: 'ISP 2025–26', signedOn: '06/20/2025' },
      { label: 'ISP 2024–25', signedOn: '06/14/2024' },
    ],
  },
  {
    patientId: 'p-theo-lindgren',
    planStart: '07/01/2026',
    planEnd: '06/30/2027',
    signedOn: '06/18/2026',
    services: 'PT',
    fileName: 'ISP_Theo_Lindgren_2026-27.pdf',
    outcomes: [
      'Theo will move safely around the home and the day program with the least help possible.',
      'Theo will take part in one community activity each week of their choice.',
      'Theo will keep a daily routine for meals, hygiene and rest with visual supports.',
    ],
    risks: ['Falls on stairs and uneven ground', 'Needs supervision in the community'],
    older: [],
  },
  {
    patientId: 'p-sofia-delgado',
    planStart: '06/01/2026',
    planEnd: '05/31/2027',
    signedOn: '05/02/2026',
    services: 'PT',
    fileName: 'ISP_Sofia_Delgado_2026-27.pdf',
    outcomes: [
      'Sofia will walk to the corner store and back without stopping.',
      'Sofia will manage her home exercise program on her own.',
    ],
    risks: ['Pain flares after long sitting', 'Avoid lifting over 10 lb'],
    older: [{ label: 'ISP 2025–26', signedOn: '05/10/2025' }],
  },
  {
    patientId: 'p-aisha-vance',
    planStart: '09/01/2026',
    planEnd: '08/31/2027',
    signedOn: '08/22/2026',
    services: 'PT',
    fileName: 'ISP_Aisha_Vance_2026-27.pdf',
    outcomes: [
      'Aisha will walk around her neighborhood with standby help.',
      'Aisha will brush her teeth with verbal cues only.',
    ],
    risks: ['Falls when tired', 'Needs reminders to use the handrail'],
    older: [],
  },
];
