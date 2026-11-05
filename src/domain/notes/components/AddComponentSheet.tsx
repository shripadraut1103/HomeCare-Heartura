import { BottomSheetView, useBottomSheetModal, type BottomSheetModal } from '@gorhom/bottom-sheet';
import { useState, type Ref } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppBottomSheet } from '@/components/sheet/AppBottomSheet';
import { SheetHeader } from '@/components/sheet/SheetHeader';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Radius, Shadows, Spacing } from '@/constants/Theme';
import type { NoteComponent, NoteSection } from '@/domain/notes/interfaces/NoteInterfaces';
import { useTheme } from '@/hooks/useTheme';
import { haptics } from '@/utils/haptics';

const CHECKBOX_SIZE = 24;

export type AddComponentSheetData = { available: NoteComponent[] };

type AddComponentSheetProps = {
  ref: Ref<BottomSheetModal<AddComponentSheetData>>;
  sections: readonly NoteSection[];
  onAdd: (componentIds: string[]) => void;
  grouped?: boolean;
};

export function AddComponentSheet({ ref, ...props }: AddComponentSheetProps) {
  return (
    <AppBottomSheet<AddComponentSheetData> ref={ref}>
      {({ data }) => (data ? <ComponentList {...data} {...props} /> : null)}
    </AppBottomSheet>
  );
}

function ComponentList({
  available,
  sections,
  onAdd,
  grouped = false,
}: AddComponentSheetData & Omit<AddComponentSheetProps, 'ref'>) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { dismiss } = useBottomSheetModal();
  const [selected, setSelected] = useState<readonly string[]>([]);

  const toggle = (id: string) => {
    haptics.selection();
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const add = () => {
    onAdd([...selected]);
    dismiss();
  };

  const sectionTitle = (sectionId: string) =>
    sections.find((section) => section.id === sectionId)?.title ?? '';

  return (
    <BottomSheetView style={{ paddingBottom: insets.bottom + Spacing.three }}>
      <SheetHeader title="Add component" onClose={() => dismiss()} />
      <View style={styles.body}>
        {available.length === 0 ? (
          <ThemedText themeColor="textSecondary" style={styles.empty}>
            Every component is already in this template.
          </ThemedText>
        ) : grouped ? (
          sections
            .filter((section) => available.some((component) => component.sectionId === section.id))
            .map((section) => (
              <View key={section.id} style={styles.group}>
                <ThemedText themeColor="textSecondary" style={styles.groupTitle}>
                  {section.title}
                </ThemedText>
                <View
                  style={[
                    styles.card,
                    { backgroundColor: theme.background, borderColor: theme.border },
                  ]}>
                  {available
                    .filter((component) => component.sectionId === section.id)
                    .map((component) => (
                      <CheckRow
                        key={component.id}
                        title={component.title}
                        accessibilityLabel={`${component.title}, ${section.title}`}
                        checked={selected.includes(component.id)}
                        onToggle={() => toggle(component.id)}
                      />
                    ))}
                </View>
              </View>
            ))
        ) : (
          available.map((component) => (
            <View
              key={component.id}
              style={[
                styles.card,
                { backgroundColor: theme.background, borderColor: theme.border },
              ]}>
              <CheckRow
                title={component.title}
                subtitle={sectionTitle(component.sectionId)}
                accessibilityLabel={`${component.title}, ${sectionTitle(component.sectionId)}`}
                checked={selected.includes(component.id)}
                onToggle={() => toggle(component.id)}
              />
            </View>
          ))
        )}
      </View>
      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        <Button title="Cancel" variant="secondary" style={styles.flex} onPress={() => dismiss()} />
        <Button
          title="Add to template"
          style={styles.flex}
          disabled={selected.length === 0}
          onPress={add}
        />
      </View>
    </BottomSheetView>
  );
}

function CheckRow({
  title,
  subtitle,
  accessibilityLabel,
  checked,
  onToggle,
}: {
  title: string;
  subtitle?: string;
  accessibilityLabel: string;
  checked: boolean;
  onToggle: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={accessibilityLabel}
      onPress={onToggle}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: theme.surfaceMuted }]}>
      <View
        style={[
          styles.checkbox,
          checked
            ? { backgroundColor: theme.primary, borderColor: theme.primary }
            : { borderColor: theme.textSecondary },
        ]}>
        {checked ? (
          <Icon name={{ ios: 'checkmark', android: 'check' }} size={14} color={theme.onPrimary} />
        ) : null}
      </View>
      <View style={styles.text}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        {subtitle ? (
          <ThemedText themeColor="textSecondary" style={styles.section}>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: Spacing.three - Spacing.one,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'transparent',
  },
  group: {
    gap: Spacing.three,
  },
  groupTitle: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: 500,
  },
  card: {
    paddingVertical: Spacing.one,
    borderRadius: Radius.large,
    borderWidth: StyleSheet.hairlineWidth,
    ...Shadows.card,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three + Spacing.one,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  checkbox: {
    width: CHECKBOX_SIZE,
    height: CHECKBOX_SIZE,
    borderRadius: Radius.small / 2,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: 500,
  },
  section: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: 400,
  },
  empty: {
    textAlign: 'center',
    paddingVertical: Spacing.three,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  flex: {
    flex: 1,
  },
});
