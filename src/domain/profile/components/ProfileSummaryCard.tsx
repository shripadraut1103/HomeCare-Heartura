import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Avatar } from '@/components/ui/Avatar';
import { Pill } from '@/components/ui/Pill';
import { Radius, Shadows, Spacing } from '@/constants/Theme';
import type { ProviderProfile } from '@/domain/profile/interfaces/ProfileInterfaces';
import { useTheme } from '@/hooks/useTheme';

const AVATAR_SIZE = 56;

export function ProfileSummaryCard({ profile }: { profile: ProviderProfile }) {
  const theme = useTheme();
  const isActive = profile.status === 'active';

  return (
    <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
      <View style={[styles.avatarRing, { borderColor: theme.toneBlueFg }]}>
        <Avatar
          name={profile.name}
          size={AVATAR_SIZE}
          color="toneBlueFg"
          backgroundColor="toneBlueBg"
        />
      </View>
      <View style={styles.body}>
        <ThemedText numberOfLines={1} style={styles.name}>
          {profile.name}
        </ThemedText>
        <ThemedText numberOfLines={1} themeColor="textSecondary" style={styles.meta}>
          {profile.discipline.label} · {profile.region}
        </ThemedText>
        <Pill
          label={isActive ? 'Active' : 'Inactive'}
          color={isActive ? 'success' : 'textSecondary'}
          backgroundColor={isActive ? 'successMuted' : 'backgroundElement'}
          dot
          style={styles.status}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.large,
    borderWidth: StyleSheet.hairlineWidth,
    ...Shadows.card,
  },
  avatarRing: {
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
  },
  body: {
    flex: 1,
    gap: Spacing.half,
  },
  name: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: 700,
  },
  meta: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: 400,
  },
  status: {
    marginTop: Spacing.one,
  },
});
