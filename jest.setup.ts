// Tests run without .env; no API URL keeps services on their mocks.
process.env.EXPO_PUBLIC_APP_ENV ??= 'dev';

// Native-backed libraries that can't load under Jest.
jest.mock('@gorhom/bottom-sheet', () => require('@gorhom/bottom-sheet/mock'));
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);
jest.mock('react-native-keyboard-controller', () => require('react-native-keyboard-controller/jest'));
