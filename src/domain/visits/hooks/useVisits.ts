import { useAppSelector } from '@/store/hooks';

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export function useTodaysVisits() {
  const visits = useAppSelector((state) => state.visits.items);
  const today = new Date();
  return visits
    .filter((visit) => isSameDay(new Date(visit.startsAt), today))
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export function useVisit(visitId: string | undefined) {
  return useAppSelector((state) =>
    visitId ? state.visits.items.find((visit) => visit.id === visitId) : undefined
  );
}
