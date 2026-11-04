import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
  View,
  type FlatList,
  type ListRenderItem,
} from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut, LinearTransition } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { Radius, Spacing } from '@/constants/Theme';
import { ConversationAvatar } from '@/domain/communications/components/ConversationAvatar';
import {
  DeleteMessageSheet,
  type DeleteMessageSheetData,
} from '@/domain/communications/components/DeleteMessageSheet';
import { ImageViewer } from '@/domain/communications/components/ImageViewer';
import { MessageBubble } from '@/domain/communications/components/MessageBubble';
import { MessageComposer } from '@/domain/communications/components/MessageComposer';
import { RolePill } from '@/domain/communications/components/RolePill';
import { buildChatItems, type ChatItem } from '@/domain/communications/conversationList';
import { useConversation, useParticipants } from '@/domain/communications/hooks/useCommunications';
import type {
  Attachment,
  Message,
} from '@/domain/communications/interfaces/CommunicationInterfaces';
import {
  deleteMessage,
  markConversationRead,
  sendMessage,
  toggleMessageSaved,
} from '@/domain/communications/store/CommunicationsReducer';
import { useTheme } from '@/hooks/useTheme';
import { setToastMessage, type ToastType } from '@/store/common-reducer/ToastReducer';
import { useAppDispatch } from '@/store/hooks';
import { haptics } from '@/utils/haptics';

const CONTENT_MAX_WIDTH = 720;
const AVATAR_SIZE = 52;

const keyExtractor = (item: ChatItem) => item.key;

export default function ConversationScreen() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { conversation, messages } = useConversation(id);
  const participants = useParticipants();
  const listRef = useRef<FlatList<ChatItem>>(null);
  const deleteSheet = useRef<BottomSheetModal<DeleteMessageSheetData>>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [viewing, setViewing] = useState<Attachment | null>(null);

  const unreadCount = conversation?.unreadCount ?? 0;
  useEffect(() => {
    if (unreadCount > 0) dispatch(markConversationRead({ conversationId: id }));
  }, [dispatch, id, unreadCount]);

  const items = buildChatItems(messages);
  const dismiss = () => setActiveId(null);

  const send = (body: string, attachments: Attachment[]) => {
    // TODO: upload attachments to the messaging API and store the returned URLs instead of local URIs.
    dispatch(
      sendMessage({
        conversationId: id,
        body,
        attachments: attachments.length > 0 ? attachments : undefined,
      })
    );
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const onAction = async (action: 'save' | 'copy' | 'delete', message: Message) => {
    dismiss();
    if (action === 'save') {
      dispatch(toggleMessageSaved({ messageId: message.id }));
      dispatch(
        setToastMessage({ message: message.saved ? 'Removed from saved' : 'Message saved' })
      );
    } else if (action === 'copy') {
      await Clipboard.setStringAsync(message.body);
      haptics.success();
      dispatch(setToastMessage({ message: 'Message copied' }));
    } else {
      deleteSheet.current?.present({ messageId: message.id });
    }
  };

  const notice = (message: string, type?: ToastType) =>
    dispatch(setToastMessage({ message, type }));

  const share = async (attachment: Attachment) => {
    try {
      if (!(await Sharing.isAvailableAsync())) {
        notice('Opening files isn’t supported on this device.', 'warning');
        return;
      }
      await Sharing.shareAsync(attachment.uri, {
        mimeType: attachment.mimeType,
        dialogTitle: attachment.name,
      });
    } catch {
      notice('Couldn’t open that file.', 'error');
    }
  };

  const openAttachment = (attachment: Attachment) => {
    dismiss();
    if (attachment.kind === 'image') setViewing(attachment);
    else void share(attachment);
  };

  const remove = (messageId: string) => {
    haptics.tap();
    dispatch(deleteMessage({ messageId }));
    dispatch(setToastMessage({ message: 'Message deleted' }));
  };

  const renderItem: ListRenderItem<ChatItem> = ({ item }) =>
    item.type === 'day' ? (
      <View style={styles.dayRow}>
        <ThemedText
          themeColor="textSecondary"
          style={[styles.dayLabel, { backgroundColor: theme.surfaceMuted }]}>
          {item.label}
        </ThemedText>
      </View>
    ) : (
      <Animated.View entering={FadeInDown.duration(200)} exiting={FadeOut.duration(160)}>
        <MessageBubble
          message={item.message}
          sender={participants.find((participant) => participant.id === item.message.senderId)}
          showSender={conversation?.kind === 'group'}
          active={item.message.id === activeId}
          faded={activeId !== null && item.message.id !== activeId}
          onActivate={(message) => setActiveId(message.id)}
          onDismiss={dismiss}
          onAction={onAction}
          onOpenAttachment={openAttachment}
        />
      </Animated.View>
    );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView
        edges={['top']}
        style={[styles.header, { backgroundColor: theme.backgroundScreen }]}>
        <View style={styles.headerRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={12}
            onPress={() => router.back()}
            style={styles.back}>
            <Icon
              name={{ ios: 'chevron.left', android: 'arrow_back_ios' }}
              size={20}
              color={theme.text}
            />
          </Pressable>
          {conversation ? (
            <>
              <ConversationAvatar conversation={conversation} size={AVATAR_SIZE} />
              <View style={styles.headerText}>
                <ThemedText accessibilityRole="header" numberOfLines={1} style={styles.title}>
                  {conversation.title}
                </ThemedText>
                <View style={styles.roles}>
                  {conversation.roles.map((role) => (
                    <RolePill key={role} role={role} />
                  ))}
                </View>
              </View>
            </>
          ) : (
            <ThemedText accessibilityRole="header" style={styles.title}>
              Conversation
            </ThemedText>
          )}
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView behavior="padding" style={styles.container}>
        {!conversation ? (
          <View style={styles.content}>
            <EmptyState message="This conversation is no longer available." />
          </View>
        ) : items.length === 0 ? (
          <Animated.View entering={FadeIn.duration(180)} style={[styles.container, styles.content]}>
            <EmptyState message="No messages yet. Say hello." />
          </Animated.View>
        ) : (
          <Animated.FlatList
            ref={listRef}
            inverted
            data={items}
            extraData={activeId}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            CellRendererComponentStyle={({ item }) =>
              item.type === 'message' && item.message.id === activeId ? styles.raisedCell : null
            }
            itemLayoutAnimation={LinearTransition.duration(180)}
            skipEnteringExitingAnimations
            ItemSeparatorComponent={MessageSeparator}
            onScrollBeginDrag={dismiss}
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.content}
            style={styles.container}
          />
        )}
        {conversation ? (
          <MessageComposer onSend={send} onFocus={dismiss} onNotice={notice} />
        ) : null}
      </KeyboardAvoidingView>

      <DeleteMessageSheet ref={deleteSheet} onDelete={remove} />
      <ImageViewer image={viewing} onClose={() => setViewing(null)} onShare={share} />
    </ThemedView>
  );
}

function MessageSeparator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'transparent',
  },
  headerRow: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
  },
  back: {
    padding: Spacing.one,
  },
  headerText: {
    flex: 1,
    gap: Spacing.one,
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: 700,
  },
  roles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one + Spacing.half,
  },
  content: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.five + Spacing.two,
  },
  raisedCell: {
    zIndex: 1,
    elevation: 1,
  },
  dayRow: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  dayLabel: {
    overflow: 'hidden',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Radius.full,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 600,
  },
  separator: {
    height: Spacing.two,
  },
});
