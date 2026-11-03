import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Avatar } from '@/components/ui/Avatar';
import { Spacing, type ThemeColor } from '@/constants/Theme';
import { useTheme } from '@/hooks/useTheme';

type NotePatientCardProps = {
  patientName: string;
  details: string;
  meta?: string;
  avatarColor?: ThemeColor;
  avatarBackground?: ThemeColor;
  trailing?: ReactNode;
};

export function NotePatientCard({
  patientName,
  details,
  meta,
  avatarColor,
  avatarBackground,
  trailing,
}: NotePatientCardProps) {
  const theme = useTheme();

  return (
    <View style={[styles.banner, { backgroundColor: theme.background, borderColor: theme.border }]}>
      <Avatar name={patientName} color={avatarColor} backgroundColor={avatarBackground} />
      <View style={styles.body}>
        <ThemedText numberOfLines={1} style={styles.name}>
          {patientName}
        </ThemedText>
        <ThemedText themeColor="textSecondary" numberOfLines={1} style={styles.details}>
          {details}
        </ThemedText>
        {meta ? (
          <ThemedText themeColor="textSecondary" numberOfLines={1} style={styles.meta}>
            {meta}
          </ThemedText>
        ) : null}
      </View>
      {trailing}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three - Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three - Spacing.one,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  body: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: 600,
  },
  details: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: 400,
  },
  meta: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: 400,
  },
});
