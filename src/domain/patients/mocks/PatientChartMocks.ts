import type {
  Patient,
  PatientChart,
  PatientService,
} from '@/domain/patients/interfaces/PatientInterfaces';
import { MOCK_PATIENTS } from '@/domain/patients/mocks/PatientMocks';

/**
 * TEMPORARY: patient charts until the API exists.
 * Delete this file once the patients slice loads charts from the service.
 */

const PRIVATE_PAY = 'Private pay';

const payerName = (payer: string) => payer.split(' · ')[0];

const DISCIPLINE_SERVICES: Record<string, string> = {
  PT: 'Physical therapy',
  OT: 'Occupational therapy',
  Speech: 'Speech therapy',
  DSP: 'Direct support',
};

const defaultServices = (patient: Patient): PatientService[] =>
  patient.discipline.split(' · ').map((discipline, index) => {
    const payer = payerName(patient.payers[0] ?? PRIVATE_PAY);
    return {
      id: `${patient.id}-s${index}`,
      name: DISCIPLINE_SERVICES[discipline] ?? discipline,
      start: '08/06/2026',
      end: '08/05/2027',
      status: payer === PRIVATE_PAY ? 'privatePay' : 'active',
      payer,
      units:
        payer === PRIVATE_PAY
          ? undefined
          : { used: 42, total: 312, accrued: 48, missed: 6, makeup: 6 },
      team: ['Helena Ruiz, DPT (Therapist)'],
    };
  });

const defaultChart = (patient: Patient): PatientChart => {
  const primary = patient.payers[0] ?? PRIVATE_PAY;
  return {
    patientId: patient.id,
    sex: 'Not recorded',
    language: 'English',
    dddId: patient.code.replace(/\D/g, '').padStart(6, '4'),
    eligibility: { payer: payerName(primary), eligible: payerName(primary) !== PRIVATE_PAY },
    guardian: patient.guardian ?? 'None · patient is their own guardian',
    phones: [patient.phone],
    allergies: [],
    insurance: { primary: payerName(primary) },
    diagnoses: [],
    services: defaultServices(patient),
    notes: [],
    documents: [],
    history: [],
    incidents: [],
  };
};

const DETAILS: Record<string, Partial<PatientChart>> = {
  'p-aaliyah-kaplan': {
    sex: 'Female',
    dddId: '472067',
    eligibility: { payer: 'NJ Medicaid', eligible: true },
    guardian: 'None · patient is her own guardian',
    groupHome: {
      agency: 'Alternatives Inc.',
      name: 'Amwell Rd',
      address: '500 Amwell Rd, Hillsborough, NJ 08844',
      phone: '(908) 262-2132',
      manager: 'Reagan Dorsey',
    },
    secondAddress: 'Day program · 600 First Ave, Raritan, NJ 08869',
    phones: ['(908) 262-2132', '(908) 642-6506'],
    email: 'reagand@alternativesinc.org',
    allergies: [
      { name: 'Penicillin', kind: 'Medication', reaction: 'Hives', severity: 'moderate' },
    ],
    insurance: {
      primary: 'NJ Medicaid · fee-for-service',
      secondary: 'Private pay · Aaliyah Kaplan (self)',
    },
    diagnoses: [{ code: 'F70', description: 'Mild intellectual disabilities', rank: 'primary' }],
    services: [
      {
        id: 'ak-ot',
        name: 'Occupational therapy',
        start: '08/06/2026',
        end: '08/05/2027',
        status: 'active',
        payer: 'NJ Medicaid',
        units: { used: 76, total: 418, accrued: 80, missed: 4, makeup: 4 },
        team: ['Marcus Webb, OT (Therapist)', 'Dana Ruiz, COTA (Assistant)'],
      },
      {
        id: 'ak-pt',
        name: 'Physical therapy',
        start: '08/06/2026',
        end: '08/05/2027',
        status: 'active',
        payer: 'NJ Medicaid',
        units: { used: 68, total: 418, accrued: 80, missed: 12, makeup: 8 },
        team: ['Priya Chandran, PT (Therapist)'],
      },
      {
        id: 'ak-pt-private',
        name: 'Physical therapy · private pay',
        start: '10/04/2026',
        end: '08/05/2027',
        status: 'privatePay',
        payer: 'Private pay',
        team: ['Priya Chandran, PT (Therapist)'],
      },
    ],
    notes: [
      {
        id: 'ak-n1',
        text: 'Upper-body dressing is now independent with the picture sequence taped inside her wardrobe door. Prompt by pointing to the next picture.',
        author: 'Marcus Webb, OT',
        date: '10/01/2026',
      },
      {
        id: 'ak-n2',
        text: 'PT private pay agreed with Aaliyah for one extra session a week from 10/04/2026; the agreement is out for her signature.',
        author: 'Priya Chandran, PT',
        date: '09/30/2026',
      },
      {
        id: 'ak-n3',
        text: 'OT visit of 09/29/2026 cancelled — at the hospital for a scheduled procedure. No units used, no charge.',
        author: 'John Doe',
        date: '09/29/2026',
      },
    ],
    documents: [
      {
        id: 'ak-d1',
        title: 'ISP 2026–27',
        kind: 'ISP',
        author: 'Vanessa Rosado, SC',
        status: 'current',
        date: '06/18/2026',
        documentDate: '06/18/2026',
        section: 'Shared with providers',
        fileName: 'ISP_Aaliyah_Kaplan_2026-27.pdf',
      },
      {
        id: 'ak-d2',
        title: 'Treatment plan — OT & PT 2026–27',
        kind: 'Treatment plan',
        author: 'Dr. Melissa Burke',
        status: 'signed',
        date: '08/10/2026',
        documentDate: '08/04/2026',
        section: 'Shared with providers',
        fileName: 'Treatment_plan_OT_PT_2026-27.pdf',
      },
      {
        id: 'ak-d3',
        title: 'Prescription — OT & PT',
        kind: 'Prescription',
        author: 'Dr. Melissa Burke',
        status: 'signed',
        date: '07/28/2026',
        documentDate: '07/28/2026',
        section: 'Shared with providers',
        fileName: 'Prescription_OT_PT.pdf',
      },
      {
        id: 'ak-d4',
        title: 'Home safety checklist',
        kind: 'Other',
        author: 'Marcus Webb, OT',
        status: 'onFile',
        date: '08/12/2026',
        documentDate: '08/12/2026',
        section: 'Agency only',
        fileName: 'Home_safety_checklist.pdf',
      },
      {
        id: 'ak-d5',
        title: 'ISP 2025–26',
        kind: 'ISP',
        author: 'Vanessa Rosado, SC',
        status: 'superseded',
        date: '06/20/2025',
        documentDate: '06/20/2025',
        section: 'Shared with providers',
        fileName: 'ISP_Aaliyah_Kaplan_2025-26.pdf',
      },
      {
        id: 'ak-d6',
        title: 'ISP 2024–25',
        kind: 'ISP',
        author: 'Vanessa Rosado, SC',
        status: 'superseded',
        date: '06/14/2024',
        documentDate: '06/14/2024',
        section: 'Shared with providers',
        fileName: 'ISP_Aaliyah_Kaplan_2024-25.pdf',
      },
    ],
    history: [
      {
        id: 'ak-h1',
        category: 'surgical',
        title: 'Appendectomy',
        date: '05/14/1998',
        facility: 'Saint Peter’s, New Brunswick',
        note: 'Open procedure. No complications.',
      },
      {
        id: 'ak-h2',
        category: 'surgical',
        title: 'Cataract extraction, right eye',
        date: '03/22/2021',
        facility: 'RWJ Somerset, Somerville',
        note: 'Lens implant. Reading glasses since; vision adequate for daily tasks.',
      },
      {
        id: 'ak-h3',
        category: 'medical',
        title: 'Mild intellectual disability',
        date: '07/25/1974',
        status: 'active',
        note: 'Lifelong. Reads simple text; manages her own money with staff support.',
      },
      {
        id: 'ak-h4',
        category: 'medical',
        title: 'Hypothyroidism',
        date: '11/03/2009',
        status: 'active',
        note: 'Levothyroxine 50 mcg each morning. TSH checked every six months.',
      },
      {
        id: 'ak-h5',
        category: 'medical',
        title: 'Seizure disorder',
        date: '06/18/1992',
        status: 'resolved',
        note: 'No seizures since 2004; off medication since 2008.',
      },
      {
        id: 'ak-h6',
        category: 'medical',
        title: 'Hypercholesterolemia',
        date: '02/10/2018',
        status: 'active',
        note: 'Atorvastatin 10 mg. Low-fat menu at the group home.',
      },
      {
        id: 'ak-h7',
        category: 'family',
        title: 'Type 2 diabetes',
        relative: 'Mother',
        onsetAge: '58',
        note: 'Deceased 2015, aged 74.',
      },
      {
        id: 'ak-h8',
        category: 'family',
        title: 'Hypertension',
        relative: 'Father',
        onsetAge: '50',
      },
      {
        id: 'ak-h9',
        category: 'family',
        title: 'Hypothyroidism',
        relative: 'Sister',
        onsetAge: '45',
      },
      {
        id: 'ak-h10',
        category: 'social',
        title: 'Living situation',
        summary: 'Group home, Hillsborough',
        detail: 'Group home, Hillsborough',
        note: 'Home Alternatives Inc., 500 Amwell Rd. Shares the home with three housemates; manager Reagan Dorsey checks in every evening and handles appointments.',
      },
      {
        id: 'ak-h11',
        category: 'social',
        title: 'Day program',
        summary: 'Weekdays, Raritan',
        detail: 'Weekdays, Raritan',
        note: 'Attends 9 am – 3 pm. Enjoys the art and cooking groups.',
      },
      {
        id: 'ak-h12',
        category: 'social',
        title: 'Mobility',
        detail: 'Walks independently, short community distances',
        note: 'Unsteady on stairs and uneven ground since two falls this summer. No walking aid yet; PT is assessing her for a rollator.',
      },
      {
        id: 'ak-h13',
        category: 'social',
        title: 'Interests',
        detail: 'Music, puzzles, word searches',
        note: 'Likes country music and helping set the table at the group home.',
      },
      {
        id: 'ak-h14',
        category: 'social',
        title: 'Tobacco & alcohol',
        summary: 'Never smoked, no alcohol',
        detail: 'Never smoked, no alcohol',
      },
      {
        id: 'ak-h15',
        category: 'social',
        title: 'Supports',
        summary: 'Her own guardian',
        detail: 'Her own guardian',
        note: 'DDD support coordinator and her sister Teresa help with big decisions. Group home van for transport.',
      },
    ],
    incidents: [
      {
        id: 'ak-i1',
        occurredAt: new Date(2026, 8, 12, 15, 20).toISOString(),
        description:
          'Slipped on a wet floor in the day program bathroom. No injury; staff helped her up. Floor sign requested.',
        reportedBy: 'Priya Chandran, PT',
      },
    ],
  },
  'p-aisha-vance': {
    sex: 'Female',
    diagnoses: [
      { code: 'F71', description: 'Moderate intellectual disabilities', rank: 'primary' },
      { code: 'R26.89', description: 'Other abnormalities of gait', rank: 'secondary' },
    ],
    insurance: { primary: 'NJ Medicaid · fee-for-service' },
  },
};

export const MOCK_PATIENT_CHARTS: Record<string, PatientChart> = Object.fromEntries(
  MOCK_PATIENTS.map((patient) => [patient.id, { ...defaultChart(patient), ...DETAILS[patient.id] }])
);
