import { configureStore } from '@reduxjs/toolkit';
import { FLUSH, PAUSE, PERSIST, persistStore, PURGE, REGISTER, REHYDRATE } from 'redux-persist';

import { configureApiSession } from '@/config/AxiosConfig';
import { sessionExpired, tokensRefreshed } from '@/domain/auth/store/AuthReducer';
import { setToastMessage } from '@/store/common-reducer/ToastReducer';
import { listenerMiddleware } from '@/store/listenerMiddleware';
import { persistedReducer } from '@/store/persistConfig';

export const createStore = () =>
  configureStore({
    reducer: persistedReducer,
    devTools: __DEV__,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        // redux-persist dispatches non-serializable actions; ignore only those.
        serializableCheck: { ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER] },
      }).prepend(listenerMiddleware.middleware),
  });

const store = createStore();

configureApiSession({
  getTenant: () =>
    store.getState().preferences.organization ||
    store.getState().auth.me?.organization?.slug ||
    null,
  getAccessToken: () => store.getState().auth.accessToken,
  getRefreshToken: () => store.getState().auth.refreshToken,
  onTokensRefreshed: (tokens) => store.dispatch(tokensRefreshed(tokens)),
  onSessionEnded: () => {
    store.dispatch(sessionExpired());
    store.dispatch(
      setToastMessage({
        message: 'Your session has expired. Please sign in again.',
        type: 'warning',
      })
    );
  },
});

const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;

export { persistor, store };
