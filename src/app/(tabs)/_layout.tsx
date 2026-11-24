import AppTabs from '@/components/AppTabs';
import { usePushNotifications } from '@/domain/notifications/hooks/usePushNotifications';
import { useProfileLoader } from '@/domain/profile/hooks/useProfile';

export default function TabLayout() {
  useProfileLoader();
  usePushNotifications();
  return <AppTabs />;
}
