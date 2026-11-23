import type { ApiPatientRequest } from '@/domain/requests/interfaces/RequestApi';
import { toPatientRequest } from '@/domain/requests/requestMapper';
import requestsReducer from '@/domain/requests/store/RequestsReducer';
import {
  acceptRequestAction,
  declineRequestAction,
  fetchRequestCountsAction,
  fetchRequestsAction,
} from '@/domain/requests/store/async-actions/RequestAsyncActions';

const apiRequest = (id: string, overrides: Partial<ApiPatientRequest> = {}): ApiPatientRequest => ({
  id,
  patient_id: `p-${id}`,
  patient_name: 'Leah Morales',
  patient_mrn: 'HOP-10001',
  patient_status: 'prospect',
  services_requested: ['pt', 'speech'],
  service: 'pt',
  service_label: 'Physical therapy',
  town: 'Edison',
  status: 'pending',
  status_label: 'Pending',
  decline_reason: '',
  decline_reason_label: '',
  decline_note: '',
  sent_at: '2026-11-19T10:00:00Z',
  sent_by_name: 'Denise Ortiz',
  answered_at: null,
  ...overrides,
});

const page = (results: ApiPatientRequest[], next: string | null = null) => ({
  data: {
    count: results.length,
    page: 1,
    page_size: 20,
    total_pages: 1,
    next,
    previous: null,
    results,
  },
});

const loadedWaiting = () =>
  requestsReducer(
    undefined,
    fetchRequestsAction.fulfilled(page([apiRequest('r1'), apiRequest('r2')]), 'a', {
      status: 'waiting',
      page: 1,
    })
  );

describe('requestMapper', () => {
  it('maps the API request to the card', () => {
    expect(
      toPatientRequest(
        apiRequest('r1', {
          status: 'declined',
          decline_reason_label: 'Too far',
          decline_note: 'Over 30 mi',
        })
      )
    ).toMatchObject({
      status: 'declined',
      disciplines: ['PT', 'ST'],
      offer: 'Physical therapy',
      declineReason: 'Too far · Over 30 mi',
    });
  });
});

describe('RequestsReducer', () => {
  it('loads a tab and appends later pages', () => {
    let state = loadedWaiting();
    expect(state.lists.waiting).toMatchObject({ ids: ['r1', 'r2'], loaded: true });
    expect(state.counts.waiting).toBe(2);
    state = requestsReducer(
      state,
      fetchRequestsAction.fulfilled(page([apiRequest('r3')]), 'b', { status: 'waiting', page: 2 })
    );
    expect(state.lists.waiting.ids).toEqual(['r1', 'r2', 'r3']);
  });

  it('moves an accepted request out of Waiting and updates counts', () => {
    let state = requestsReducer(
      loadedWaiting(),
      fetchRequestsAction.fulfilled(page([]), 'c', { status: 'accepted', page: 1 })
    );
    state = requestsReducer(
      state,
      acceptRequestAction.fulfilled({ data: apiRequest('r1', { status: 'accepted' }) }, 'd', {
        requestId: 'r1',
      })
    );
    expect(state.lists.waiting.ids).toEqual(['r2']);
    expect(state.lists.accepted.ids).toEqual(['r1']);
    expect(state.counts).toMatchObject({ waiting: 1, accepted: 1 });
  });

  it('keeps the list when a decline fails', () => {
    const state = requestsReducer(
      loadedWaiting(),
      declineRequestAction.fulfilled(
        { error: 'Not pending', code: 'VALIDATION_ERROR', status: 400, details: {}, fields: {} },
        'e',
        { requestId: 'r1', reason: 'too_far', note: '' }
      )
    );
    expect(state.lists.waiting.ids).toEqual(['r1', 'r2']);
  });

  it('reads the badge counts', () => {
    const state = requestsReducer(
      undefined,
      fetchRequestCountsAction.fulfilled(
        { data: { pending: 3, accepted: 5, declined: 1, withdrawn: 0 } },
        'f'
      )
    );
    expect(state.counts).toEqual({ waiting: 3, accepted: 5, declined: 1, withdrawn: 0 });
  });
});
