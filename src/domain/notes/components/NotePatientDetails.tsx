import { View } from 'react-native';

import { DetailRow } from '@/components/ui/DetailRow';
import type { ProgressNoteDue } from '@/domain/notes/interfaces/NoteInterfaces';
import { formatAge, formatNumericDate, parseNumericDate } from '@/utils/dateFormat';

export function NotePatientDetails({ note }: { note: ProgressNoteDue }) {
  const rows: readonly [label: string, value: string][] = [
    ['Patient', `${note.patientName} · ${note.patientCode}`],
    ['Sum. Date', formatNumericDate(new Date(note.visitAt))],
    ['DOB', note.dateOfBirth],
    ['Svc. Period', `${note.servicePeriod.start} – ${note.servicePeriod.end}`],
    ['Age', formatAge(parseNumericDate(note.dateOfBirth))],
    ['Diagnosis', note.diagnosis],
    ['Therapist', note.therapist],
  ];

  return (
    <View>
      {rows.map(([label, value], index) => (
        <DetailRow key={label} label={label} isLast={index === rows.length - 1}>
          {value}
        </DetailRow>
      ))}
    </View>
  );
}
