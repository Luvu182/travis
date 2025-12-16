import { db, saveExtractedInfo, saveMemory } from '@luxbot/db';
import { embedText } from './embeddings.js';
import { normalizeDueDate, type ExtractedItem } from './extractor.js';

/**
 * Store extracted information in the database with embeddings
 */
export async function storeExtractedInfo(params: {
  messageId: string;
  groupId: string;
  items: ExtractedItem[];
}): Promise<void> {
  const { messageId, groupId, items } = params;

  if (items.length === 0) {
    return;
  }

  try {
    // Process each item
    for (const item of items) {
      // Generate embedding for the content
      const embedding = await embedText(item.content);

      // Normalize due date
      const dueDate = normalizeDueDate(item.dueDate);

      // Save to database
      await saveExtractedInfo({
        messageId,
        groupId,
        infoType: item.type,
        content: item.content,
        summary: item.summary,
        embedding,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        status: 'active',
        metadata: {
          confidence: item.confidence,
          assignee: item.assignee,
        },
      });
    }
  } catch (error) {
    console.error('Failed to store extracted info:', error);
    throw new Error(`Storage failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Store a memory in the database with embedding
 */
export async function storeMemory(params: {
  groupId: string;
  userId?: string;
  content: string;
  memoryType: 'fact' | 'event' | 'preference' | 'context';
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const { groupId, userId, content, memoryType, metadata } = params;

  if (!content || content.trim().length === 0) {
    throw new Error('Cannot store empty memory');
  }

  try {
    // Generate embedding
    const embedding = await embedText(content);

    // Save to database
    await saveMemory({
      groupId,
      userId,
      content,
      memoryType,
      embedding,
      metadata: metadata || {},
    });
  } catch (error) {
    console.error('Failed to store memory:', error);
    throw new Error(`Memory storage failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Batch store extracted information for multiple messages
 */
export async function storeBatch(
  batch: Array<{
    messageId: string;
    groupId: string;
    items: ExtractedItem[];
  }>
): Promise<void> {
  if (batch.length === 0) {
    return;
  }

  try {
    // Process in sequence to avoid overwhelming the database
    for (const entry of batch) {
      await storeExtractedInfo(entry);
    }
  } catch (error) {
    console.error('Failed to store batch:', error);
    throw new Error(`Batch storage failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
