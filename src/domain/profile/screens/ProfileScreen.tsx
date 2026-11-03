import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import { useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTabBarSpace } from '@/components/AppTabs';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { DetailRow, detailValueTextStyle } from '@/components/ui/DetailRow';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Spacing } from '@/constants/Theme';
import { lockSession } from '@/domain/auth/store/AuthReducer';
import { ChangePasswordSheet } from '@/domain/profile/components/ChangePasswordSheet';
import { MenuRow } from '@/domain/profile/components/MenuRow';
import { ProfileCard } from '@/domain/profile/components/ProfileCard';
import { ProfileHeader } from '@/domain/profile/components/ProfileHeader';
import { ProfileSummaryCard } from '@/domain/profile/components/ProfileSummaryCard';
import { useProfile } from '@/domain/profile/hooks/useProfile';
import { useRequestCount } from '@/domain/requests/hooks/useRequests';
import { useAppDispatch } from '@/store/hooks';
import { formatNumericDate, parseIsoDate } from '@/utils/dateFormat';
import { confirm } from '@/utils/confirm';
import { callPhone, sendEmail } from '@/utils/linking';

const CONTENT_MAX_WIDTH = 720;

const formatIsoDate = (value: string) => formatNumericDate(parseIsoDate(value));

export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const tabBarSpace = useTabBarSpace();
  const profile = useProfile();
  const { contact, license, agency } = profile;
  const waitingRequests = useRequestCount('waiting');
  const changePasswordSheet = useRef<BottomSheetModal>(null);

  const editProfile = () => router.push('/edit-profile');
  const openSettings = () => router.push('/profile/settings');
  const signOut = async () => {
    const confirmed = await confirm({
      title: 'Sign out?',
      confirmLabel: 'Sign out',
      destructive: true,
    });
    if (confirmed) dispatch(lockSession());
  };
  // Patient requests lives in the Home stack; the anchor keeps Home underneath for Back.
  const openRequests = () => router.push('/patient-requests', { withAnchor: true });

  return (
    <ThemedView type="backgroundScreen" style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.container}>
        <View style={styles.header}>
          <ProfileHeader onEditPress={editProfile} onSettingsPress={openSettings} />
        </View>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: tabBarSpace }]}
          showsVerticalScrollIndicator={false}>
          <ProfileSummaryCard profile={profile} />

          <View style={styles.section}>
            <SectionHeader title="Professional" />
            <ProfileCard padded>
              <DetailRow label="Discipline">
                {`${profile.discipline.code} · ${profile.discipline.label}`}
              </DetailRow>
              <DetailRow label="Credentials">{profile.credentials}</DetailRow>
              <DetailRow label="NPI">{profile.npi}</DetailRow>
              <DetailRow label="License">
                <ThemedText style={detailValueTextStyle}>
                  {license.state} {license.number}
                </ThemedText>
                <ThemedText themeColor="textSecondary" style={detailValueTextStyle}>
                  Expires {formatIsoDate(license.expiresOn)}
                </ThemedText>
              </DetailRow>
              <DetailRow label="Supervisor">
                {profile.supervisor ?? 'None · independent therapist'}
              </DetailRow>
              <DetailRow label="With agency" isLast>
                {`Since ${formatIsoDate(profile.agencyStartDate)}`}
              </DetailRow>
            </ProfileCard>
          </View>

          <View style={styles.section}>
            <SectionHeader title="Contact" actionLabel="Edit" onActionPress={editProfile} />
            <ProfileCard padded>
              <DetailRow label="Phone">
                <ContactLink
                  value={contact.phone}
                  hint="Calls this number"
                  onPress={() => callPhone(contact.phone)}
                />
              </DetailRow>
              <DetailRow label="Email">
                <ContactLink
                  value={contact.email}
                  hint="Opens your email app"
                  onPress={() => sendEmail(contact.email)}
                />
              </DetailRow>
              <DetailRow label="Home address" isLast>
                <ThemedText style={detailValueTextStyle}>{contact.homeAddress}</ThemedText>
                <ThemedText themeColor="textSecondary" style={detailValueTextStyle}>
                  Used for offering you patients nearby
                </ThemedText>
              </DetailRow>
            </ProfileCard>
          </View>

          <View style={styles.section}>
            <SectionHeader title="My work" />
            <ProfileCard>
              <MenuRow
                icon={{ ios: 'person', android: 'person' }}
                tone="blue"
                title="Patient requests"
                subtitle={`${waitingRequests} waiting for you`}
                onPress={openRequests}
              />
              <MenuRow
                icon={{ ios: 'clock', android: 'schedule' }}
                tone="amber"
                title="My logs"
                subtitle="Activity and visit / time log"
                onPress={() => router.push('/profile/logs')}
              />
            </ProfileCard>
          </View>

          <View style={styles.section}>
            <SectionHeader title="Agency" />
            <ProfileCard>
              <MenuRow
                icon={{ ios: 'square.grid.2x2', android: 'grid_view' }}
                tone="blue"
                title={agency.name}
                subtitle={`Office ${agency.officePhone}`}
                chevron={false}
                divider
                onPress={() => callPhone(agency.officePhone)}
              />
              <MenuRow
                icon={{ ios: 'lock', android: 'lock' }}
                tone="amber"
                title="Change password"
                subtitle="Current, then the new one twice"
                onPress={() => changePasswordSheet.current?.present()}
              />
              <MenuRow
                icon={{ ios: 'gearshape', android: 'settings' }}
                tone="teal"
                title="Settings"
                subtitle="Availability, notifications, mileage"
                onPress={openSettings}
              />
              <MenuRow
                icon={{
                  ios: 'rectangle.portrait.and.arrow.right',
                  android: 'logout',
                }}
                tone="purple"
                title="Sign out"
                titleColor="toneRedFg"
                chevron={false}
                onPress={signOut}
              />
            </ProfileCard>
          </View>
        </ScrollView>
      </SafeAreaView>
      <ChangePasswordSheet ref={changePasswordSheet} />
    </ThemedView>
  );
}

type ContactLinkProps = {
  value: string;
  hint: string;
  onPress: () => void;
};

function ContactLink({ value, hint, onPress }: ContactLinkProps) {
  return (
    <Pressable accessibilityRole="link" accessibilityHint={hint} onPress={onPress}>
      <ThemedText themeColor="primary" style={[detailValueTextStyle, styles.link]}>
        {value}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
  },
  content: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    gap: Spacing.four,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
  },
  section: {
    gap: Spacing.three - Spacing.one,
  },
  link: {
    textDecorationLine: 'underline',
  },
});
