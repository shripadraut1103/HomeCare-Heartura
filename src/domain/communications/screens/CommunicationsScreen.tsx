import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View, type ListRenderItem } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTabBarSpace } from '@/components/AppTabs';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
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
import { filterPreviews, previewText } from '@/domain/communications/conversationList';
import {
  useCommunications,
  useConversationPreviews,
} from '@/domain/communications/hooks/useCommunications';
import type {
  ConversationPreview,
  ConversationsTab,
} from '@/domain/communications/interfaces/CommunicationInterfaces';
import { useTheme } from '@/hooks/useTheme';
import { setToastMessage } from '@/store/common-reducer/ToastReducer';
import { useAppDispatch } from '@/store/hooks';

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
  const { messages, participants } = useCommunications();
  const previews = useConversationPreviews();

  const unread = previews.reduce((total, preview) => total + preview.unreadCount, 0);
  const visible = filterPreviews(previews, messages, tab, query);

  const open = (preview: ConversationPreview) =>
    router.push({ pathname: '/conversation/[id]', params: { id: preview.id } });

  // TODO: open the new-message flow once it is designed.
  const compose = () =>
    dispatch(setToastMessage({ message: 'New messages are coming soon.', type: 'warning' }));

  const renderPreview: ListRenderItem<ConversationPreview> = ({ item, index }) => (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.background, borderColor: theme.border },
        index === 0 && styles.first,
        index === visible.length - 1 && styles.last,
      ]}>
      <ConversationRow
        preview={item}
        previewText={previewText(item, participants)}
        onPress={open}
      />
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
            {unread > 0 ? `${unread} unread` : 'All caught up'}
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
            ListEmptyComponent={
              <EmptyState
                message={
                  query.trim() ? `No messages match “${query.trim()}”.` : EMPTY_MESSAGES[tab]
                }
              />
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
});
