import { router, usePreventRemove } from 'expo-router';
import { useRef } from 'react';

import { confirm } from '@/utils/confirm';

export function useUnsavedChangesGuard(isDirty: boolean, message: string) {
  const allowed = useRef(false);

  usePreventRemove(isDirty, ({ repeat }) => {
    if (allowed.current) {
      repeat();
      return;
    }
    void confirm({
      title: 'Discard changes?',
      message,
      confirmLabel: 'Discard',
      cancelLabel: 'Keep editing',
      destructive: true,
    }).then((discard) => {
      if (discard) repeat();
    });
  });

  const leave = () => {
    allowed.current = true;
    router.back();
  };

  return { leave };
}
