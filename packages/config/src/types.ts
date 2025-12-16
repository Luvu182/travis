export type Platform = 'telegram' | 'lark';
export type InfoType = 'task' | 'decision' | 'deadline' | 'important' | 'general';

export interface MessageContext {
  platform: Platform;
  platformMessageId: string;
  userId: string;
  groupId: string;
  content: string;
  senderName: string;
  groupName: string;
  replyToMessageId?: string;
  threadId?: string;
}
