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
  },
});

export default NotesReducer.reducer;
export const { removePendingNote } = NotesReducer.actions;
