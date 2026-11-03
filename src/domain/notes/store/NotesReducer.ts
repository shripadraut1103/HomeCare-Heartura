import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { PendingNote } from '@/domain/notes/interfaces/NoteInterfaces';
import { MOCK_PENDING_NOTES } from '@/domain/notes/mocks/NoteMocks';
import { NOTES_REDUCER } from '@/store/constants/StoreConstants';

export interface NotesState {
  pending: PendingNote[];
}

const initialState: NotesState = {
  pending: MOCK_PENDING_NOTES,
};

const NotesReducer = createSlice({
  name: NOTES_REDUCER,
  initialState,
  reducers: {
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
export const { removePendingNote, restorePendingNote } = NotesReducer.actions;
