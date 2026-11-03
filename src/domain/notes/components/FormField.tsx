import { useRef, useState, type ComponentRef } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { ChipGroup } from '@/components/ui/ChipGroup';
import { DICTATION_BUTTON_SIZE, DictationButton } from '@/components/ui/DictationButton';
import { Icon } from '@/components/ui/Icon';
import { InfoNote } from '@/components/ui/InfoNote';
import { Select, type SelectOption } from '@/components/ui/Select';
import { TextField } from '@/components/ui/TextField';
import { Radius, Spacing } from '@/constants/Theme';
import { NotePatientDetails } from '@/domain/notes/components/NotePatientDetails';
import { asList, asText, type NoteForm } from '@/domain/notes/hooks/useNoteForm';
import type { NoteField, ProgressNoteDue } from '@/domain/notes/interfaces/NoteInterfaces';
import { useTheme } from '@/hooks/useTheme';

const INLINE_LABEL_WIDTH = 112;

const emptyOption = (placeholder = '—'): SelectOption<string> => ({
  value: '',
  label: placeholder,
});

const pairs = (fields: readonly NoteField[]) =>
  Array.from({ length: Math.ceil(fields.length / 2) }, (_, row) =>
    fields.slice(row * 2, row * 2 + 2)
  );

const showsRequiredMark = (field: { required?: boolean; showRequiredMark?: boolean }) =>
  field.required === true && field.showRequiredMark !== false;

type FormFieldProps = {
  field: NoteField;
  note?: ProgressNoteDue;
  form: NoteForm;
};

export function FormField({ field, note, form }: FormFieldProps) {
  const theme = useTheme();

  switch (field.type) {
    case 'patientDetails':
      return note ? <NotePatientDetails note={note} /> : null;
    case 'readOnly': {
      const stacked = field.layout === 'stacked';
      return (
        <View style={stacked ? styles.readOnlyStacked : styles.readOnly}>
          <ThemedText
            themeColor="textSecondary"
            style={[styles.label, !stacked && styles.readOnlyLabel]}>
            {field.label}
          </ThemedText>
          <ThemedText style={[styles.readOnlyValue, stacked && styles.readOnlyValueStacked]}>
            {field.value ?? asText(form.values[field.id])}
          </ThemedText>
        </View>
      );
    }
    case 'subsection':
      return <Subsection field={field} note={note} form={form} />;
    case 'repeat':
      return <RepeatField field={field} note={note} form={form} />;
    case 'divider':
      return <View style={[styles.divider, { backgroundColor: theme.border }]} />;
    case 'group':
      return (
        <View style={styles.group}>
          {field.caption ? (
            <ThemedText themeColor="textSecondary" style={styles.label}>
              {field.caption}
            </ThemedText>
          ) : null}
          {field.title ? <ThemedText style={styles.groupTitle}>{field.title}</ThemedText> : null}
          <View style={styles.stack}>
            {field.columns === 2
              ? pairs(field.fields).map((pair, row) => (
                  <View key={row} style={styles.columns}>
                    {pair.map((child, index) => (
                      <View key={index} style={styles.column}>
                        <FormField field={child} note={note} form={form} />
                      </View>
                    ))}
                    {/* Keeps a lone last field at half width, in the left column. */}
                    {pair.length === 1 ? <View style={styles.column} /> : null}
                  </View>
                ))
              : field.fields.map((child, index) => (
                  <FormField key={index} field={child} note={note} form={form} />
                ))}
          </View>
        </View>
      );
    case 'select':
      return (
        <Select
          label={field.label}
          labelStyle={styles.label}
          required={field.required}
          error={form.errorFor(field.id)}
          options={[
            emptyOption(field.placeholder),
            ...field.options.map((option) => ({ value: option, label: option })),
          ]}
          value={asText(form.values[field.id])}
          onChange={(value) => form.setValue(field.id, value)}
        />
      );
    case 'notice':
      return <InfoNote text={field.text} style={styles.notice} />;
    case 'multiSelect':
      return (
        <View style={styles.group}>
          <ThemedText themeColor="textSecondary" style={styles.label}>
            {field.label}
          </ThemedText>
          <ChipGroup
            options={field.options}
            selected={asList(form.values[field.id])}
            onToggle={(option) => form.toggleOption(field.id, option)}
          />
        </View>
      );
    case 'shortText': {
      const input = (
        <TextField
          label={field.label}
          labelStyle={styles.label}
          required={showsRequiredMark(field)}
          error={form.errorFor(field.id)}
          value={asText(form.values[field.id])}
          onChangeText={(text) => form.setValue(field.id, text)}
          placeholder={field.placeholder}
          keyboardType={field.numeric ? 'number-pad' : 'default'}
          editable={!field.locked}
          style={[
            styles.shortInput,
            field.locked && {
              backgroundColor: theme.surfaceMuted,
              borderColor: theme.surfaceMuted,
              color: theme.textSecondary,
            },
          ]}
        />
      );
      // Half width, lined up with the left column of a two-column group.
      return field.narrow ? (
        <View style={styles.columns}>
          <View style={styles.column}>{input}</View>
          <View style={styles.column} />
        </View>
      ) : (
        input
      );
    }
    case 'longText':
      return <LongTextField field={field} form={form} />;
  }
}

function LongTextField({
  field,
  form,
}: {
  field: Extract<NoteField, { type: 'longText' }>;
  form: NoteForm;
}) {
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);

  return (
    <TextField
      ref={inputRef}
      label={field.label}
      labelStyle={styles.label}
      required={showsRequiredMark(field)}
      error={form.errorFor(field.id)}
      value={asText(form.values[field.id])}
      onChangeText={(text) => form.setValue(field.id, text)}
      placeholder={field.placeholder}
      multiline
      textAlignVertical="top"
      style={styles.longInput}
      accessory={<DictationButton label={field.label} onPress={() => inputRef.current?.focus()} />}
    />
  );
}

function Subsection({
  field,
  note,
  form,
}: {
  field: Extract<NoteField, { type: 'subsection' }>;
  note?: ProgressNoteDue;
  form: NoteForm;
}) {
  const theme = useTheme();
  const [open, setOpen] = useState(true);

  return (
    <View style={styles.group}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((current) => !current)}
        style={styles.subsectionHeader}>
        <ThemedText themeColor="textSecondary" style={styles.subsectionTitle}>
          {field.title}
          {field.required ? <ThemedText themeColor="error">{'  *'}</ThemedText> : null}
        </ThemedText>
        <Icon
          name={
            open
              ? { ios: 'chevron.down', android: 'keyboard_arrow_down' }
              : { ios: 'chevron.right', android: 'chevron_right' }
          }
          size={16}
          color={theme.textSecondary}
        />
      </Pressable>
      {open ? (
        <View style={styles.stack}>
          {field.fields.map((child, index) => (
            <FormField key={index} field={child} note={note} form={form} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

/** Gives a repeated block's fields their own ids, e.g. `eval.balance.extra.k1.position`. */
function scopeField(field: NoteField, prefix: string): NoteField {
  if (field.type === 'group' || field.type === 'subsection')
    return { ...field, fields: field.fields.map((child) => scopeField(child, prefix)) };
  return 'id' in field ? { ...field, id: `${prefix}${field.id}` } : field;
}

const newBlockKey = () => Date.now().toString(36);

function RepeatField({
  field,
  note,
  form,
}: {
  field: Extract<NoteField, { type: 'repeat' }>;
  note?: ProgressNoteDue;
  form: NoteForm;
}) {
  const theme = useTheme();
  const keys = asList(form.values[field.id]);
  const canAdd = field.max === undefined || keys.length < field.max;
  const add = () => form.setValue(field.id, [...keys, newBlockKey()]);
  const plus = { ios: 'plus', android: 'add' } as const;

  return (
    <View style={styles.stack}>
      {keys.map((key, position) => {
        const remove = () =>
          form.setValue(
            field.id,
            keys.filter((item) => item !== key)
          );
        const fields = field.fields.map((child, index) => (
          <FormField
            key={index}
            field={scopeField(child, `${field.id}.${key}.`)}
            note={note}
            form={form}
          />
        ));

        return field.blockTitle ? (
          <View key={key} style={[styles.blockCard, { borderColor: theme.border }]}>
            <View style={styles.blockHeader}>
              <ThemedText themeColor="textSecondary" style={styles.subsectionTitle}>
                {field.blockTitle} {position + 1}
              </ThemedText>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${field.removeLabel} ${position + 1}`}
                hitSlop={8}
                onPress={remove}>
                <Icon name={{ ios: 'trash', android: 'delete' }} size={20} color={theme.text} />
              </Pressable>
            </View>
            {fields}
          </View>
        ) : (
          <View key={key} style={styles.stack}>
            {fields}
            <Button
              variant="link"
              title={field.removeLabel}
              color="error"
              style={styles.linkButton}
              onPress={remove}
              icon={
                <Icon name={{ ios: 'trash', android: 'delete' }} size={18} color={theme.error} />
              }
            />
          </View>
        );
      })}
      {!canAdd ? null : field.addStyle === 'dashed' ? (
        <Pressable
          accessibilityRole="button"
          onPress={add}
          style={({ pressed }) => [
            styles.dashedButton,
            { borderColor: theme.border },
            pressed && styles.pressed,
          ]}>
          <Icon name={plus} size={20} color={theme.text} />
          <ThemedText style={styles.dashedLabel}>{field.addLabel}</ThemedText>
        </Pressable>
      ) : (
        <Button
          variant="link"
          title={field.addLabel}
          color="accent"
          style={styles.linkButton}
          onPress={add}
          icon={<Icon name={plus} size={18} color={theme.accent} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: Spacing.two,
  },
  groupTitle: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: 700,
  },
  stack: {
    gap: Spacing.four,
  },
  columns: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  column: {
    flex: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  readOnly: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.three,
  },
  readOnlyLabel: {
    // Fixed so the values in a run of inline rows line up.
    width: INLINE_LABEL_WIDTH,
  },
  readOnlyStacked: {
    gap: Spacing.half,
  },
  readOnlyValueStacked: {
    fontWeight: 500,
  },
  subsectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  subsectionTitle: {
    flex: 1,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: 600,
  },
  blockCard: {
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.medium,
    borderWidth: 1,
  },
  blockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  linkButton: {
    alignSelf: 'flex-start',
  },
  dashedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three - Spacing.one,
    borderRadius: Radius.medium,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  dashedLabel: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: 600,
  },
  pressed: {
    opacity: 0.7,
  },
  readOnlyValue: {
    flex: 1,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: 400,
  },
  label: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: 500,
  },
  notice: {
    paddingVertical: Spacing.two,
  },
  shortInput: {
    minHeight: 48,
    borderRadius: Radius.medium,
  },
  longInput: {
    minHeight: 104,
    paddingTop: Spacing.three - Spacing.one,
    paddingBottom: Spacing.three - Spacing.one,
    paddingRight: DICTATION_BUTTON_SIZE + Spacing.three,
    borderRadius: Radius.medium,
  },
});
