import { Pill } from '@/components/ui/Pill';
import type { PatientStatus } from '@/domain/patients/interfaces/PatientInterfaces';
import { PATIENT_STATUS } from '@/domain/patients/patientList';

export function PatientStatusPill({ status }: { status: PatientStatus }) {
  const style = PATIENT_STATUS[status];
  return <Pill label={style.label} dot color={style.color} backgroundColor={style.background} />;
}
