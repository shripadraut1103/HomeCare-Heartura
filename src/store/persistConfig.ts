import { persistReducer, type PersistConfig } from 'redux-persist';

import { AUTH_REDUCER } from '@/store/constants/StoreConstants';
import type { AppState } from '@/store/interfaces/AppState';
import { rootReducer } from '@/store/rootReducer';
import { secureStorage } from '@/store/secureStorage';

/** Only whitelisted slices survive a restart. Never whitelist toast or other transient UI state. */
const persistConfig: PersistConfig<AppState> = {
  key: 'root',
  version: 1,
  storage: secureStorage,
  whitelist: [AUTH_REDUCER],
};

export const persistedReducer = persistReducer(persistConfig, rootReducer);
