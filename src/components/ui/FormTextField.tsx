import { Controller, type Control, type FieldPathByValue, type FieldValues } from 'react-hook-form';

import { TextField, type TextFieldProps } from '@/components/ui/TextField';

type FormTextFieldProps<T extends FieldValues> = Omit<
  TextFieldProps,
  'value' | 'onChangeText' | 'onBlur' | 'error' | 'ref'
> & {
  control: Control<T>;
  name: FieldPathByValue<T, string>;
};

/** `TextField` bound to a react-hook-form field: value, validation error and focus ref. */
export function FormTextField<T extends FieldValues>({
  control,
  name,
  ...fieldProps
}: FormTextFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <TextField
          {...fieldProps}
          ref={field.ref}
          value={field.value}
          onChangeText={field.onChange}
          onBlur={field.onBlur}
          error={fieldState.error?.message}
        />
      )}
    />
  );
}
