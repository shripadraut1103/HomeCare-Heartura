import { logoutAction } from '@/domain/auth/store/async-actions/AuthAsyncActions';
import { removePendingNote } from '@/domain/notes/store/NotesReducer';
import { rootReducer } from '@/store/rootReducer';

describe('rootReducer', () => {
  it('puts patient data back to its starting state on logout', () => {
    const initial = rootReducer(undefined, { type: 'init' });
    const firstNote = initial.notes.pending[0].id;
    const edited = rootReducer(initial, removePendingNote({ noteId: firstNote }));
    expect(edited.notes.pending).toHaveLength(initial.notes.pending.length - 1);

    const signedOut = rootReducer(edited, logoutAction.fulfilled(undefined, 'request-id'));

    expect(signedOut.notes).toEqual(initial.notes);
    expect(signedOut.preferences).toBe(edited.preferences);
  });
});
