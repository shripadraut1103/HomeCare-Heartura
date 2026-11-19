import { Pill } from '@/components/ui/Pill';
import type { Patient } from '@/domain/patients/interfaces/PatientInterfaces';
import { PATIENT_STATUS } from '@/domain/patients/patientList';

export function PatientStatusPill({
  patient,
}: {
  patient: Pick<Patient, 'status' | 'statusLabel'>;
}) {
  const style = PATIENT_STATUS[patient.status];
  return (
    <Pill
      label={patient.statusLabel ?? style.label}
      dot
      color={style.color}
      backgroundColor={style.background}
    />
  );
}
