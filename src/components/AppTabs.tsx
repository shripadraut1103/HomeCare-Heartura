import { TabList, Tabs, TabSlot, TabTrigger } from 'expo-router/ui';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TabBarButton } from '@/components/navigation/TabBarButton';
import { Radius, Shadows, Spacing } from '@/constants/Theme';
import { useTheme } from '@/hooks/useTheme';

const MOCK_UNREAD_MESSAGES = 6;

export const TAB_BAR_HEIGHT = 76;
const BAR_GAP = Spacing.two;

export function useTabBarSpace() {
  const insets = useSafeAreaInsets();
  return TAB_BAR_HEIGHT + BAR_GAP + insets.bottom + Spacing.three;
}

export default function AppTabs() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs style={styles.container}>
      <TabSlot />
      <TabList
        style={[
          styles.bar,
          {
            bottom: insets.bottom + BAR_GAP,
            backgroundColor: theme.background,
            borderColor: theme.border,
          },
        ]}>
        <TabTrigger name="index" href="/" asChild>
          <TabBarButton label="Home" icon={{ ios: 'square.grid.2x2', android: 'grid_view' }} />
        </TabTrigger>
        <TabTrigger name="schedule" href="/schedule" asChild>
          <TabBarButton label="Schedule" icon={{ ios: 'calendar', android: 'calendar_month' }} />
        </TabTrigger>
        <TabTrigger name="patients" href="/patients" asChild>
          <TabBarButton label="Patients" icon={{ ios: 'person.2', android: 'group' }} />
        </TabTrigger>
        <TabTrigger name="communications" href="/communications" asChild>
          <TabBarButton
            label="Communications"
            icon={{ ios: 'bubble.left', android: 'chat_bubble' }}
            badgeCount={MOCK_UNREAD_MESSAGES}
          />
        </TabTrigger>
        <TabTrigger name="profile" href="/profile" asChild>
          <TabBarButton label="Profile" icon={{ ios: 'person', android: 'person' }} />
        </TabTrigger>
      </TabList>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bar: {
    position: 'absolute',
    left: Spacing.three,
    right: Spacing.three,
    height: TAB_BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.large * 2,
    borderWidth: StyleSheet.hairlineWidth,
    ...Shadows.floating,
  },
});
