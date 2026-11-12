import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { PendingNote, ProgressNoteDue } from '@/domain/notes/interfaces/NoteInterfaces';
import { MOCK_PENDING_NOTES, MOCK_PROGRESS_NOTES_DUE } from '@/domain/notes/mocks/NoteMocks';
import { NOTES_REDUCER } from '@/store/constants/StoreConstants';

export interface NotesState {
  pending: PendingNote[];
  progressDue: ProgressNoteDue[];
}

const initialState: NotesState = {
  pending: MOCK_PENDING_NOTES,
  progressDue: MOCK_PROGRESS_NOTES_DUE,
};

const NotesReducer = createSlice({
  name: NOTES_REDUCER,
  initialState,
  reducers: {
    // TEMPORARY: starts a note locally; create it through the notes API once it exists.
    addPendingNote: (state, action: PayloadAction<PendingNote>) => ({
      ...state,
      pending: [action.payload, ...state.pending],
    }),
    addProgressNoteDue: (state, action: PayloadAction<ProgressNoteDue>) => ({
      ...state,
      progressDue: [action.payload, ...state.progressDue],
    }),
    removePendingNote: (state, action: PayloadAction<{ noteId: string }>) => {
      state.pending = state.pending.filter((note) => note.id !== action.payload.noteId);
    },
    restorePendingNote: (state, action: PayloadAction<{ note: PendingNote; index: number }>) => {
      const { note, index } = action.payload;
      if (state.pending.some((item) => item.id === note.id)) return;
      return {
        ...state,
        pending: [...state.pending.slice(0, index), note, ...state.pending.slice(index)],
      };
    },
  },
});

export default NotesReducer.reducer;
export const { addPendingNote, addProgressNoteDue, removePendingNote, restorePendingNote } =
  NotesReducer.actions;
