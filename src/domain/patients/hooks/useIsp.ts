import { useState } from 'react';

import type { IndividualServicePlan } from '@/domain/patients/interfaces/PatientInterfaces';
import { MOCK_ISPS } from '@/domain/patients/mocks/IspMocks';

export function useIsp(patientId: string | undefined): IndividualServicePlan | undefined {
  const [isps] = useState(MOCK_ISPS);
  return isps.find((isp) => isp.patientId === patientId);
}
