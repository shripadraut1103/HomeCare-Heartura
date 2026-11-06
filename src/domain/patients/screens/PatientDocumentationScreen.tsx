import { StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/ui/EmptyState';
import { PendingNotesList } from '@/domain/notes/components/PendingNotesList';
import { usePendingNotes } from '@/domain/notes/hooks/useNotes';
import { useRoutePatient } from '@/domain/patients/hooks/usePatients';
import { getFirstName } from '@/utils/nameFormat';

export default function PatientDocumentationScreen() {
  const { patient } = useRoutePatient();
  const notes = usePendingNotes().filter((note) => note.patientId === patient?.id);
  if (!patient) return null;

  return (
    <View style={styles.container}>
      {notes.length > 0 ? (
        <PendingNotesList notes={notes} />
      ) : (
        <EmptyState message={`No notes waiting for ${getFirstName(patient.name)}.`} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
