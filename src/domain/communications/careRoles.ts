import type { ThemeColor } from '@/constants/Theme';
import type { CareRole } from '@/domain/communications/interfaces/CommunicationInterfaces';

export const CARE_ROLE: Record<
  CareRole,
  { label: string; color: ThemeColor; background: ThemeColor; bubble: ThemeColor }
> = {
  office: {
    label: 'Office',
    color: 'textSecondary',
    background: 'backgroundElement',
    bubble: 'backgroundElement',
  },
  pt: { label: 'PT', color: 'toneBlueFg', background: 'toneBlueBg', bubble: 'toneBlueBg' },
  pta: { label: 'PTA', color: 'success', background: 'toneTealBg', bubble: 'toneTealBg' },
  ot: { label: 'OT', color: 'tonePurpleFg', background: 'tonePurpleBg', bubble: 'tonePurpleBg' },
  cota: {
    label: 'COTA',
    color: 'tonePurpleFg',
    background: 'tonePurpleBg',
    bubble: 'tonePurpleBg',
  },
  speech: {
    label: 'Speech',
    color: 'toneAmberFg',
    background: 'toneAmberBg',
    bubble: 'toneAmberBg',
  },
  dsp: { label: 'DSP', color: 'toneRoseFg', background: 'toneRoseBg', bubble: 'toneRoseBg' },
};
