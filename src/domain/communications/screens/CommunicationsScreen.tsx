import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { router, useFocusEffect } from 'expo-router';
import { useRef, useState } from 'react';
import { RefreshControl, StyleSheet, View, type ListRenderItem } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTabBarSpace } from '@/components/AppTabs';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  FLOATING_ACTION_BUTTON_SIZE,
  FloatingActionButton,
} from '@/components/ui/FloatingActionButton';
import { SearchField } from '@/components/ui/SearchField';
import { SegmentedControl, type Segment } from '@/components/ui/SegmentedControl';
import { TabPanel } from '@/components/ui/TabPanel';
import { Radius, Spacing } from '@/constants/Theme';
import { ConversationRow } from '@/domain/communications/components/ConversationRow';
import {
  NewConversationSheet,
  type NewConversationTarget,
} from '@/domain/communications/components/NewConversationSheet';
import { filterPreviews, previewText } from '@/domain/communications/conversationList';
import {
  useConversationList,
  useConversationPreviews,
} from '@/domain/communications/hooks/useCommunications';
import type {
  ConversationPreview,
  ConversationsTab,
} from '@/domain/communications/interfaces/CommunicationInterfaces';
import { createConversationAction } from '@/domain/communications/store/async-actions/CommunicationAsyncActions';
import { useTheme } from '@/hooks/useTheme';
import { setToastMessage } from '@/store/common-reducer/ToastReducer';
import { useAppDispatch } from '@/store/hooks';
import { haptics } from '@/utils/haptics';

const CONTENT_MAX_WIDTH = 720;

const TABS: readonly Segment<ConversationsTab>[] = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'groups', label: 'Groups' },
];

const EMPTY_MESSAGES: Record<ConversationsTab, string> = {
  all: 'No conversations yet.',
  unread: 'You’re all caught up.',
  groups: 'You’re not in any groups yet.',
};

const keyExtractor = (preview: ConversationPreview) => preview.id;

export default function CommunicationsScreen() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const tabBarSpace = useTabBarSpace();
  const [tab, setTab] = useState<ConversationsTab>('all');
  const [query, setQuery] = useState('');
  const previews = useConversationPreviews();
  const list = useConversationList();
  const { reload } = list;
  const newSheet = useRef<BottomSheetModal>(null);
  useFocusEffect(reload);

  const unread = previews.reduce((total, preview) => total + preview.unreadCount, 0);
  const visible = filterPreviews(previews, tab, query);

  const open = (preview: ConversationPreview) =>
    router.push({ pathname: '/conversation/[id]', params: { id: preview.id } });

  const compose = () => newSheet.current?.present();

  const startConversation = async (target: NewConversationTarget) => {
    const result = await dispatch(
      createConversationAction('office' in target ? { office: true } : target)
    );
    const payload = createConversationAction.fulfilled.match(result) ? result.payload : null;
    if (!payload || 'error' in payload) {
      haptics.error();
      dispatch(
        setToastMessage({
          message: payload?.error || 'Couldn’t start that conversation. Try again.',
          type: 'error',
        })
      );
      return false;
    }
    router.push({ pathname: '/conversation/[id]', params: { id: payload.data.id } });
    return true;
  };

  const renderPreview: ListRenderItem<ConversationPreview> = ({ item, index }) => (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.background, borderColor: theme.border },
        index === 0 && styles.first,
        index === visible.length - 1 && styles.last,
      ]}>
      <ConversationRow preview={item} previewText={previewText(item)} onPress={open} />
    </View>
  );

  return (
    <ThemedView type="backgroundScreen" style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.container}>
        <View style={styles.header}>
          <ThemedText accessibilityRole="header" style={styles.title}>
            Communications
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>
            {!list.loaded ? ' ' : unread > 0 ? `${unread} unread` : 'All caught up'}
          </ThemedText>
        </View>

        <View style={styles.controls}>
          <SearchField value={query} onChangeText={setQuery} placeholder="Search messages" />
          <SegmentedControl segments={TABS} value={tab} onChange={setTab} />
        </View>

        <TabPanel tab={tab}>
          <Animated.FlatList
            data={visible}
            keyExtractor={keyExtractor}
            renderItem={renderPreview}
            itemLayoutAnimation={LinearTransition.duration(180)}
            refreshControl={
              <RefreshControl refreshing={list.loading && list.loaded} onRefresh={reload} />
            }
            ListEmptyComponent={
              !list.loaded && list.error ? (
                <View style={styles.state}>
                  <EmptyState message={list.error} />
                  <Button title="Try again" variant="secondary" size="small" onPress={reload} />
                </View>
              ) : !list.loaded ? (
                <EmptyState message="Loading conversations…" />
              ) : (
                <EmptyState
                  message={
                    query.trim() ? `No messages match “${query.trim()}”.` : EMPTY_MESSAGES[tab]
                  }
                />
              )
            }
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[
              styles.content,
              { paddingBottom: tabBarSpace + FLOATING_ACTION_BUTTON_SIZE },
            ]}
            showsVerticalScrollIndicator={false}
          />
        </TabPanel>
      </SafeAreaView>

      <View style={[styles.fab, { bottom: tabBarSpace - Spacing.two }]}>
        <FloatingActionButton
          icon={{ ios: 'square.and.pencil', android: 'edit' }}
          accessibilityLabel="New message"
          onPress={compose}
        />
      </View>
      <NewConversationSheet ref={newSheet} onPick={startConversation} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    gap: Spacing.half,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: 700,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: 400,
  },
  controls: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.three,
  },
  content: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: Spacing.three,
  },
  card: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    overflow: 'hidden',
  },
  first: {
    borderTopWidth: 1,
    borderTopLeftRadius: Radius.large,
    borderTopRightRadius: Radius.large,
    paddingTop: Spacing.one,
  },
  last: {
    borderBottomWidth: 1,
    borderBottomLeftRadius: Radius.large,
    borderBottomRightRadius: Radius.large,
    paddingBottom: Spacing.one,
  },
  fab: {
    position: 'absolute',
    right: Spacing.three,
  },
  state: {
    alignItems: 'center',
    gap: Spacing.three,
  },
});
