import { searchRelevantMemories, formatMemoriesForPrompt, type MemoryItem } from '@jarvis/core';

// ==================== TYPES ====================

export interface QueryOptions {
  userId: string;
  groupId: string;
  query: string;
  limit?: number;
  minScore?: number;
  dateFrom?: Date;
  dateTo?: Date;
  includeMetadata?: boolean;
}

export interface RankedMemory extends MemoryItem {
  rank: number;
  rankingScore: number;
  relevanceReason?: string;
}

export interface QueryResult {
  success: boolean;
  memories: RankedMemory[];
  totalCount: number;
  formattedContext: string;
  queryLatencyMs: number;
  error?: string;
}

export interface MemoryFilter {
  minScore?: number;
  dateFrom?: Date;
  dateTo?: Date;
  hasMetadata?: boolean;
}

// ==================== RANKING ALGORITHMS ====================

/**
 * Calculate ranking score combining relevance, recency, and confidence
 *
 * Formula: rankingScore = (relevance * 0.6) + (recency * 0.3) + (confidence * 0.1)
 *
 * @param memory - Memory item to rank
 * @param index - Position in search results (for recency bonus)
 * @returns Combined ranking score (0-1)
 */
function calculateRankingScore(memory: MemoryItem, index: number, totalResults: number): number {
  // Relevance score from mem0 (already 0-1)
  const relevanceScore = memory.score || 0;

  // Recency score based on position (earlier results get higher scores)
  const recencyScore = totalResults > 0 ? 1 - index / totalResults : 0;

  // Confidence score based on metadata (if available)
  const confidenceScore = typeof memory.metadata?.confidence === 'number' ? memory.metadata.confidence : 0.7;

  // Weighted combination
  const rankingScore = relevanceScore * 0.6 + recencyScore * 0.3 + confidenceScore * 0.1;

  return Math.min(1, Math.max(0, rankingScore));
}

/**
 * Generate relevance reason based on score and metadata
 */
function generateRelevanceReason(memory: MemoryItem, score: number): string {
  if (score >= 0.9) return 'Highly relevant - exact match';
  if (score >= 0.7) return 'Very relevant - strong similarity';
  if (score >= 0.5) return 'Relevant - moderate similarity';
  if (score >= 0.3) return 'Somewhat relevant - weak similarity';
  return 'Low relevance';
}

// ==================== FILTERING ====================

/**
 * Filter memories based on criteria
 */
function filterMemories(memories: MemoryItem[], filter: MemoryFilter): MemoryItem[] {
  return memories.filter((memory) => {
    // Score threshold
    if (filter.minScore !== undefined && (memory.score || 0) < filter.minScore) {
      return false;
    }

    // Date range filtering
    if (filter.dateFrom || filter.dateTo) {
      const memoryDate = memory.created_at ? new Date(memory.created_at) : null;
      if (!memoryDate) return false;

      if (filter.dateFrom && memoryDate < filter.dateFrom) return false;
      if (filter.dateTo && memoryDate > filter.dateTo) return false;
    }

    // Metadata requirement
    if (filter.hasMetadata !== undefined) {
      const hasMetadata = memory.metadata && Object.keys(memory.metadata).length > 0;
      if (filter.hasMetadata !== hasMetadata) return false;
    }

    return true;
  });
}

// ==================== DEDUPLICATION ====================

/**
 * Remove duplicate memories based on content similarity
 */
function deduplicateMemories(memories: RankedMemory[]): RankedMemory[] {
  const seen = new Set<string>();
  const deduplicated: RankedMemory[] = [];

  for (const memory of memories) {
    // Create a normalized key from memory content
    const normalizedContent = memory.memory.toLowerCase().trim().replace(/\s+/g, ' ');

    if (!seen.has(normalizedContent)) {
      seen.add(normalizedContent);
      deduplicated.push(memory);
    }
  }

  return deduplicated;
}

// ==================== CORE QUERY HANDLER ====================

/**
 * Execute a query with advanced ranking, filtering, and optimization
 *
 * Flow:
 * 1. Search for relevant memories via mem0
 * 2. Apply custom filters (score, date, metadata)
 * 3. Calculate ranking scores with weighted formula
 * 4. Deduplicate similar memories
 * 5. Format context for LLM consumption
 *
 * @param options - Query options
 * @returns Query result with ranked memories and formatted context
 */
export async function executeQuery(options: QueryOptions): Promise<QueryResult> {
  const startTime = Date.now();

  try {
    // Step 1: Search for relevant memories (fetch extra for filtering)
    const limit = options.limit || 5;
    const searchLimit = Math.min(limit * 2, 20); // Fetch 2x for filtering buffer

    const rawMemories = await searchRelevantMemories({
      userId: options.userId,
      groupId: options.groupId,
      query: options.query,
      limit: searchLimit,
    });

    // Step 2: Apply filters
    const filter: MemoryFilter = {
      minScore: options.minScore,
      dateFrom: options.dateFrom,
      dateTo: options.dateTo,
    };

    const filteredMemories = filterMemories(rawMemories, filter);

    // Step 3: Calculate ranking scores
    const rankedMemories: RankedMemory[] = filteredMemories.map((memory, index) => {
      const rankingScore = calculateRankingScore(memory, index, filteredMemories.length);
      const relevanceReason = generateRelevanceReason(memory, rankingScore);

      return {
        ...memory,
        rank: index + 1,
        rankingScore,
        relevanceReason,
      };
    });

    // Step 4: Sort by ranking score (descending)
    rankedMemories.sort((a, b) => b.rankingScore - a.rankingScore);

    // Step 5: Deduplicate
    const deduplicated = deduplicateMemories(rankedMemories);

    // Step 6: Apply final limit
    const finalMemories = deduplicated.slice(0, limit);

    // Step 7: Re-rank after deduplication
    finalMemories.forEach((memory, index) => {
      memory.rank = index + 1;
    });

    // Step 8: Format context for LLM
    const formattedContext = formatMemoriesForPrompt(
      options.includeMetadata !== false ? finalMemories : finalMemories.map(({ metadata, ...rest }) => rest)
    );

    const queryLatencyMs = Date.now() - startTime;

    return {
      success: true,
      memories: finalMemories,
      totalCount: finalMemories.length,
      formattedContext,
      queryLatencyMs,
    };
  } catch (error) {
    const queryLatencyMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    console.error('[QueryHandler] Query execution failed:', errorMessage);

    return {
      success: false,
      memories: [],
      totalCount: 0,
      formattedContext: '',
      queryLatencyMs,
      error: errorMessage,
    };
  }
}

/**
 * Get memory statistics for a user/group
 */
export async function getMemoryStats(userId: string, groupId: string): Promise<{
  totalMemories: number;
  avgScore: number;
  dateRange: { earliest?: string; latest?: string };
}> {
  try {
    // Fetch a large sample to calculate stats
    const memories = await searchRelevantMemories({
      userId,
      groupId,
      query: '', // Empty query to get all
      limit: 100,
    });

    if (memories.length === 0) {
      return {
        totalMemories: 0,
        avgScore: 0,
        dateRange: {},
      };
    }

    const totalMemories = memories.length;
    const avgScore = memories.reduce((sum, m) => sum + (m.score || 0), 0) / totalMemories;

    const dates = memories
      .map((m) => (m.created_at ? new Date(m.created_at).getTime() : 0))
      .filter((d) => d > 0);

    const dateRange = {
      earliest: dates.length > 0 ? new Date(Math.min(...dates)).toISOString() : undefined,
      latest: dates.length > 0 ? new Date(Math.max(...dates)).toISOString() : undefined,
    };

    return {
      totalMemories,
      avgScore,
      dateRange,
    };
  } catch (error) {
    console.error('[QueryHandler] Failed to get memory stats:', error);
    return {
      totalMemories: 0,
      avgScore: 0,
      dateRange: {},
    };
  }
}
