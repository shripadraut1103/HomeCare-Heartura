import {
  BottomSheetFlatList,
  useBottomSheetModal,
  type BottomSheetModal,
} from '@gorhom/bottom-sheet';
import { useEffect, useState, type Ref } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
  type ListRenderItem,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppBottomSheet } from '@/components/sheet/AppBottomSheet';
import { SheetHeader } from '@/components/sheet/SheetHeader';
import { ThemedText } from '@/components/ThemedText';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { SearchField } from '@/components/ui/SearchField';
import { Spacing } from '@/constants/Theme';
import { RolePill } from '@/domain/communications/components/RolePill';
import { useDirectory } from '@/domain/communications/hooks/useCommunications';
import type { DirectoryContact } from '@/domain/communications/interfaces/CommunicationInterfaces';
import { useTheme } from '@/hooks/useTheme';

const MAX_HEIGHT_RATIO = 0.85;
const OFFICE_ID = 'office';
const STICKY_HEADER = [0];

export type NewConversationTarget = { office: true } | { providerId: string };

type NewConversationSheetProps = {
  ref: Ref<BottomSheetModal>;
  onPick: (target: NewConversationTarget) => Promise<boolean>;
};

export function NewConversationSheet({ ref, onPick }: NewConversationSheetProps) {
  const { height } = useWindowDimensions();

  return (
    <AppBottomSheet
      ref={ref}
      maxDynamicContentSize={height * MAX_HEIGHT_RATIO}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize">
      {() => <NewConversationContent onPick={onPick} />}
    </AppBottomSheet>
  );
}

function NewConversationContent({ onPick }: Pick<NewConversationSheetProps, 'onPick'>) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { dismiss } = useBottomSheetModal();
  const directory = useDirectory();
  const { reload } = directory;
  const [query, setQuery] = useState('');
  const [opening, setOpening] = useState<string | null>(null);

  useEffect(() => {
    reload();
  }, [reload]);

  const needle = query.trim().toLowerCase();
  const office: DirectoryContact = {
    id: OFFICE_ID,
    name: 'Office',
    role: 'office',
    discipline: '',
  };
  const contacts = [office, ...directory.contacts].filter(
    (contact) =>
      !needle ||
      contact.name.toLowerCase().includes(needle) ||
      contact.discipline.toLowerCase().includes(needle)
  );

  const pick = async (contact: DirectoryContact) => {
    if (opening) return;
    setOpening(contact.id);
    const opened = await onPick(
      contact.id === OFFICE_ID ? { office: true } : { providerId: contact.id }
    );
    setOpening(null);
    if (opened) dismiss();
  };

  const renderContact: ListRenderItem<DirectoryContact> = ({ item }) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Message ${item.name}`}
      disabled={opening !== null}
      onPress={() => void pick(item)}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: theme.surfaceMuted }]}>
      <Avatar
        name={item.id === OFFICE_ID ? 'Home Care' : item.name}
        size={44}
        color={item.id === OFFICE_ID ? 'accent' : 'toneRoseFg'}
        backgroundColor={item.id === OFFICE_ID ? 'toneTealBg' : 'toneRoseBg'}
      />
      <View style={styles.rowBody}>
        <ThemedText numberOfLines={1} style={styles.name}>
          {item.name}
        </ThemedText>
        {item.discipline ? (
          <ThemedText numberOfLines={1} themeColor="textSecondary" style={styles.meta}>
            {item.discipline}
          </ThemedText>
        ) : null}
      </View>
      {opening === item.id ? (
        <ActivityIndicator />
      ) : item.role && item.id !== OFFICE_ID ? (
        <RolePill role={item.role} />
      ) : null}
    </Pressable>
  );

  const header = (
    <View style={{ backgroundColor: theme.background }}>
      <SheetHeader title="New message" onClose={() => dismiss()} />
      <View style={styles.search}>
        <SearchField value={query} onChangeText={setQuery} placeholder="Search people" />
      </View>
    </View>
  );

  return (
    <BottomSheetFlatList
      data={contacts}
      keyExtractor={(contact: DirectoryContact) => contact.id}
      renderItem={renderContact}
      ListHeaderComponent={header}
      stickyHeaderIndices={STICKY_HEADER}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.four }}
      ListFooterComponent={
        directory.loading && !directory.loaded ? (
          <ActivityIndicator style={styles.state} />
        ) : directory.error && !directory.loaded ? (
          <View style={styles.state}>
            <ThemedText themeColor="textSecondary" style={styles.center}>
              {directory.error}
            </ThemedText>
            <Button title="Try again" variant="secondary" size="small" onPress={reload} />
          </View>
        ) : undefined
      }
    />
  );
}

const styles = StyleSheet.create({
  search: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + Spacing.half,
  },
  rowBody: {
    flex: 1,
    gap: Spacing.half,
  },
  name: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: 600,
  },
  meta: {
    fontSize: 14,
    lineHeight: 19,
  },
  state: {
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.five,
  },
  center: {
    textAlign: 'center',
  },
});
