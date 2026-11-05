import { useRef, useState, type ComponentRef } from 'react';
import { Modal, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { Easing, FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';
import {
  FLOATING_ACTION_BUTTON_SIZE,
  FloatingActionButton,
} from '@/components/ui/FloatingActionButton';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Radius, Shadows, Spacing, type ThemeColor } from '@/constants/Theme';
import { useTheme } from '@/hooks/useTheme';
import { haptics } from '@/utils/haptics';

const MENU_WIDTH = 300;
const RING_WIDTH = 3;

export type FloatingAction = {
  key: string;
  icon: IconName;
  iconColor: ThemeColor;
  title: string;
  description: string;
  onPress: () => void;
};

type FloatingActionMenuProps = {
  accessibilityLabel: string;
  actions: readonly FloatingAction[];
};

type Anchor = { x: number; y: number };

export function FloatingActionMenu({ accessibilityLabel, actions }: FloatingActionMenuProps) {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const buttonRef = useRef<ComponentRef<typeof View>>(null);
  const [anchor, setAnchor] = useState<Anchor | null>(null);

  const open = () =>
    buttonRef.current?.measureInWindow((x, y) => {
      haptics.tap();
      setAnchor({ x, y });
    });
  const close = () => setAnchor(null);
  const choose = (action: FloatingAction) => {
    close();
    haptics.selection();
    action.onPress();
  };

  return (
    <>
      <View ref={buttonRef} collapsable={false}>
        <FloatingActionButton accessibilityLabel={accessibilityLabel} onPress={open} />
      </View>
      <Modal
        visible={anchor !== null}
        transparent
        animationType="none"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={close}>
        {anchor ? (
          <Pressable accessibilityLabel="Close menu" style={styles.backdrop} onPress={close}>
            <Animated.View
              entering={ZoomIn.duration(160).easing(Easing.out(Easing.cubic))}
              exiting={FadeOut.duration(120)}
              style={[
                styles.menu,
                {
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                  right: width - anchor.x - FLOATING_ACTION_BUTTON_SIZE,
                  bottom: height - anchor.y + Spacing.three,
                },
              ]}>
              {actions.map((action) => (
                <Pressable
                  key={action.key}
                  accessibilityRole="menuitem"
                  accessibilityHint={action.description}
                  onPress={() => choose(action)}
                  style={({ pressed }) => [
                    styles.item,
                    pressed && { backgroundColor: theme.surfaceMuted },
                  ]}>
                  <Icon name={action.icon} size={22} color={theme[action.iconColor]} />
                  <View style={styles.itemText}>
                    <ThemedText style={styles.title}>{action.title}</ThemedText>
                    <ThemedText themeColor="textSecondary" style={styles.description}>
                      {action.description}
                    </ThemedText>
                  </View>
                </Pressable>
              ))}
            </Animated.View>
            <Animated.View
              entering={FadeIn.duration(120)}
              style={[
                styles.close,
                {
                  left: anchor.x - RING_WIDTH,
                  top: anchor.y - RING_WIDTH,
                  borderColor: theme.primaryMuted,
                },
              ]}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close menu"
                onPress={close}
                style={[styles.closeButton, { backgroundColor: theme.primary }]}>
                <Icon name={{ ios: 'xmark', android: 'close' }} size={22} color={theme.onPrimary} />
              </Pressable>
            </Animated.View>
          </Pressable>
        ) : null}
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  menu: {
    position: 'absolute',
    width: MENU_WIDTH,
    maxWidth: '90%',
    paddingVertical: Spacing.two,
    borderRadius: Radius.large,
    borderWidth: StyleSheet.hairlineWidth,
    transformOrigin: 'bottom right',
    ...Shadows.raised,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three + Spacing.one,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three - Spacing.one,
  },
  itemText: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: 600,
  },
  description: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: 400,
  },
  close: {
    position: 'absolute',
    padding: RING_WIDTH - 1,
    borderRadius: Radius.large + RING_WIDTH,
    borderWidth: 1,
  },
  closeButton: {
    width: FLOATING_ACTION_BUTTON_SIZE,
    height: FLOATING_ACTION_BUTTON_SIZE,
    borderRadius: Radius.large,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.floating,
  },
});
