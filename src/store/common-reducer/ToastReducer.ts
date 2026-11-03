import { createSlice, type PayloadAction, type UnknownAction } from '@reduxjs/toolkit';

export type ToastType = 'success' | 'error' | 'warning';

export interface ToastAction {
  label: string;
  onPress: UnknownAction;
}

export interface ToastState {
  message: string | null;
  type: ToastType;
  action: ToastAction | null;
  id: number;
}

const initialState: ToastState = {
  message: null,
  type: 'success',
  action: null,
  id: 0,
};

const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    setToastMessage: (
      state,
      action: PayloadAction<{ message: string; type?: ToastType; action?: ToastAction }>
    ) => {
      state.message = action.payload.message;
      state.type = action.payload.type ?? 'success';
      state.action = action.payload.action ?? null;
      state.id += 1;
    },
    clearToastMessage: (state) => {
      state.message = null;
      state.type = 'success';
      state.action = null;
    },
  },
});

export const { setToastMessage, clearToastMessage } = toastSlice.actions;
export default toastSlice.reducer;
