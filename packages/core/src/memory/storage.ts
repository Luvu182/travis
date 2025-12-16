import { saveMessage } from '@jarvis/db';

/**
 * Store message for audit trail only
 * Memory extraction/storage handled by mem0
 */
export async function storeMessage(params: {
  platformMessageId: string;
  groupId: string;
  userId: string;
  content: string;
  replyToMessageId?: string;
  threadId?: string;
}): Promise<void> {
  await saveMessage(params);
}
