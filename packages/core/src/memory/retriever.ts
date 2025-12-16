import { searchMemories, type MemoryItem } from './mem0-client.js';

/**
 * Search for relevant memories
 * Returns array of memory objects with id, memory text, and metadata
 */
export async function searchRelevantMemories(params: {
  userId: string;
  groupId: string;
  query: string;
  limit?: number;
}): Promise<MemoryItem[]> {
  return await searchMemories(params);
}

/**
 * Format memories into a single string for system prompt
 */
export function formatMemoriesForPrompt(memories: MemoryItem[]): string {
  if (memories.length === 0) {
    return 'Không có thông tin liên quan được lưu trữ.';
  }

  return memories.map((m, idx) => `${idx + 1}. ${m.memory}`).join('\n');
}
