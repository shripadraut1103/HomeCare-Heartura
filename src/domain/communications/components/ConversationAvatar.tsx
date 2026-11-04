import { Avatar } from '@/components/ui/Avatar';
import { IconCircle } from '@/components/ui/IconCircle';
import type { Conversation } from '@/domain/communications/interfaces/CommunicationInterfaces';

type ConversationAvatarProps = {
  conversation: Pick<Conversation, 'kind' | 'title' | 'avatarName' | 'roles'>;
  size?: number;
};

export function ConversationAvatar({ conversation, size = 56 }: ConversationAvatarProps) {
  if (conversation.kind === 'group') {
    return (
      <IconCircle
        icon={{ ios: 'person.2', android: 'group' }}
        color="primary"
        backgroundColor="toneBlueBg"
        size={size}
      />
    );
  }
  const isOffice = conversation.roles.includes('office');
  return (
    <Avatar
      name={conversation.avatarName ?? conversation.title}
      size={size}
      color={isOffice ? 'accent' : 'toneRoseFg'}
      backgroundColor={isOffice ? 'toneTealBg' : 'toneRoseBg'}
    />
  );
}
