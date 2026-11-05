import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Pill } from '@/components/ui/Pill';
import { Select } from '@/components/ui/Select';
import { TextField } from '@/components/ui/TextField';
import { Radius, Spacing } from '@/constants/Theme';
import { billingCodeId, billingUnitsId, DAILY_NOTE } from '@/domain/notes/dailyNote';
import { asList, asText, type NoteForm } from '@/domain/notes/hooks/useNoteForm';
import { useTheme } from '@/hooks/useTheme';

const MAX_CODES = 6;
const PILL_SLOT = 52;

type BillingCodesFieldsProps = {
  form: NoteForm;
  codes: readonly string[];
  authorized: boolean;
};

const newKey = () => Date.now().toString(36);

export function BillingCodesFields({ form, codes, authorized }: BillingCodesFieldsProps) {
  const theme = useTheme();
  const keys = asList(form.values[DAILY_NOTE.billing]);
  const options = codes.map((code) => ({ value: code, label: code }));

  return (
    <View style={styles.list}>
      {keys.map((key, index) => {
        const first = index === 0;
        return (
          <View key={key} style={styles.row}>
            <View style={styles.code}>
              <Select
                label={first ? 'CPT code' : undefined}
                labelStyle={styles.label}
                placeholder="Select"
                options={options}
                value={asText(form.values[billingCodeId(key)]) || null}
                onChange={(value) => form.setValue(billingCodeId(key), value)}
              />
            </View>
            <View style={styles.units}>
              <TextField
                label="Units"
                hideLabel={!first}
                labelStyle={styles.label}
                value={asText(form.values[billingUnitsId(key)])}
                onChangeText={(text) => form.setValue(billingUnitsId(key), text)}
                keyboardType="number-pad"
                style={styles.input}
              />
            </View>
            <View style={styles.trailing}>
              {first ? (
                authorized ? (
                  <Pill label="PA" color="primary" backgroundColor="toneBlueBg" />
                ) : null
              ) : (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Remove procedure code ${index + 1}`}
                  hitSlop={8}
                  onPress={() =>
                    form.setValue(
                      DAILY_NOTE.billing,
                      keys.filter((item) => item !== key)
                    )
                  }>
                  <Icon name={{ ios: 'trash', android: 'delete' }} size={20} color={theme.text} />
                </Pressable>
              )}
            </View>
          </View>
        );
      })}
      {keys.length < MAX_CODES ? (
        <Button
          variant="link"
          title="Add procedure code"
          color="accent"
          style={styles.add}
          onPress={() => form.setValue(DAILY_NOTE.billing, [...keys, newKey()])}
          icon={<Icon name={{ ios: 'plus', android: 'add' }} size={18} color={theme.accent} />}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.three,
  },
  code: {
    flex: 2,
  },
  units: {
    flex: 1,
  },
  trailing: {
    width: PILL_SLOT,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: 500,
  },
  input: {
    minHeight: 48,
    borderRadius: Radius.medium,
  },
  add: {
    alignSelf: 'flex-start',
  },
});
