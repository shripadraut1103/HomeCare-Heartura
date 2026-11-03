import { Switch } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { haptics } from '@/utils/haptics';

type AppSwitchProps = {
  accessibilityLabel: string;
  accessibilityHint?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
};

export function AppSwitch({ onValueChange, ...props }: AppSwitchProps) {
  const theme = useTheme();

  return (
    <Switch
      {...props}
      onValueChange={(next) => {
        haptics.selection();
        onValueChange(next);
      }}
      trackColor={{ false: theme.backgroundSelected, true: theme.primary }}
      thumbColor={theme.onPrimary}
      ios_backgroundColor={theme.backgroundSelected}
    />
  );
}
