import { useEffect } from 'react';
import { Appearance } from 'react-native';

import { useAppSelector } from '@/store/hooks';

export function useApplyAppearance() {
  const appearance = useAppSelector((state) => state.preferences.appearance);

  useEffect(() => {
    Appearance.setColorScheme(appearance === 'system' ? 'unspecified' : appearance);
  }, [appearance]);
}
