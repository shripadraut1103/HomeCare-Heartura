import { Pill } from '@/components/ui/Pill';
import { CARE_ROLE } from '@/domain/communications/careRoles';
import type { CareRole } from '@/domain/communications/interfaces/CommunicationInterfaces';

export function RolePill({ role }: { role: CareRole }) {
  const { label, color, background } = CARE_ROLE[role];
  return <Pill label={label} color={color} backgroundColor={background} />;
}
