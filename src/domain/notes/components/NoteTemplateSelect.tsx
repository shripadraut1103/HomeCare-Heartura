import { Select, type SelectOption } from '@/components/ui/Select';
import type { NoteTemplate } from '@/domain/notes/interfaces/NoteInterfaces';

type NoteTemplateSelectProps = {
  templates: readonly NoteTemplate[];
  value: string;
  onChange: (templateId: string) => void;
};

export const getDefaultTemplateId = (templates: readonly NoteTemplate[]) =>
  (templates.find((template) => template.isDefault) ?? templates[0])?.id ?? '';

export function NoteTemplateSelect({ templates, value, onChange }: NoteTemplateSelectProps) {
  const options: SelectOption<string>[] = templates.map((template) => ({
    value: template.id,
    label: template.name,
    hint: template.isDefault ? 'default' : undefined,
  }));

  return <Select label="Template" options={options} value={value} onChange={onChange} />;
}
