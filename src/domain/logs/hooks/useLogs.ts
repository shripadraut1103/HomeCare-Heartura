import { useState } from 'react';

import type { ActivityEntry, VisitLogEntry } from '@/domain/logs/interfaces/LogInterfaces';
import { MOCK_ACTIVITY, MOCK_VISIT_LOG } from '@/domain/logs/mocks/LogMocks';

/** TEMPORARY: mock data; switch to the logs service once the API exists. */
export function useVisitLog(): VisitLogEntry[] {
  const [entries] = useState(MOCK_VISIT_LOG);
  return entries;
}

/** TEMPORARY: mock data; switch to the logs service once the API exists. */
export function useActivityLog(): ActivityEntry[] {
  const [entries] = useState(MOCK_ACTIVITY);
  return entries;
}
