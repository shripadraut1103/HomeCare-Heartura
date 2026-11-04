import { isSameDay } from '@/domain/schedule/calendar';
import type { Visit } from '@/domain/visits/interfaces/VisitInterfaces';
import { useAppSelector } from '@/store/hooks';

const byStart = (a: Visit, b: Visit) => a.startsAt.localeCompare(b.startsAt);

export function useAllVisits() {
  return useAppSelector((state) => state.visits.items);
}

export function visitsOn(visits: readonly Visit[], day: Date) {
  return visits.filter((visit) => isSameDay(new Date(visit.startsAt), day)).sort(byStart);
}

export function useTodaysVisits() {
  return visitsOn(useAllVisits(), new Date());
}

export function useVisit(visitId: string | undefined) {
  return useAppSelector((state) =>
    visitId ? state.visits.items.find((visit) => visit.id === visitId) : undefined
  );
}
