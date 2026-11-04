import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Spacing } from '@/constants/Theme';
import type { Attachment } from '@/domain/communications/interfaces/CommunicationInterfaces';

const BUTTON_SIZE = 44;
const VIEWER_BACKGROUND = '#000000';
const VIEWER_FOREGROUND = '#FFFFFF';

type ImageViewerProps = {
  image: Attachment | null;
  onClose: () => void;
  onShare: (image: Attachment) => void;
};

export function ImageViewer({ image, onClose, onShare }: ImageViewerProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={image !== null}
      animationType="fade"
      presentationStyle="overFullScreen"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}>
      <StatusBar style="light" />
      <View style={styles.container}>
        {image ? (
          <Image
            accessibilityLabel={`Photo ${image.name}`}
            source={{ uri: image.uri }}
            contentFit="contain"
            style={styles.image}
          />
        ) : null}
        <View style={[styles.bar, { paddingTop: insets.top + Spacing.two }]}>
          <ViewerButton icon={{ ios: 'xmark', android: 'close' }} label="Close" onPress={onClose} />
          <ThemedText numberOfLines={1} style={styles.name}>
            {image?.name}
          </ThemedText>
          <ViewerButton
            icon={{ ios: 'square.and.arrow.up', android: 'share' }}
            label="Share"
            onPress={() => image && onShare(image)}
          />
        </View>
      </View>
    </Modal>
  );
}

function ViewerButton({
  icon,
  label,
  onPress,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      <Icon name={icon} size={20} color={VIEWER_FOREGROUND} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: VIEWER_BACKGROUND,
  },
  image: {
    flex: 1,
  },
  bar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  name: {
    flex: 1,
    textAlign: 'center',
    color: VIEWER_FOREGROUND,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: 600,
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  pressed: {
    opacity: 0.6,
  },
});
