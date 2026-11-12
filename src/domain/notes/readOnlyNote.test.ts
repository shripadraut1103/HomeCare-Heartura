import type { NoteSection } from '@/domain/notes/interfaces/NoteInterfaces';
import { readOnlySections } from '@/domain/notes/readOnlyNote';

const sections: NoteSection[] = [
  {
    id: 'patient',
    title: 'Patient & diagnosis',
    accent: 'primary',
    fields: [
      {
        type: 'subsection',
        title: 'Patient details',
        fields: [{ type: 'readOnly', id: 'number', label: 'Patient Number' }, { type: 'divider' }],
      },
      {
        type: 'subsection',
        title: 'Outcome',
        fields: [{ type: 'readOnly', id: 'outcome', label: 'Outcome', value: 'Hidden' }],
      },
    ],
  },
  {
    id: 'plan',
    title: 'Plan of treatment',
    accent: 'primary',
    fields: [
      {
        type: 'subsection',
        title: 'Frequency',
        fields: [{ type: 'select', id: 'per', label: 'Per', options: ['week'] }],
      },
      { type: 'longText', id: 'narrative', label: 'Treatment plan narrative' },
    ],
  },
  {
    id: 'goals',
    title: 'Goals',
    accent: 'primary',
    fields: [
      {
        type: 'repeat',
        id: 'goals',
        addLabel: 'Add',
        removeLabel: 'Remove',
        fields: [
          { type: 'shortText', id: 'goal', label: 'Goal' },
          {
            type: 'shortText',
            id: 'trials',
            label: 'Target trials',
            showWhen: { id: 'tracked', value: 'Trials' },
          },
        ],
      },
    ],
  },
];

describe('readOnlySections', () => {
  const result = readOnlySections(sections, {
    number: '433455',
    outcome: 'Outcome 3',
    per: 'week',
    goals: ['a', 'b'],
    'goals.a.goal': 'Walk',
    'goals.b.goal': 'Climb',
    'goals.b.tracked': 'Trials',
  });

  it('gives each subsection its own card and prefers saved values', () => {
    expect(result[0].cards).toEqual([
      { title: 'Patient details', rows: [{ label: 'Patient Number', value: '433455' }] },
      { title: 'Outcome', rows: [{ label: 'Outcome', value: 'Outcome 3' }] },
    ]);
  });

  it('names a loose card after its first field when the section has subsections', () => {
    expect(result[1].cards.map((card) => card.title)).toEqual([
      'Frequency',
      'Treatment plan narrative',
    ]);
    expect(result[1].cards[1].rows[0].value).toBeUndefined();
  });

  it('lists every repeated block and skips fields hidden by their condition', () => {
    expect(result[2].cards[0].rows).toEqual([
      { label: 'Goal', value: 'Walk' },
      { label: 'Goal', value: 'Climb' },
      { label: 'Target trials', value: undefined },
    ]);
  });
});
