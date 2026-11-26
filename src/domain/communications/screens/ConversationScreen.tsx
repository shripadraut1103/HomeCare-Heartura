import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { nanoid } from '@reduxjs/toolkit';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type FlatList,
  type ListRenderItem,
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import Animated, { FadeIn, FadeInDown, FadeOut, LinearTransition } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Button } from '@/components/ui/Button';
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
import { senderOf } from '@/domain/communications/communicationMapper';
import { buildChatItems, type ChatItem } from '@/domain/communications/conversationList';
import { useConversation } from '@/domain/communications/hooks/useCommunications';
import type {
  Attachment,
  CareRole,
  Message,
} from '@/domain/communications/interfaces/CommunicationInterfaces';
import {
  deleteMessageAction,
  sendMessageAction,
} from '@/domain/communications/store/async-actions/CommunicationAsyncActions';
import { toggleMessageSaved } from '@/domain/communications/store/CommunicationsReducer';
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
  const thread = useConversation(id);
  const { conversation, messages, members } = thread;
  const listRef = useRef<FlatList<ChatItem>>(null);
  const deleteSheet = useRef<BottomSheetModal<DeleteMessageSheetData>>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [viewing, setViewing] = useState<Attachment | null>(null);

  const items = buildChatItems(messages);
  const dismiss = () => setActiveId(null);
  const roles: CareRole[] =
    conversation?.kind === 'group'
      ? [...new Set((members ?? []).flatMap((member) => (member.role ? [member.role] : [])))]
      : (conversation?.roles ?? []);

  const send = async (body: string) => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
    const result = await dispatch(
      sendMessageAction({
        conversationId: id,
        body,
        tempId: `pending-${nanoid()}`,
        sentAt: new Date().toISOString(),
      })
    );
    const payload = sendMessageAction.fulfilled.match(result) ? result.payload : null;
    if (payload && !('error' in payload)) return true;
    haptics.error();
    notice(payload?.error || 'Couldn’t send your message. Try again.', 'error');
    return false;
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

  const remove = async (messageId: string) => {
    haptics.tap();
    const result = await dispatch(deleteMessageAction({ messageId, conversationId: id }));
    const payload = deleteMessageAction.fulfilled.match(result) ? result.payload : null;
    if (!payload || 'error' in payload) {
      haptics.error();
      notice(payload?.error || 'Couldn’t delete that message. Try again.', 'error');
      return;
    }
    notice('Message deleted');
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
          sender={senderOf(item.message, members)}
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
                  {roles.map((role) => (
                    <RolePill key={role} role={role} />
                  ))}
                  {conversation.kind === 'group' ? (
                    <ThemedText themeColor="textSecondary" style={styles.members}>
                      {conversation.memberCount} members
                    </ThemedText>
                  ) : null}
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
        {thread.loading ? (
          <View style={[styles.container, styles.content]}>
            <ActivityIndicator accessibilityLabel="Loading messages" />
          </View>
        ) : thread.error ? (
          <View style={[styles.container, styles.content, styles.state]}>
            <EmptyState message={thread.error} />
            <Button title="Try again" variant="secondary" size="small" onPress={thread.retry} />
          </View>
        ) : !conversation ? (
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
            onEndReached={thread.hasMore ? thread.loadOlder : undefined}
            onEndReachedThreshold={0.3}
            ListFooterComponent={
              thread.loadingOlder ? <ActivityIndicator style={styles.older} /> : undefined
            }
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.content}
            style={styles.container}
          />
        )}
        {conversation ? (
          <MessageComposer
            onSend={send}
            onFocus={dismiss}
            onNotice={notice}
            allowAttachments={false}
          />
        ) : null}
      </KeyboardAvoidingView>

      <DeleteMessageSheet ref={deleteSheet} onDelete={(messageId) => void remove(messageId)} />
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
    alignItems: 'center',
    gap: Spacing.one + Spacing.half,
  },
  members: {
    fontSize: 14,
    lineHeight: 20,
  },
  state: {
    alignItems: 'center',
    gap: Spacing.three,
  },
  older: {
    paddingVertical: Spacing.three,
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
