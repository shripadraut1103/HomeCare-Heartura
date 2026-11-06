import '@/global.css';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { AnimatedSplash } from '@/components/AnimatedSplash';
import { ToastHost } from '@/components/ToastHost';
import { useApplyAppearance } from '@/domain/profile/hooks/useApplyAppearance';
import { useAppSelector } from '@/store/hooks';
import { persistor, store } from '@/store/storeConfig';

const PUSHED_SCREEN = { animation: 'ios_from_right', fullScreenGestureEnabled: true } as const;

function RootNavigator() {
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);
  useApplyAppearance();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}>
      <Stack.Protected guard={isLoggedIn}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="progress-note/[id]" options={PUSHED_SCREEN} />
        <Stack.Screen name="evaluation/[id]" options={PUSHED_SCREEN} />
        <Stack.Screen name="care-plan/[id]" options={PUSHED_SCREEN} />
        <Stack.Screen name="daily-note/[id]" options={PUSHED_SCREEN} />
        <Stack.Screen name="conversation/[id]" options={PUSHED_SCREEN} />
        <Stack.Screen name="patient/[id]" options={PUSHED_SCREEN} />
        <Stack.Screen name="edit-profile" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="edit-availability" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="schedule-appointment" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="create-visit" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="add-history" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="upload-document" options={{ presentation: 'fullScreenModal' }} />
      </Stack.Protected>
      <Stack.Protected guard={!isLoggedIn}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [splashVisible, setSplashVisible] = useState(true);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <GestureHandlerRootView style={styles.root}>
            <BottomSheetModalProvider>
              <RootNavigator />
            </BottomSheetModalProvider>
            <StatusBar style="auto" />
            <ToastHost />
            {splashVisible ? <AnimatedSplash onFinish={() => setSplashVisible(false)} /> : null}
          </GestureHandlerRootView>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
