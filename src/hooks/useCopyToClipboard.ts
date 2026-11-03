import * as Clipboard from 'expo-clipboard';
import { useEffect, useState } from 'react';

import { haptics } from '@/utils/haptics';

const COPIED_FEEDBACK_MS = 1500;

export function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async (text: string) => {
    await Clipboard.setStringAsync(text);
    haptics.success();
    setCopied(true);
  };

  return { copied, copy };
}
