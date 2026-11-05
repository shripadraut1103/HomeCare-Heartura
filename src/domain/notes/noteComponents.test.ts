import type { NoteComponent, NoteSection } from '@/domain/notes/interfaces/NoteInterfaces';
import { withComponents } from '@/domain/notes/noteComponents';

const sections: NoteSection[] = [
  { id: 'plan', title: 'Plan', accent: 'primary', fields: [{ type: 'divider' }] },
  { id: 'other', title: 'Other', accent: 'primary', fields: [] },
];

const components: NoteComponent[] = [
  {
    id: 'narrative',
    title: 'Narrative',
    sectionId: 'plan',
    fields: [{ type: 'longText', id: 'narrative', label: 'Narrative' }],
  },
];

describe('withComponents', () => {
  it('appends added components to the end of their section', () => {
    const [plan, other] = withComponents(sections, components, ['narrative']);
    expect(plan.fields).toHaveLength(2);
    expect(plan.fields[1]).toMatchObject({ id: 'narrative' });
    expect(other).toBe(sections[1]);
  });

  it('leaves sections untouched when nothing is added', () => {
    expect(withComponents(sections, components, [])).toEqual(sections);
  });
});
