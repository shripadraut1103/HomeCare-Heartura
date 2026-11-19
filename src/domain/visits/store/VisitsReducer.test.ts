import { serviceError } from '@/config/ApiError';
import type { ApiSchedulingReference } from '@/domain/schedule/interfaces/BookingApi';
import {
  changeVisitStatusAction,
  createAppointmentsAction,
  fetchSchedulingReferenceAction,
  fetchVisitAction,
  fetchVisitsAction,
  rescheduleVisitAction,
  updateAppointmentAction,
} from '@/domain/visits/store/async-actions/VisitAsyncActions';
import { toApiVisitStatus } from '@/domain/visits/appointmentMapper';
import visitsReducer, { type VisitsState } from '@/domain/visits/store/VisitsReducer';
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

const empty = { reference: null, referenceLoading: false, referenceError: null };

describe('VisitsReducer', () => {
  const before: VisitsState = {
    items: [
      visit('old-in-range', new Date(2026, 10, 17, 9).toISOString()),
      visit('next-week', new Date(2026, 10, 25, 9).toISOString()),
    ],
    loading: true,
    error: null,
    ...empty,
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

  describe('change status', () => {
    const arg = { visitId: 'a1', status: 'cancelled' as const, version: 1 };
    const loaded: VisitsState = {
      items: [
        {
          ...visit('a1', new Date(2026, 10, 18, 10).toISOString()),
          status: 'scheduled' as const,
          version: 1,
        },
      ],
      loading: false,
      error: null,
      ...empty,
    };

    it('maps app statuses to the API values', () => {
      expect(toApiVisitStatus('noShow')).toBe('no_show');
      expect(toApiVisitStatus('cancelled')).toBe('cancelled');
      expect(toApiVisitStatus('rescheduled')).toBeUndefined();
    });

    it('updates the visit from the response', () => {
      const response = { ...apiAppointment('a1', '2026-11-18'), status: 'cancelled', version: 2 };
      const state = visitsReducer(
        loaded,
        changeVisitStatusAction.fulfilled({ data: response }, 'r', arg)
      );
      expect(state.items[0]).toMatchObject({ status: 'cancelled', version: 2 });
    });

    it('keeps the visit unchanged when the call fails', () => {
      const state = visitsReducer(
        loaded,
        changeVisitStatusAction.fulfilled(
          serviceError('EDIT_CONFLICT', 'Changed elsewhere', 409),
          'r',
          arg
        )
      );
      expect(state.items[0]).toMatchObject({ status: 'scheduled', version: 1 });
    });
  });

  describe('booking', () => {
    const loaded: VisitsState = {
      items: [
        {
          ...visit('a1', new Date(2026, 10, 18, 10).toISOString()),
          status: 'scheduled' as const,
          version: 1,
        },
      ],
      loading: false,
      error: null,
      ...empty,
    };
    const slot = {
      patient: 'p1',
      provider: 'm1',
      service_code: 'S8990',
      visit_type: 'daily' as const,
      date: '2026-11-20',
      start_time: '10:00',
      duration_min: 45,
      place_of_service: '12',
      address: null,
      payer: 'medicaid' as const,
    };
    const create = {
      ...slot,
      notes: '',
      repeat: null,
      override_conflicts: false,
      conflict_reason: '',
    };

    it('adds every visit of a new series', () => {
      const state = visitsReducer(
        loaded,
        createAppointmentsAction.fulfilled(
          { data: [apiAppointment('n1', '2026-11-20'), apiAppointment('n2', '2026-11-27')] },
          'r',
          create
        )
      );
      expect(state.items.map((item) => item.id)).toEqual(['a1', 'n1', 'n2']);
    });

    it('adds nothing when booking is refused', () => {
      const state = visitsReducer(
        loaded,
        createAppointmentsAction.fulfilled(
          serviceError('SCHEDULE_CONFLICT', 'Overlaps', 409),
          'r',
          create
        )
      );
      expect(state.items).toBe(loaded.items);
    });

    it('replaces an edited visit with the saved one', () => {
      const saved = { ...apiAppointment('a1', '2026-11-19'), version: 2, duration_min: 60 };
      const state = visitsReducer(
        loaded,
        updateAppointmentAction.fulfilled({ data: saved }, 'r', {
          visitId: 'a1',
          body: { version: 1, duration_min: 60 },
        })
      );
      expect(state.items).toHaveLength(1);
      expect(state.items[0]).toMatchObject({ version: 2, durationMinutes: 60 });
    });

    it('marks the old visit rescheduled and adds the new one', () => {
      const state = visitsReducer(
        loaded,
        rescheduleVisitAction.fulfilled({ data: apiAppointment('a2', '2026-11-21') }, 'r', {
          visitId: 'a1',
          body: {
            version: 1,
            date: '2026-11-21',
            start_time: '10:00',
            duration_min: 45,
            note: 'Family asked',
            override_conflicts: false,
            conflict_reason: '',
          },
        })
      );
      expect(state.items.map((item) => [item.id, item.status])).toEqual([
        ['a1', 'rescheduled'],
        ['a2', 'scheduled'],
      ]);
    });

    it('refreshes a visit from its detail', () => {
      const fresh = { ...apiAppointment('a1', '2026-11-18'), status: 'rescheduled', version: 5 };
      const state = visitsReducer(
        loaded,
        fetchVisitAction.fulfilled({ data: fresh }, 'r', { visitId: 'a1' })
      );
      expect(state.items[0]).toMatchObject({ status: 'rescheduled', version: 5 });
    });

    it('keeps the reference lists once loaded', () => {
      const reference = { services: [], providers: [] } as unknown as ApiSchedulingReference;
      const pending = visitsReducer(loaded, fetchSchedulingReferenceAction.pending('r'));
      expect(pending.referenceLoading).toBe(true);
      const state = visitsReducer(
        pending,
        fetchSchedulingReferenceAction.fulfilled({ data: reference }, 'r')
      );
      expect(state).toMatchObject({ reference, referenceLoading: false, referenceError: null });
    });
  });
});
