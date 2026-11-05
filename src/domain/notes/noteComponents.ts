import type { NoteComponent, NoteSection } from '@/domain/notes/interfaces/NoteInterfaces';

export function withComponents(
  sections: readonly NoteSection[],
  components: readonly NoteComponent[],
  addedIds: readonly string[]
): NoteSection[] {
  const added = components.filter((component) => addedIds.includes(component.id));
  return sections.map((section) => {
    const fields = added
      .filter((component) => component.sectionId === section.id)
      .flatMap((component) => component.fields);
    return fields.length > 0 ? { ...section, fields: [...section.fields, ...fields] } : section;
  });
}
