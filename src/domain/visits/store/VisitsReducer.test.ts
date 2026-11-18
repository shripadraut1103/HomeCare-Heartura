import { serviceError } from '@/config/ApiError';
import { fetchVisitsAction } from '@/domain/visits/store/async-actions/VisitAsyncActions';
import visitsReducer from '@/domain/visits/store/VisitsReducer';
import type { Visit } from '@/domain/visits/interfaces/VisitInterfaces';
import type { ApiAppointment } from '@/domain/visits/interfaces/AppointmentApi';

const visit = (id: string, startsAt: string) => ({ id, startsAt }) as Visit;
const apiAppointment = (id: string, date: string) =>
  ({
    id,
    date,
    start_time: '10:00',
    duration_min: 45,
    units: 3,
    status: 'scheduled',
    patient: { id: 'p1', name: 'Aisha Vance', mrn: 'HCT-1', address: '', phone: '' },
    provider: { name: 'Helena Ruiz', discipline_label: 'Physical therapy' },
    address: null,
    authorization: null,
    notes: '',
  }) as unknown as ApiAppointment;

const range = { from: '2026-11-15', to: '2026-11-21' };

describe('VisitsReducer', () => {
  const before = {
    items: [
      visit('old-in-range', new Date(2026, 10, 17, 9).toISOString()),
      visit('next-week', new Date(2026, 10, 25, 9).toISOString()),
    ],
    loading: true,
    error: null,
  };

  it('replaces the visits in the loaded range and keeps the rest', () => {
    const state = visitsReducer(
      before,
      fetchVisitsAction.fulfilled({ data: [apiAppointment('a1', '2026-11-18')] }, 'r', range)
    );

    expect(state.loading).toBe(false);
    expect(state.items.map((item) => item.id).sort()).toEqual(['a1', 'next-week']);
  });

  it('keeps what it had and shows the message when loading fails', () => {
    const state = visitsReducer(
      before,
      fetchVisitsAction.fulfilled(
        serviceError('NETWORK_ERROR', 'Can’t reach the server.'),
        'r',
        range
      )
    );

    expect(state.items).toBe(before.items);
    expect(state.error).toBe('Can’t reach the server.');
  });
});
