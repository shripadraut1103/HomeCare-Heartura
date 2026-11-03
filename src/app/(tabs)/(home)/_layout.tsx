import { Stack } from 'expo-router';

export const unstable_settings = {
  anchor: 'index',
};

export default function HomeStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'ios_from_right',
        fullScreenGestureEnabled: true,
      }}
    />
  );
}
