import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { Radius, Shadows, Spacing } from '@/constants/Theme';
import { PatientStatusPill } from '@/domain/patients/components/PatientStatusPill';
import type { Patient } from '@/domain/patients/interfaces/PatientInterfaces';
import { avatarTone, locationLabel, patientSummary } from '@/domain/patients/patientList';
import { useTheme } from '@/hooks/useTheme';

type PatientCardProps = {
  patient: Patient;
  onPress: (patient: Patient) => void;
};

export function PatientCard({ patient, onPress }: PatientCardProps) {
  const theme = useTheme();
  const tone = avatarTone(patient.name);
  const summary = patientSummary(patient);
  const location = locationLabel(patient.serviceLocation);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${patient.name}, ${patient.status}, ${summary}, ${location}`}
      onPress={() => onPress(patient)}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.background, borderColor: theme.border },
        pressed && { borderColor: theme.primary },
      ]}>
      <View style={styles.top}>
        <Avatar
          name={patient.name}
          size={56}
          color={tone.color}
          backgroundColor={tone.background}
        />
        <View style={styles.text}>
          <View style={styles.nameRow}>
            <ThemedText numberOfLines={1} style={styles.name}>
              {patient.name}
            </ThemedText>
            <PatientStatusPill status={patient.status} />
          </View>
          <ThemedText themeColor="textSecondary" numberOfLines={1} style={styles.summary}>
            {summary}
          </ThemedText>
        </View>
        <Icon
          name={{ ios: 'chevron.right', android: 'chevron_right' }}
          size={18}
          color={theme.textSecondary}
        />
      </View>
      <View style={styles.dashClip}>
        <View style={[styles.dash, { borderColor: theme.border }]} />
      </View>
      <View style={styles.footer}>
        <Icon
          name={{ ios: 'mappin.circle', android: 'location_on' }}
          size={18}
          color={theme.accent}
        />
        <ThemedText themeColor="textSecondary" style={styles.location}>
          {location}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.large,
    borderWidth: 2,
    ...Shadows.card,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
  },
  text: {
    flex: 1,
    gap: Spacing.half,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  name: {
    flexShrink: 1,
    fontSize: 19,
    lineHeight: 26,
    fontWeight: 600,
  },
  summary: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: 400,
  },
  dashClip: {
    height: 1,
    marginHorizontal: Spacing.three,
    overflow: 'hidden',
  },
  dash: {
    height: 2,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  location: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: 400,
  },
});
