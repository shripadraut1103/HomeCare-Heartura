import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type ToastType = 'success' | 'error' | 'warning';

export interface ToastState {
  message: string | null;
  type: ToastType;
}

const initialState: ToastState = {
  message: null,
  type: 'success',
};

const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    setToastMessage: (state, action: PayloadAction<{ message: string; type?: ToastType }>) => {
      state.message = action.payload.message;
      state.type = action.payload.type ?? 'success';
    },
    clearToastMessage: (state) => {
      state.message = null;
      state.type = 'success';
    },
  },
});

export const { setToastMessage, clearToastMessage } = toastSlice.actions;
export default toastSlice.reducer;
