import { addMemory } from './mem0-client.js';

/**
 * Extract and store important information from message
 * Delegates to mem0 which handles extraction + embedding + deduplication + storage
 */
export async function extractAndStore(params: {
  userId: string;
  groupId: string;
  message: string;
  senderName?: string;
  groupName?: string;
}): Promise<void> {
  const { userId, groupId, message, senderName, groupName } = params;

  // Mem0 will automatically:
  // 1. Extract important facts using its LLM (Gemini 2.5-flash-lite)
  // 2. Generate embeddings (embedding-001)
  // 3. Deduplicate against existing memories
  // 4. Store in PostgreSQL with pgvector
  await addMemory({
    userId,
    groupId,
    message,
    senderName,
    groupName,
  });
}
