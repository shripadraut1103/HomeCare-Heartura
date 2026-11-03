import type { IndividualServicePlan } from '@/domain/patients/interfaces/PatientInterfaces';

/**
 * TEMPORARY: ISPs until the API exists.
 * Delete this file once `useIsp` reads from the service.
 */
export const MOCK_ISPS: IndividualServicePlan[] = [
  {
    patientId: 'p-theo-lindgren',
    signedOn: '06/18/2026',
    sections: [
      {
        title: 'Plan',
        lines: [
          'Plan year 07/01/2026 – 06/30/2027 · signed 06/18/2026',
          'Support coordinator: Vanessa Rosado · Caring for Families',
        ],
      },
      {
        title: 'Diagnoses',
        lines: [
          'Primary: Q90.9 · Down syndrome, unspecified',
          'Secondary: R27.8 · Other lack of coordination',
        ],
      },
      {
        title: 'Outcomes',
        lines: [
          '1. Theo will move safely around the home and the day program with the least help possible.',
          '2. Theo will take part in one community activity each week of their choice.',
          '3. Theo will keep a daily routine for meals, hygiene and rest with visual supports.',
        ],
      },
      {
        title: 'Services and frequency',
        lines: [
          'Physical therapy: 8 units a week (120 min) · PA 26088410 · 09/01/2026 – 08/31/2027',
        ],
      },
      {
        title: 'Risks and supports',
        lines: ['Falls on stairs and uneven ground', 'Needs supervision in the community'],
      },
      {
        title: 'What matters to Theo',
        lines: ['New patient. Use the side entrance, ramp access'],
      },
      {
        title: 'Contacts',
        lines: [
          'Guardian / contact: Karin Lindgren (mother) · (201) 555-0233',
          'Home: 221 Linwood Ave, Ridgewood, NJ 07450',
        ],
      },
    ],
  },
  {
    patientId: 'p-sofia-delgado',
    signedOn: '05/02/2026',
    sections: [
      {
        title: 'Plan',
        lines: [
          'Plan year 06/01/2026 – 05/31/2027 · signed 05/02/2026',
          'Support coordinator: Marcus Bell · Bergen Supports',
        ],
      },
      {
        title: 'Diagnoses',
        lines: [
          'Primary: M54.50 · Low back pain, unspecified',
          'Secondary: R26.89 · Other abnormalities of gait and mobility',
        ],
      },
      {
        title: 'Outcomes',
        lines: [
          '1. Sofia will walk to the corner store and back without stopping.',
          '2. Sofia will manage her home exercise program on her own.',
        ],
      },
      {
        title: 'Services and frequency',
        lines: [
          'Physical therapy: 6 units a week (90 min) · PA 26071122 · 08/28/2026 – 08/27/2027',
        ],
      },
      {
        title: 'Risks and supports',
        lines: ['Pain flares after long sitting', 'Avoid lifting over 10 lb'],
      },
      {
        title: 'What matters to Sofia',
        lines: ['Prefers morning visits before work'],
      },
      {
        title: 'Contacts',
        lines: [
          'Contact: Sofia Delgado (self) · (201) 555-0419',
          'Home: 14 Elm St, Hackensack, NJ 07601',
        ],
      },
    ],
  },
];
