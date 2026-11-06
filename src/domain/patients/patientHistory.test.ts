import type { HistoryEntry } from '@/domain/patients/interfaces/PatientInterfaces';
import { historyView, socialSummary } from '@/domain/patients/patientHistory';

const entry = (seed: Omit<HistoryEntry, 'id'>): HistoryEntry => ({ id: 'h', ...seed });

describe('historyView', () => {
  it('shows a surgery’s date and facility, with the note below', () => {
    const view = historyView(
      entry({
        category: 'surgical',
        title: 'Appendectomy',
        date: '05/14/1998',
        facility: 'Saint Peter’s',
        note: 'Open procedure.',
      })
    );
    expect(view.subtitle).toBe('05/14/1998 · Saint Peter’s');
    expect(view.fields.map((field) => field.label)).toEqual(['Date', 'Facility']);
    expect(view.note).toEqual({ text: 'Open procedure.', wide: true });
  });

  it('puts a short note beside a single field and a long one below it', () => {
    const short = historyView(
      entry({
        category: 'medical',
        title: 'Hypothyroidism',
        date: '11/03/2009',
        note: 'Daily pill.',
      })
    );
    expect(short.subtitle).toBe('11/03/2009');
    expect(short.note?.wide).toBe(false);

    const long = historyView(
      entry({ category: 'social', title: 'Mobility', detail: 'Walks', note: 'x'.repeat(120) })
    );
    expect(long.subtitle).toBeUndefined();
    expect(long.note?.wide).toBe(true);
  });

  it('describes family history by relative and onset age', () => {
    const view = historyView(
      entry({ category: 'family', title: 'Hypertension', relative: 'Father', onsetAge: '50' })
    );
    expect(view.subtitle).toBe('Father · 50');
    expect(view.note).toBeUndefined();
  });

  it('uses only a short detail as the social summary', () => {
    expect(socialSummary('Weekdays, Raritan')).toBe('Weekdays, Raritan');
    expect(socialSummary('Walks independently, short community distances')).toBeUndefined();
  });
});
