import type {
  Conversation,
  Message,
  Participant,
} from '@/domain/communications/interfaces/CommunicationInterfaces';

/**
 * TEMPORARY: conversations until the messaging API exists.
 * Delete this file once the communications slice loads from the service.
 */

const at = (hours: number, minutes: number, daysFromToday = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
};

export const MOCK_PARTICIPANTS: Participant[] = [
  { id: 'office', name: 'Office', role: 'office' },
  { id: 'jamie', name: 'Jamie Ortiz, PTA', role: 'pta' },
  { id: 'ines', name: 'Ines Park, OTR/L', role: 'ot' },
];

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'c-office',
    title: 'Office',
    kind: 'direct',
    avatarName: 'Home Care',
    roles: ['office'],
    unreadCount: 2,
  },
  { id: 'c-jamie', title: 'Jamie Ortiz, PTA', kind: 'direct', roles: ['pta'], unreadCount: 2 },
  {
    id: 'c-rollator',
    title: 'Daniel’s rollator',
    kind: 'group',
    roles: ['ot', 'pta'],
    unreadCount: 2,
  },
  {
    id: 'c-pt-team',
    title: 'PT team',
    kind: 'group',
    roles: ['pta', 'office'],
    auto: true,
    unreadCount: 0,
  },
];

const message = (
  id: string,
  conversationId: string,
  senderId: string | null,
  body: string,
  sentAt: string
): Message => ({ id, conversationId, senderId, body, sentAt, saved: false });

export const MOCK_MESSAGES: Message[] = [
  message(
    'm1',
    'c-office',
    'office',
    'Can you take a makeup visit for Sofia Delgado on Friday at 2 pm?',
    at(15, 0, -1)
  ),
  message('m2', 'c-office', null, 'Yes, Friday 2 pm works.', at(15, 12, -1)),
  message(
    'm3',
    'c-office',
    'office',
    'Reminder: authorization renewals for September are due by Friday.',
    at(16, 50, -1)
  ),
  message(
    'm4',
    'c-office',
    'office',
    'Booked. Maya Okafor moved to 3:00 PM today, the family asked.',
    at(7, 32)
  ),
  message(
    'm5',
    'c-office',
    'office',
    'Gina Mancuso’s guardian changed. Please call Maria Lopez before visits.',
    at(7, 58)
  ),
  message('m6', 'c-office', null, 'Got it, I’ll call her before the 10:00 visit.', at(8, 5)),
  message('m7', 'c-office', 'office', 'Thanks! Her new number is on the chart.', at(10, 7)),
  message(
    'm8',
    'c-jamie',
    'jamie',
    'I signed Hannah’s note from yesterday, it’s ready for your review.',
    at(9, 20)
  ),
  message('m9', 'c-jamie', 'jamie', 'I fixed the CPT code you flagged.', at(9, 21)),
  message(
    'm10',
    'c-rollator',
    'ines',
    'Daniel’s new rollator: can PT check the height before I start the kitchen goals?',
    at(18, 20, -1)
  ),
  message('m11', 'c-rollator', 'jamie', 'I’ll check it at Thursday’s visit.', at(18, 24, -1)),
];
