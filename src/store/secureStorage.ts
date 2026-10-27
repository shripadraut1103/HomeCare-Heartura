import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { Storage } from 'redux-persist';

/**
 * redux-persist storage engine backed by the iOS Keychain / Android Keystore.
 *
 * - SecureStore keys allow only alphanumerics, `.`, `-` and `_`, so redux-persist's
 *   `persist:<key>` is rewritten.
 * - SecureStore is not available on web; there nothing is persisted, so tokens
 *   never land in unencrypted browser storage.
 * - Some iOS versions reject values above ~2 KB. Keep whitelisted slices small; if
 *   real tokens push `auth` past that, store each token under its own key instead.
 */
const toSecureStoreKey = (key: string) => key.replace(/[^A-Za-z0-9._-]/g, '_');

export const secureStorage: Storage = {
  getItem: (key: string) =>
    Platform.OS === 'web' ? Promise.resolve(null) : SecureStore.getItemAsync(toSecureStoreKey(key)),
  setItem: (key: string, value: string) =>
    Platform.OS === 'web'
      ? Promise.resolve()
      : SecureStore.setItemAsync(toSecureStoreKey(key), value),
  removeItem: (key: string) =>
    Platform.OS === 'web' ? Promise.resolve() : SecureStore.deleteItemAsync(toSecureStoreKey(key)),
};
