import { searchByVector, searchMemories, getRecentMemories as dbGetRecentMemories } from '@luxbot/db';
import { embedText } from './embeddings.js';

export interface MemorySearchResult {
  id: string;
  type: string;
  content: string;
  summary?: string;
  dueDate?: Date;
  similarity: number;
}

/**
 * Search extracted information using semantic similarity
 * @param query Search query text
 * @param options Search options (groupId, type, limit, minSimilarity)
 * @returns Array of search results with similarity scores
 */
export async function searchExtractedInfo(
  query: string,
  options: {
    groupId?: string;
    type?: 'task' | 'decision' | 'deadline' | 'important' | 'general';
    limit?: number;
    minSimilarity?: number;
  } = {}
): Promise<MemorySearchResult[]> {
  if (!query || query.trim().length === 0) {
    throw new Error('Query cannot be empty');
  }

  const { groupId, type, limit = 10, minSimilarity = 0.5 } = options;

  try {
    // Generate query embedding
    const queryEmbedding = await embedText(query);

    // Search using pgvector
    const results = await searchByVector(queryEmbedding, {
      groupId,
      type,
      limit,
      minSimilarity,
    });

    // Map to MemorySearchResult format
    return results.map((row: any) => ({
      id: row.id,
      type: row.type,
      content: row.content,
      summary: row.summary,
      dueDate: row.dueDate ? new Date(row.dueDate) : undefined,
      similarity: parseFloat(row.similarity),
    }));
  } catch (error) {
    console.error('Failed to search extracted info:', error);
    throw new Error(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Search memories using semantic similarity
 * @param query Search query text
 * @param options Search options (groupId, limit)
 * @returns Array of search results with similarity scores
 */
export async function searchMemory(
  query: string,
  options: {
    groupId?: string;
    limit?: number;
  } = {}
): Promise<Array<{
  id: string;
  content: string;
  type: string;
  similarity: number;
}>> {
  if (!query || query.trim().length === 0) {
    throw new Error('Query cannot be empty');
  }

  const { groupId, limit = 10 } = options;

  try {
    // Generate query embedding
    const queryEmbedding = await embedText(query);

    // Search using pgvector
    const results = await searchMemories(queryEmbedding, {
      groupId,
      limit,
    });

    // Map to result format
    return results.map((row: any) => ({
      id: row.id,
      content: row.content,
      type: row.type,
      similarity: parseFloat(row.similarity),
    }));
  } catch (error) {
    console.error('Failed to search memories:', error);
    throw new Error(`Memory search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get recent extracted information for context
 * @param groupId Group ID to fetch memories from
 * @param limit Number of recent items to fetch (default: 5)
 * @returns Array of recent extracted info
 */
export async function getRecentExtractedInfo(
  groupId: string,
  limit: number = 5
): Promise<MemorySearchResult[]> {
  try {
    const results = await dbGetRecentMemories(groupId, limit);

    return results.map((row: any) => ({
      id: row.id,
      type: row.type || 'general',
      content: row.content,
      summary: undefined,
      dueDate: undefined,
      similarity: 1.0, // Perfect match for recent items
    }));
  } catch (error) {
    console.error('Failed to get recent extracted info:', error);
    throw new Error(`Failed to retrieve recent info: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Search for tasks assigned to a specific user
 * @param groupId Group ID
 * @param assignee Assignee name
 * @param options Additional search options
 * @returns Array of tasks assigned to the user
 */
export async function searchTasksByAssignee(
  groupId: string,
  assignee: string,
  options: {
    limit?: number;
    minSimilarity?: number;
  } = {}
): Promise<MemorySearchResult[]> {
  // Search for tasks mentioning the assignee
  const query = `nhiệm vụ của ${assignee}`; // Vietnamese: "tasks of {assignee}"

  return searchExtractedInfo(query, {
    groupId,
    type: 'task',
    ...options,
  });
}

/**
 * Search for upcoming deadlines
 * @param groupId Group ID
 * @param options Search options
 * @returns Array of deadline items
 */
export async function searchUpcomingDeadlines(
  groupId: string,
  options: {
    limit?: number;
    minSimilarity?: number;
  } = {}
): Promise<MemorySearchResult[]> {
  const query = 'deadline thời hạn sắp tới'; // Vietnamese: "upcoming deadline"

  return searchExtractedInfo(query, {
    groupId,
    type: 'deadline',
    ...options,
  });
}

/**
 * Multi-modal search combining multiple queries
 * @param queries Array of search queries
 * @param options Search options applied to all queries
 * @returns Combined and deduplicated results
 */
export async function multiSearch(
  queries: string[],
  options: {
    groupId?: string;
    type?: 'task' | 'decision' | 'deadline' | 'important' | 'general';
    limit?: number;
    minSimilarity?: number;
  } = {}
): Promise<MemorySearchResult[]> {
  if (queries.length === 0) {
    throw new Error('At least one query is required');
  }

  try {
    // Search for each query in parallel
    const allResults = await Promise.all(
      queries.map(query => searchExtractedInfo(query, options))
    );

    // Flatten and deduplicate by ID
    const resultMap = new Map<string, MemorySearchResult>();

    for (const results of allResults) {
      for (const result of results) {
        const existing = resultMap.get(result.id);

        // Keep the result with higher similarity
        if (!existing || result.similarity > existing.similarity) {
          resultMap.set(result.id, result);
        }
      }
    }

    // Convert to array and sort by similarity
    const uniqueResults = Array.from(resultMap.values());
    uniqueResults.sort((a, b) => b.similarity - a.similarity);

    // Apply limit
    const limit = options.limit || 10;
    return uniqueResults.slice(0, limit);
  } catch (error) {
    console.error('Failed to perform multi-search:', error);
    throw new Error(`Multi-search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
