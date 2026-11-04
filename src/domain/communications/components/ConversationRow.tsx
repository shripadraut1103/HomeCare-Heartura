import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { CountBadge } from '@/components/ui/CountBadge';
import { Pill } from '@/components/ui/Pill';
import { Spacing } from '@/constants/Theme';
import { ConversationAvatar } from '@/domain/communications/components/ConversationAvatar';
import { formatConversationTime } from '@/domain/communications/conversationList';
import type { ConversationPreview } from '@/domain/communications/interfaces/CommunicationInterfaces';
import { useTheme } from '@/hooks/useTheme';

type ConversationRowProps = {
  preview: ConversationPreview;
  previewText: string;
  onPress: (preview: ConversationPreview) => void;
};

export function ConversationRow({ preview, previewText, onPress }: ConversationRowProps) {
  const theme = useTheme();
  const unread = preview.unreadCount > 0;
  const time = preview.lastMessage ? formatConversationTime(preview.lastMessage.sentAt) : null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={[
        preview.title,
        preview.kind === 'group' ? 'group' : null,
        unread ? `${preview.unreadCount} unread` : null,
        previewText,
        time,
      ]
        .filter(Boolean)
        .join(', ')}
      onPress={() => onPress(preview)}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: theme.surfaceMuted }]}>
      <ConversationAvatar conversation={preview} />
      <View style={styles.body}>
        <View style={styles.line}>
          <View style={styles.titleGroup}>
            <ThemedText
              numberOfLines={1}
              style={[styles.title, preview.lastMessage && styles.titleStrong]}>
              {preview.title}
            </ThemedText>
            {preview.kind === 'group' ? (
              <Pill label="Group" color="primary" backgroundColor="toneBlueBg" />
            ) : null}
            {preview.auto ? <Pill label="Auto" /> : null}
          </View>
          {time ? (
            <ThemedText themeColor={unread ? 'primary' : 'textSecondary'} style={styles.time}>
              {time}
            </ThemedText>
          ) : null}
        </View>
        <View style={styles.line}>
          <ThemedText
            numberOfLines={1}
            themeColor={preview.lastMessage ? 'text' : 'textSecondary'}
            style={styles.preview}>
            {previewText}
          </ThemedText>
          <CountBadge count={preview.unreadCount} style={styles.badge} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three - Spacing.one,
  },
  body: {
    flex: 1,
    gap: Spacing.one,
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  titleGroup: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  title: {
    flexShrink: 1,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: 500,
  },
  titleStrong: {
    fontWeight: 600,
  },
  time: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 500,
  },
  preview: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: 400,
  },
  badge: {
    borderWidth: 0,
  },
});
