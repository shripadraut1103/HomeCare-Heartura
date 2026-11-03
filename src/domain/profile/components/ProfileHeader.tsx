import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { IconButton } from '@/components/ui/IconButton';
import { Spacing } from '@/constants/Theme';

const BUTTON_SIZE = 44;

type ProfileHeaderProps = {
  onEditPress?: () => void;
  onSettingsPress?: () => void;
};

export function ProfileHeader({ onEditPress, onSettingsPress }: ProfileHeaderProps) {
  return (
    <View style={styles.row}>
      <ThemedText accessibilityRole="header" style={styles.title}>
        Profile
      </ThemedText>
      <View style={styles.actions}>
        <IconButton
          icon={{ ios: 'pencil', android: 'edit' }}
          accessibilityLabel="Edit profile"
          color="text"
          size={BUTTON_SIZE}
          onPress={onEditPress}
        />
        <IconButton
          icon={{ ios: 'gearshape', android: 'settings' }}
          accessibilityLabel="Settings"
          color="text"
          size={BUTTON_SIZE}
          onPress={onSettingsPress}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.two,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: 700,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
});
