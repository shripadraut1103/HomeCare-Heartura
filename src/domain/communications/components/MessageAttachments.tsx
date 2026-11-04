import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureDetector, useTapGesture, type TapGesture } from 'react-native-gesture-handler';

import { ThemedText } from '@/components/ThemedText';
import { IconCircle } from '@/components/ui/IconCircle';
import { Radius, Spacing } from '@/constants/Theme';
import { fileExtension, formatFileSize } from '@/domain/communications/attachments';
import type { Attachment } from '@/domain/communications/interfaces/CommunicationInterfaces';
import { useTheme } from '@/hooks/useTheme';

const SINGLE_IMAGE_WIDTH = 220;
const GRID_IMAGE_SIZE = 108;
const MIN_ASPECT = 0.75;
const MAX_ASPECT = 1.5;

type MessageAttachmentsProps = {
  attachments: Attachment[];
  blocks: TapGesture;
  onOpen: (attachment: Attachment) => void;
};

export function MessageAttachments({ attachments, blocks, onOpen }: MessageAttachmentsProps) {
  const images = attachments.filter((attachment) => attachment.kind === 'image');
  const files = attachments.filter((attachment) => attachment.kind === 'file');

  return (
    <View style={styles.container}>
      {images.length > 0 ? (
        <View style={styles.grid}>
          {images.map((image) => (
            <Tappable key={image.id} blocks={blocks} onPress={() => onOpen(image)}>
              <Image
                accessibilityLabel={`Photo ${image.name}`}
                source={{ uri: image.uri }}
                contentFit="cover"
                transition={150}
                style={[styles.image, imageSize(image, images.length)]}
              />
            </Tappable>
          ))}
        </View>
      ) : null}
      {files.map((file) => (
        <Tappable key={file.id} blocks={blocks} onPress={() => onOpen(file)}>
          <FileRow file={file} />
        </Tappable>
      ))}
    </View>
  );
}

function imageSize(image: Attachment, count: number) {
  if (count > 1) return { width: GRID_IMAGE_SIZE, height: GRID_IMAGE_SIZE };
  const aspect =
    image.width && image.height
      ? Math.min(MAX_ASPECT, Math.max(MIN_ASPECT, image.width / image.height))
      : 1;
  return { width: SINGLE_IMAGE_WIDTH, height: SINGLE_IMAGE_WIDTH / aspect };
}

function Tappable({
  blocks,
  onPress,
  children,
}: {
  blocks: TapGesture;
  onPress: () => void;
  children: ReactNode;
}) {
  const tap = useTapGesture({ runOnJS: true, block: blocks, onActivate: () => onPress() });

  return (
    <GestureDetector gesture={tap}>
      <View accessibilityRole="button">{children}</View>
    </GestureDetector>
  );
}

function FileRow({ file }: { file: Attachment }) {
  const theme = useTheme();
  const details = [fileExtension(file.name), formatFileSize(file.size)].filter(Boolean).join(' · ');

  return (
    <View style={[styles.file, { backgroundColor: theme.background, borderColor: theme.border }]}>
      <IconCircle
        icon={{ ios: 'doc.text', android: 'description' }}
        color="primary"
        backgroundColor="primaryMuted"
        size={40}
      />
      <View style={styles.fileText}>
        <ThemedText numberOfLines={1} style={styles.fileName}>
          {file.name}
        </ThemedText>
        {details ? (
          <ThemedText themeColor="textSecondary" style={styles.fileDetails}>
            {details}
          </ThemedText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
    maxWidth: GRID_IMAGE_SIZE * 2 + Spacing.one,
  },
  image: {
    borderRadius: Radius.medium,
  },
  file: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    minWidth: SINGLE_IMAGE_WIDTH,
    padding: Spacing.two,
    borderRadius: Radius.medium,
    borderWidth: 1,
  },
  fileText: {
    flex: 1,
    flexShrink: 1,
  },
  fileName: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: 600,
  },
  fileDetails: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: 400,
  },
});
