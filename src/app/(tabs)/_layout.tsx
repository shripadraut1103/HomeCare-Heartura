import AppTabs from '@/components/AppTabs';
import { useConversationsSync } from '@/domain/communications/hooks/useCommunications';
import { usePushNotifications } from '@/domain/notifications/hooks/usePushNotifications';
import { useProfileLoader } from '@/domain/profile/hooks/useProfile';

export default function TabLayout() {
  useProfileLoader();
  usePushNotifications();
  useConversationsSync();
  return <AppTabs />;
}
