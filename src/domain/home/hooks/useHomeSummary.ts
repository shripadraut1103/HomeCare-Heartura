import { useState } from 'react';

import type { HomeSummary } from '@/domain/home/interfaces/HomeInterfaces';
import { createMockHomeSummary } from '@/domain/home/mocks/HomeMocks';
import { useProfile } from '@/domain/profile/hooks/useProfile';

/**
 * Data for the Home dashboard.
 * TEMPORARY: returns mock data; switch to the dashboard service (and Redux) once the API exists.
 * Screens only depend on this hook, so that swap won't touch any UI.
 */
export function useHomeSummary(): HomeSummary {
  const [summary] = useState(createMockHomeSummary);
  const { name } = useProfile();
  return { ...summary, providerName: name };
}
