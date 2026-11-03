import type { StyleProp, ViewStyle } from 'react-native';

import { Pill } from '@/components/ui/Pill';
import type { NoteStatusStyle } from '@/domain/notes/noteStyles';

export function NoteStatusPill({
  status,
  style,
}: {
  status: NoteStatusStyle;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pill
      label={status.label}
      color={status.color}
      backgroundColor={status.background}
      dot
      dotColor={status.dot}
      style={style}
    />
  );
}
