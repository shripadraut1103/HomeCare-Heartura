import AppTabs from '@/components/AppTabs';
import { useProfileLoader } from '@/domain/profile/hooks/useProfile';

export default function TabLayout() {
  useProfileLoader();
  return <AppTabs />;
}
