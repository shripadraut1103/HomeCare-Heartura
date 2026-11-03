import requestsReducer, {
  answerRequest,
  reopenRequest,
} from '@/domain/requests/store/RequestsReducer';

const initialState = requestsReducer(undefined, { type: 'init' });
const statusOf = (state: typeof initialState, requestId: string) =>
  state.requests.find((request) => request.id === requestId)?.status;

describe('RequestsReducer', () => {
  it('moves an answered request out of Waiting', () => {
    const state = requestsReducer(
      initialState,
      answerRequest({ requestId: 'r1', status: 'declined' })
    );

    expect(statusOf(state, 'r1')).toBe('declined');
    expect(statusOf(state, 'r2')).toBe('waiting');
  });

  it('puts a request back in Waiting on undo', () => {
    const answered = requestsReducer(
      initialState,
      answerRequest({ requestId: 'r1', status: 'accepted' })
    );
    const state = requestsReducer(answered, reopenRequest({ requestId: 'r1' }));

    expect(statusOf(state, 'r1')).toBe('waiting');
  });

  it('keeps the decline reason until the request is reopened', () => {
    const declined = requestsReducer(
      initialState,
      answerRequest({ requestId: 'r1', status: 'declined', reason: 'Caseload is full' })
    );
    const reasonOf = (state: typeof initialState) =>
      state.requests.find((request) => request.id === 'r1')?.declineReason;

    expect(reasonOf(declined)).toBe('Caseload is full');
    expect(reasonOf(requestsReducer(declined, reopenRequest({ requestId: 'r1' })))).toBeUndefined();
  });
});
