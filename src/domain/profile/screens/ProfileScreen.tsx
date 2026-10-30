import { ComingSoonScreen } from '@/components/ComingSoonScreen';
import { Button } from '@/components/ui/Button';
import { lockSession } from '@/domain/auth/store/AuthReducer';
import { useAppDispatch } from '@/store/hooks';

export default function ProfileScreen() {
  const dispatch = useAppDispatch();

  return (
    <ComingSoonScreen title="Profile">
      <Button title="Sign out" variant="secondary" onPress={() => dispatch(lockSession())} />
    </ComingSoonScreen>
  );
}
