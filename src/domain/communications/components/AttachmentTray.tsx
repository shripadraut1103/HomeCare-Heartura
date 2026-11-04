import { Image } from 'expo-image';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';
import { Icon } from '@/components/ui/Icon';
import { Radius, Spacing } from '@/constants/Theme';
import { fileExtension } from '@/domain/communications/attachments';
import type { Attachment } from '@/domain/communications/interfaces/CommunicationInterfaces';
import { useTheme } from '@/hooks/useTheme';
import { haptics } from '@/utils/haptics';

const TILE_SIZE = 64;
const FILE_TILE_WIDTH = 160;
const REMOVE_SIZE = 22;

type AttachmentTrayProps = {
  attachments: Attachment[];
  onRemove: (id: string) => void;
};

export function AttachmentTray({ attachments, onRemove }: AttachmentTrayProps) {
  const theme = useTheme();

  return (
    <Animated.View entering={FadeIn.duration(160)} exiting={FadeOut.duration(120)}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}>
        {attachments.map((attachment) => (
          <Animated.View
            key={attachment.id}
            entering={FadeIn.duration(160)}
            exiting={FadeOut.duration(120)}
            layout={LinearTransition.duration(160)}
            style={styles.tile}>
            {attachment.kind === 'image' ? (
              <Image
                accessibilityLabel={`Photo ${attachment.name}`}
                source={{ uri: attachment.uri }}
                contentFit="cover"
                style={styles.image}
              />
            ) : (
              <View
                style={[
                  styles.file,
                  { backgroundColor: theme.surfaceMuted, borderColor: theme.border },
                ]}>
                <Icon
                  name={{ ios: 'doc.text', android: 'description' }}
                  size={22}
                  color={theme.primary}
                />
                <View style={styles.fileText}>
                  <ThemedText numberOfLines={1} style={styles.fileName}>
                    {attachment.name}
                  </ThemedText>
                  <ThemedText themeColor="textSecondary" style={styles.fileType}>
                    {fileExtension(attachment.name) || 'File'}
                  </ThemedText>
                </View>
              </View>
            )}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Remove ${attachment.name}`}
              hitSlop={8}
              onPress={() => {
                haptics.selection();
                onRemove(attachment.id);
              }}
              style={[
                styles.remove,
                { backgroundColor: theme.text, borderColor: theme.background },
              ]}>
              <Icon name={{ ios: 'xmark', android: 'close' }} size={10} color={theme.background} />
            </Pressable>
          </Animated.View>
        ))}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two + REMOVE_SIZE / 2,
    paddingBottom: Spacing.one,
  },
  tile: {
    height: TILE_SIZE,
  },
  image: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: Radius.medium,
  },
  file: {
    width: FILE_TILE_WIDTH,
    height: TILE_SIZE,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.medium,
    borderWidth: 1,
  },
  fileText: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: 600,
  },
  fileType: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: 400,
  },
  remove: {
    position: 'absolute',
    top: -REMOVE_SIZE / 2 + 2,
    right: -REMOVE_SIZE / 2 + 2,
    width: REMOVE_SIZE,
    height: REMOVE_SIZE,
    borderRadius: REMOVE_SIZE / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
