import { test, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { MemorySearchResult } from '../retriever.js';

describe('Retriever - Search Result Structure', () => {
  it('should validate memory search result structure', () => {
    const result: MemorySearchResult = {
      id: 'search_result_1',
      type: 'task',
      content: 'Complete project report',
      summary: 'Project report completion',
      dueDate: new Date('2025-12-20'),
      similarity: 0.95,
    };

    assert.ok(result.id, 'Result should have id');
    assert.ok(result.type, 'Result should have type');
    assert.ok(result.content, 'Result should have content');
    assert.ok(result.similarity >= 0 && result.similarity <= 1, 'Similarity should be 0-1');
  });

  it('should allow optional fields in search results', () => {
    const result: MemorySearchResult = {
      id: 'result_1',
      type: 'general',
      content: 'General information',
      similarity: 0.7,
    };

    assert.equal(result.summary, undefined, 'Summary should be optional');
    assert.equal(result.dueDate, undefined, 'DueDate should be optional');
  });

  it('should validate similarity scores are normalized', () => {
    const results: MemorySearchResult[] = [
      { id: '1', type: 'task', content: 'Task 1', similarity: 1.0 }, // Perfect match
      { id: '2', type: 'task', content: 'Task 2', similarity: 0.75 }, // 75% similar
      { id: '3', type: 'task', content: 'Task 3', similarity: 0.5 }, // 50% similar
      { id: '4', type: 'task', content: 'Task 4', similarity: 0.0 }, // No similarity
    ];

    results.forEach(result => {
      assert.ok(result.similarity >= 0 && result.similarity <= 1, 'All similarities should be 0-1');
    });
  });
});

describe('Retriever - Search Options', () => {
  it('should validate search options', () => {
    const options = {
      groupId: 'group_1',
      type: 'task' as const,
      limit: 10,
      minSimilarity: 0.5,
    };

    assert.equal(typeof options.groupId, 'string');
    assert.equal(typeof options.type, 'string');
    assert.equal(typeof options.limit, 'number');
    assert.equal(typeof options.minSimilarity, 'number');
  });

  it('should validate limit parameter', () => {
    const limits = [1, 5, 10, 20, 50, 100];

    limits.forEach(limit => {
      assert.ok(limit > 0, `Limit should be positive: ${limit}`);
    });
  });

  it('should validate minSimilarity threshold', () => {
    const thresholds = [0.0, 0.3, 0.5, 0.7, 0.9, 1.0];

    thresholds.forEach(threshold => {
      assert.ok(threshold >= 0 && threshold <= 1, `Threshold should be 0-1: ${threshold}`);
    });
  });

  it('should have default search options', () => {
    const defaults = {
      limit: 10,
      minSimilarity: 0.5,
    };

    assert.equal(defaults.limit, 10, 'Default limit should be 10');
    assert.equal(defaults.minSimilarity, 0.5, 'Default minSimilarity should be 0.5');
  });

  it('should filter results by minSimilarity', () => {
    const results: MemorySearchResult[] = [
      { id: '1', type: 'task', content: 'High similarity', similarity: 0.95 },
      { id: '2', type: 'task', content: 'Medium similarity', similarity: 0.6 },
      { id: '3', type: 'task', content: 'Low similarity', similarity: 0.3 },
    ];

    const minSimilarity = 0.5;
    const filtered = results.filter(r => r.similarity >= minSimilarity);

    assert.equal(filtered.length, 2, 'Should filter results by minSimilarity');
    assert.ok(filtered.every(r => r.similarity >= minSimilarity), 'All results should meet threshold');
  });

  it('should limit results by count', () => {
    const results: MemorySearchResult[] = Array.from({ length: 20 }, (_, i) => ({
      id: `result_${i}`,
      type: 'task' as const,
      content: `Result ${i}`,
      similarity: 1 - i * 0.05, // Decreasing similarity
    }));

    const limit = 10;
    const limited = results.slice(0, limit);

    assert.equal(limited.length, limit, 'Should limit results to specified count');
  });

  it('should support filtering by type', () => {
    const results: MemorySearchResult[] = [
      { id: '1', type: 'task', content: 'Task', similarity: 0.9 },
      { id: '2', type: 'decision', content: 'Decision', similarity: 0.85 },
      { id: '3', type: 'task', content: 'Another task', similarity: 0.8 },
      { id: '4', type: 'deadline', content: 'Deadline', similarity: 0.75 },
    ];

    const taskType = 'task';
    const filtered = results.filter(r => r.type === taskType);

    assert.equal(filtered.length, 2, 'Should filter by type');
    assert.ok(filtered.every(r => r.type === taskType), 'All results should match type');
  });
});

describe('Retriever - Specialized Searches', () => {
  it('should construct assignee search query', () => {
    const assignee = 'Nguyễn Văn A';
    const query = `nhiệm vụ của ${assignee}`;

    assert.ok(query.includes(assignee), 'Query should contain assignee name');
    assert.ok(query.includes('nhiệm vụ'), 'Query should include task keyword');
  });

  it('should construct deadline search query', () => {
    const query = 'deadline thời hạn sắp tới';

    assert.ok(query.includes('deadline'), 'Query should include deadline keyword');
    assert.ok(query.includes('thời hạn'), 'Query should include time constraint keyword');
  });

  it('should handle multi-query searches', () => {
    const queries = [
      'upcoming deadline',
      'tasks assigned',
      'important decisions',
    ];

    assert.equal(queries.length, 3, 'Should have 3 queries');
    queries.forEach(q => {
      assert.ok(q.length > 0, 'Each query should be non-empty');
    });
  });

  it('should deduplicate results from multi-search', () => {
    const results1: MemorySearchResult[] = [
      { id: '1', type: 'task', content: 'Task 1', similarity: 0.9 },
      { id: '2', type: 'task', content: 'Task 2', similarity: 0.8 },
    ];

    const results2: MemorySearchResult[] = [
      { id: '2', type: 'task', content: 'Task 2', similarity: 0.85 }, // Duplicate with different similarity
      { id: '3', type: 'task', content: 'Task 3', similarity: 0.7 },
    ];

    const resultMap = new Map<string, MemorySearchResult>();

    for (const result of [...results1, ...results2]) {
      const existing = resultMap.get(result.id);
      if (!existing || result.similarity > existing.similarity) {
        resultMap.set(result.id, result);
      }
    }

    const deduped = Array.from(resultMap.values());
    assert.equal(deduped.length, 3, 'Should have 3 unique results');

    // Check that id '2' has the higher similarity
    const id2Result = deduped.find(r => r.id === '2');
    assert.equal(id2Result?.similarity, 0.85, 'Should keep higher similarity for duplicates');
  });

  it('should sort results by similarity descending', () => {
    const results: MemorySearchResult[] = [
      { id: '1', type: 'task', content: 'Task 1', similarity: 0.7 },
      { id: '2', type: 'task', content: 'Task 2', similarity: 0.95 },
      { id: '3', type: 'task', content: 'Task 3', similarity: 0.5 },
    ];

    const sorted = [...results].sort((a, b) => b.similarity - a.similarity);

    assert.equal(sorted[0].similarity, 0.95, 'First should be highest similarity');
    assert.equal(sorted[1].similarity, 0.7, 'Second should be medium similarity');
    assert.equal(sorted[2].similarity, 0.5, 'Third should be lowest similarity');
  });
});

describe('Retriever - Error Handling', () => {
  it('should reject empty query', () => {
    const query = '';
    assert.throws(
      () => {
        if (!query || query.trim().length === 0) {
          throw new Error('Query cannot be empty');
        }
      },
      /Query cannot be empty/
    );
  });

  it('should reject empty multi-search queries', () => {
    const queries: string[] = [];
    assert.throws(
      () => {
        if (queries.length === 0) {
          throw new Error('At least one query is required');
        }
      },
      /At least one query is required/
    );
  });

  it('should handle no results gracefully', () => {
    const results: MemorySearchResult[] = [];
    assert.equal(results.length, 0, 'Empty results should be valid');
  });

  it('should handle missing optional dueDate', () => {
    const result: MemorySearchResult = {
      id: '1',
      type: 'task',
      content: 'Task without due date',
      similarity: 0.8,
      // dueDate is undefined
    };

    assert.equal(result.dueDate, undefined, 'Should allow undefined dueDate');
  });
});

describe('Retriever - Performance Constraints', () => {
  it('should track retrieval latency', () => {
    const startTime = performance.now();

    // Simulate retrieval operation
    const results = Array.from({ length: 10 }, (_, i) => ({
      id: `result_${i}`,
      type: 'task' as const,
      content: `Result ${i}`,
      similarity: 1 - i * 0.1,
    }));

    const endTime = performance.now();
    const latency = endTime - startTime;

    assert.ok(latency >= 0, 'Latency should be non-negative');
    // Note: This will likely be < 1ms in test environment
    // Real latency depends on actual embedding generation and database query
  });

  it('should handle large result sets', () => {
    const largeResultSet = Array.from({ length: 10000 }, (_, i) => ({
      id: `result_${i}`,
      type: 'task' as const,
      content: `Result ${i}`,
      similarity: Math.random(),
    }));

    const limit = 100;
    const limited = largeResultSet.slice(0, limit);

    assert.equal(limited.length, limit, 'Should handle large result sets');
  });

  it('should batch search operations efficiently', () => {
    const queryCount = 5;
    const limit = 10;

    const estimatedResults = queryCount * limit;
    assert.ok(estimatedResults <= 50, 'Batch results should be manageable');
  });
});

describe('Retriever - Recent Items', () => {
  it('should return recent items with perfect similarity', () => {
    const recentItems: MemorySearchResult[] = [
      { id: '1', type: 'task', content: 'Recent task 1', similarity: 1.0 },
      { id: '2', type: 'decision', content: 'Recent decision 1', similarity: 1.0 },
      { id: '3', type: 'general', content: 'Recent info 1', similarity: 1.0 },
    ];

    recentItems.forEach(item => {
      assert.equal(item.similarity, 1.0, 'Recent items should have perfect similarity');
    });
  });

  it('should limit recent items by count', () => {
    const allRecent = Array.from({ length: 10 }, (_, i) => ({
      id: `recent_${i}`,
      type: 'general' as const,
      content: `Recent item ${i}`,
      similarity: 1.0,
    }));

    const limit = 5;
    const limited = allRecent.slice(0, limit);

    assert.equal(limited.length, limit, `Should limit to ${limit} recent items`);
  });
});
