import notesReducer, {
  removePendingNote,
  restorePendingNote,
} from '@/domain/notes/store/NotesReducer';

const initialState = notesReducer(undefined, { type: 'init' });
const ids = (state: typeof initialState) => state.pending.map((note) => note.id);

describe('NotesReducer', () => {
  it('puts a removed note back in its original position on undo', () => {
    const index = 1;
    const note = initialState.pending[index];
    const removed = notesReducer(initialState, removePendingNote({ noteId: note.id }));
    const state = notesReducer(removed, restorePendingNote({ note, index }));

    expect(ids(state)).toEqual(ids(initialState));
  });

  it('does not duplicate a note that is already in the list', () => {
    const note = initialState.pending[0];
    const state = notesReducer(initialState, restorePendingNote({ note, index: 0 }));

    expect(state.pending).toHaveLength(initialState.pending.length);
  });
});
