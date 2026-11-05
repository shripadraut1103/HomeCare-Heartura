import {
  addMinutes,
  billingCodeId,
  DAILY_NOTE,
  dailyNoteGoals,
  dailyNotePrefill,
  goalsSection,
  minutesBetween,
  unitsFor,
} from '@/domain/notes/dailyNote';
import { MOCK_DAILY_NOTE_DEFAULTS, MOCK_PENDING_NOTES } from '@/domain/notes/mocks/NoteMocks';

const note = (id: string) => MOCK_PENDING_NOTES.find((item) => item.id === id)!;

describe('dailyNote', () => {
  it('bills one unit per full 15 minutes', () => {
    expect(unitsFor(60)).toBe(4);
    expect(unitsFor(52)).toBe(3);
    expect(unitsFor(-5)).toBe(0);
  });

  it('measures the visit in minutes', () => {
    const start = new Date(2026, 8, 3, 8).toISOString();
    expect(minutesBetween(start, addMinutes(start, 45))).toBe(45);
    expect(minutesBetween(start, 'not a date')).toBe(0);
  });

  it('starts from the visit and carries the diagnosis over from the evaluation', () => {
    const values = dailyNotePrefill(note('pn1'), MOCK_DAILY_NOTE_DEFAULTS);
    expect(values[DAILY_NOTE.diagnosis]).toBe('Q90.9 · Down syndrome, unspecified');
    expect(
      minutesBetween(values[DAILY_NOTE.start] as string, values[DAILY_NOTE.end] as string)
    ).toBe(60);
    expect(values[billingCodeId('b1')]).toBe('S8990 HI');
  });

  it('tracks the care plan’s goals, or the defaults without one', () => {
    expect(
      dailyNoteGoals(note('pn3'), MOCK_DAILY_NOTE_DEFAULTS.goals).map((goal) => goal.id)
    ).toEqual(['g1', 'g2', 'g3']);
    expect(dailyNoteGoals(note('pn2'), MOCK_DAILY_NOTE_DEFAULTS.goals)).toBe(
      MOCK_DAILY_NOTE_DEFAULTS.goals
    );
  });

  it('labels each goal by how it is tracked', () => {
    const labels = goalsSection(MOCK_DAILY_NOTE_DEFAULTS.goals).fields.flatMap((field) =>
      'label' in field && field.label?.includes('today') ? [field.label] : []
    );
    expect(labels).toEqual([
      'Achieved today, percent: Brush teeth with verbal cues only',
      'Trials achieved today: Fasten 5 buttons on a shirt',
      'Trials achieved today: Catch a ball from 5 feet',
    ]);
  });
});
