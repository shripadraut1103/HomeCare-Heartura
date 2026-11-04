import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  GestureDetector,
  useCompetingGestures,
  useLongPressGesture,
  useTapGesture,
} from 'react-native-gesture-handler';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  ZoomIn,
  ZoomOut,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { ThemedText } from '@/components/ThemedText';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Radius, Shadows, Spacing, type ThemeColor } from '@/constants/Theme';
import { CARE_ROLE } from '@/domain/communications/careRoles';
import { MessageAttachments } from '@/domain/communications/components/MessageAttachments';
import { RolePill } from '@/domain/communications/components/RolePill';
import type {
  Attachment,
  Message,
  Participant,
} from '@/domain/communications/interfaces/CommunicationInterfaces';
import { useTheme } from '@/hooks/useTheme';
import { formatTime } from '@/utils/dateFormat';
import { haptics } from '@/utils/haptics';

const ACTION_SIZE = 44;
const TOOLBAR_PADDING = Spacing.one;
const TOOLBAR_INSET = Spacing.three;
const SAVED_BAR_WIDTH = 3;
const HOLD_DURATION = 300;
const HOLD_SCALE = 0.96;
const SELECTED_SCALE = 1.03;
const HOLD_DIM = 0.06;
const SELECTED_DIM = 0.09;
const FADED_OPACITY = 0.5;
const POP_TIMING = { duration: 160, easing: Easing.out(Easing.cubic) };
const FADE_DURATION = 180;

type MessageAction = 'save' | 'copy' | 'delete';

type MessageBubbleProps = {
  message: Message;
  sender: Participant | undefined;
  showSender: boolean;
  active: boolean;
  faded: boolean;
  onActivate: (message: Message) => void;
  onDismiss: () => void;
  onAction: (action: MessageAction, message: Message) => void;
  onOpenAttachment: (attachment: Attachment) => void;
};

export function MessageBubble({
  message,
  sender,
  showSender,
  active,
  faded,
  onActivate,
  onDismiss,
  onAction,
  onOpenAttachment,
}: MessageBubbleProps) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);
  const mine = message.senderId === null;
  const attachments = message.attachments ?? [];
  const hasText = message.body.length > 0;
  const toolbarWidth = ACTION_SIZE * (hasText ? 3 : 2) + TOOLBAR_PADDING * 2;
  const background: ThemeColor = mine
    ? 'primaryMuted'
    : sender
      ? CARE_ROLE[sender.role].bubble
      : 'backgroundElement';

  const scale = useSharedValue(1);
  const dim = useSharedValue(0);
  const opacity = useSharedValue(1);
  const selected = useSharedValue(active);

  useEffect(() => {
    selected.set(active);
    scale.set(withTiming(active ? SELECTED_SCALE : 1, POP_TIMING));
    dim.set(withTiming(active ? SELECTED_DIM : 0, { duration: FADE_DURATION }));
  }, [active, selected, scale, dim]);

  useEffect(() => {
    opacity.set(withTiming(faded ? FADED_OPACITY : 1, { duration: FADE_DURATION }));
  }, [faded, opacity]);

  const select = () => {
    haptics.tap();
    onActivate(message);
  };

  const hold = useLongPressGesture({
    minDuration: HOLD_DURATION,
    onBegin: () => {
      'worklet';
      if (selected.get()) return;
      scale.set(withTiming(HOLD_SCALE, { duration: HOLD_DURATION }));
      dim.set(withTiming(HOLD_DIM, { duration: HOLD_DURATION }));
    },
    onActivate: () => {
      'worklet';
      scale.set(withTiming(SELECTED_SCALE, POP_TIMING));
      dim.set(withTiming(SELECTED_DIM, { duration: FADE_DURATION }));
      scheduleOnRN(select);
    },
    onFinalize: (event) => {
      'worklet';
      if (!event.canceled || selected.get()) return;
      scale.set(withTiming(1, POP_TIMING));
      dim.set(withTiming(0, { duration: FADE_DURATION }));
    },
  });
  const tap = useTapGesture({ runOnJS: true, onActivate: () => onDismiss() });
  const gesture = useCompetingGestures(hold, tap);

  const rowStyle = useAnimatedStyle(() => ({ opacity: opacity.get() }));
  const bubbleStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
  const dimStyle = useAnimatedStyle(() => ({ opacity: dim.get() }));

  const toolbarPosition = mine
    ? { right: TOOLBAR_INSET }
    : { left: Math.max(0, width - toolbarWidth - TOOLBAR_INSET) };

  return (
    <Animated.View style={[styles.row, mine ? styles.mine : styles.theirs, rowStyle]}>
      <GestureDetector gesture={gesture}>
        <Animated.View
          accessible
          accessibilityHint={
            hasText ? 'Long press for save, copy and delete' : 'Long press for save and delete'
          }
          accessibilityActions={[
            { name: 'save', label: message.saved ? 'Remove from saved' : 'Save' },
            ...(hasText ? [{ name: 'copy', label: 'Copy' }] : []),
            { name: 'delete', label: 'Delete' },
          ]}
          onAccessibilityAction={({ nativeEvent }) =>
            onAction(nativeEvent.actionName as MessageAction, message)
          }
          onLayout={({ nativeEvent }) => setWidth(nativeEvent.layout.width)}
          style={[
            styles.bubble,
            { backgroundColor: theme[background], borderColor: theme.border },
            message.saved && [styles.saved, { borderLeftColor: theme.primary }],
            active && [styles.selected, { borderColor: theme.primary }],
            bubbleStyle,
          ]}>
          <Animated.View
            pointerEvents="none"
            style={[styles.dim, { backgroundColor: theme.text }, dimStyle]}
          />
          {showSender && sender ? (
            <View style={styles.sender}>
              <ThemedText numberOfLines={1} style={styles.senderName}>
                {sender.name}
              </ThemedText>
              <RolePill role={sender.role} />
            </View>
          ) : null}
          {attachments.length > 0 ? (
            <MessageAttachments attachments={attachments} blocks={tap} onOpen={onOpenAttachment} />
          ) : null}
          {hasText ? <ThemedText style={styles.body}>{message.body}</ThemedText> : null}
          <View style={styles.meta}>
            {message.saved ? (
              <Icon
                name={{ ios: 'bookmark.fill', android: 'bookmark' }}
                size={12}
                color={theme.primary}
              />
            ) : null}
            <ThemedText themeColor="textSecondary" style={styles.time}>
              {formatTime(new Date(message.sentAt))}
            </ThemedText>
          </View>
        </Animated.View>
      </GestureDetector>

      {active ? (
        <Animated.View
          entering={ZoomIn.duration(160).easing(Easing.out(Easing.cubic))}
          exiting={ZoomOut.duration(120)}
          style={[
            styles.toolbar,
            toolbarPosition,
            { backgroundColor: theme.background, borderColor: theme.border },
          ]}>
          <ToolbarAction
            icon={
              message.saved
                ? { ios: 'bookmark.fill', android: 'bookmark' }
                : { ios: 'bookmark', android: 'bookmark_border' }
            }
            label={message.saved ? 'Remove from saved' : 'Save'}
            color={message.saved ? 'primary' : 'text'}
            onPress={() => onAction('save', message)}
          />
          {hasText ? (
            <ToolbarAction
              icon={{ ios: 'doc.on.doc', android: 'content_copy' }}
              label="Copy"
              color="text"
              onPress={() => onAction('copy', message)}
            />
          ) : null}
          <ToolbarAction
            icon={{ ios: 'trash', android: 'delete' }}
            label="Delete"
            color="error"
            onPress={() => onAction('delete', message)}
          />
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

type ToolbarActionProps = {
  icon: IconName;
  label: string;
  color: ThemeColor;
  onPress: () => void;
};

function ToolbarAction({ icon, label, color, onPress }: ToolbarActionProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => {
        haptics.selection();
        onPress();
      }}
      style={({ pressed }) => [styles.action, pressed && { backgroundColor: theme.surfaceMuted }]}>
      <Icon name={icon} size={20} color={theme[color]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    maxWidth: '78%',
  },
  mine: {
    alignSelf: 'flex-end',
  },
  theirs: {
    alignSelf: 'flex-start',
  },
  bubble: {
    gap: Spacing.one,
    paddingHorizontal: Spacing.three + Spacing.one,
    paddingTop: Spacing.three - Spacing.one,
    paddingBottom: Spacing.two,
    borderRadius: Radius.large,
    borderWidth: 1,
    overflow: 'hidden',
  },
  saved: {
    borderLeftWidth: SAVED_BAR_WIDTH,
  },
  selected: {
    ...Shadows.raised,
  },
  dim: {
    ...StyleSheet.absoluteFill,
  },
  sender: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  senderName: {
    flexShrink: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 600,
  },
  body: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: 400,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: Spacing.one,
  },
  time: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: 400,
    fontVariant: ['tabular-nums'],
  },
  toolbar: {
    position: 'absolute',
    top: -ACTION_SIZE * 0.7,
    flexDirection: 'row',
    padding: TOOLBAR_PADDING,
    borderRadius: Radius.medium,
    borderWidth: 1,
    ...Shadows.raised,
  },
  action: {
    width: ACTION_SIZE,
    height: ACTION_SIZE,
    borderRadius: Radius.small,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
