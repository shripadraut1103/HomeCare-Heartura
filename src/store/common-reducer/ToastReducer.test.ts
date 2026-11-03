import toastReducer, {
  clearToastMessage,
  setToastMessage,
} from '@/store/common-reducer/ToastReducer';

const initialState = toastReducer(undefined, { type: 'init' });
const undo = { type: 'requests/reopenRequest', payload: { requestId: 'r1' } };

describe('ToastReducer', () => {
  it('gives every toast a new id, even with the same message', () => {
    const first = toastReducer(initialState, setToastMessage({ message: 'Saved' }));
    const second = toastReducer(first, setToastMessage({ message: 'Saved' }));

    expect(second.id).toBe(first.id + 1);
  });

  it('keeps the action until the toast is cleared', () => {
    const shown = toastReducer(
      initialState,
      setToastMessage({
        message: 'Declined Leah Morales',
        action: { label: 'Undo', onPress: undo },
      })
    );
    expect(shown.action?.onPress).toEqual(undo);

    const cleared = toastReducer(shown, clearToastMessage());
    expect(cleared.message).toBeNull();
    expect(cleared.action).toBeNull();
  });

  it('drops the previous action when a toast without one replaces it', () => {
    const withAction = toastReducer(
      initialState,
      setToastMessage({ message: 'Declined', action: { label: 'Undo', onPress: undo } })
    );
    const state = toastReducer(withAction, setToastMessage({ message: 'Password changed' }));

    expect(state.action).toBeNull();
  });
});
