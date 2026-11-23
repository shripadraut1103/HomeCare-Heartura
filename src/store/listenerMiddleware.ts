import { createListenerMiddleware, type ThunkDispatch, type UnknownAction } from '@reduxjs/toolkit';
import type { PersistPartial } from 'redux-persist/es/persistReducer';

import {
  restoreBlockDayAction,
  undoBlockDayRemoval,
} from '@/domain/profile/store/async-actions/AvailabilityAsyncActions';
import { setToastMessage } from '@/store/common-reducer/ToastReducer';
import type { AppState } from '@/store/interfaces/AppState';

type ListenerDispatch = ThunkDispatch<AppState & PersistPartial, unknown, UnknownAction>;

export const listenerMiddleware = createListenerMiddleware();

listenerMiddleware.startListening({
  actionCreator: undoBlockDayRemoval,
  effect: async (action, api) => {
    const dispatch = api.dispatch as ListenerDispatch;
    const result = await dispatch(restoreBlockDayAction(action.payload));
    const payload = restoreBlockDayAction.fulfilled.match(result) ? result.payload : null;
    if (!payload || 'error' in payload) {
      dispatch(
        setToastMessage({
          message: payload?.error || 'Couldn’t bring the block back. Please add it again.',
          type: 'error',
        })
      );
    }
  },
});
