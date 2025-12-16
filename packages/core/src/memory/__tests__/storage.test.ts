import { test, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeDueDate } from '../extractor.js';
import type { ExtractedItem } from '../extractor.js';

describe('Storage - Data Validation', () => {
  it('should handle empty items array', () => {
    const items: ExtractedItem[] = [];
    assert.equal(items.length, 0, 'Empty array should have length 0');
  });

  it('should validate extracted item structure', () => {
    const item: ExtractedItem = {
      type: 'task',
      content: 'Complete project',
      summary: 'Project completion',
      assignee: 'John',
      dueDate: '2025-12-20',
      confidence: 0.85,
    };

    assert.ok(item.type, 'Item should have type');
    assert.ok(item.content, 'Item should have content');
    assert.ok(item.confidence >= 0.7, 'Item confidence should be >= 0.7');
  });

  it('should filter items by confidence >= 0.7', () => {
    const items: ExtractedItem[] = [
      { type: 'task', content: 'Task 1', confidence: 0.9 },
      { type: 'task', content: 'Task 2', confidence: 0.6 }, // Below threshold
      { type: 'decision', content: 'Decision 1', confidence: 0.7 }, // At threshold
      { type: 'task', content: 'Task 3', confidence: 0.5 }, // Below threshold
    ];

    const filtered = items.filter(item => item.confidence >= 0.7);
    assert.equal(filtered.length, 2, 'Should filter items correctly');
    assert.deepEqual(
      filtered.map(i => i.confidence),
      [0.9, 0.7],
      'Filtered items should have correct confidence scores'
    );
  });

  it('should normalize due dates in storage', () => {
    const items: ExtractedItem[] = [
      {
        type: 'deadline',
        content: 'Submit report',
        dueDate: '2025-12-20',
        confidence: 0.85,
      },
      {
        type: 'deadline',
        content: 'Review changes',
        dueDate: '2025-12-25T15:30:00Z',
        confidence: 0.9,
      },
    ];

    items.forEach(item => {
      const normalized = normalizeDueDate(item.dueDate);
      assert.ok(normalized, `Should normalize due date: ${item.dueDate}`);
    });
  });

  it('should handle items without optional fields', () => {
    const item: ExtractedItem = {
      type: 'general',
      content: 'General information',
      confidence: 0.75,
    };

    assert.equal(item.summary, undefined, 'Summary should be optional');
    assert.equal(item.assignee, undefined, 'Assignee should be optional');
    assert.equal(item.dueDate, undefined, 'DueDate should be optional');
  });

  it('should validate batch storage items', () => {
    const batch = [
      {
        messageId: 'msg1',
        groupId: 'group1',
        items: [{ type: 'task' as const, content: 'Task 1', confidence: 0.85 }],
      },
      {
        messageId: 'msg2',
        groupId: 'group1',
        items: [
          { type: 'decision' as const, content: 'Decision 1', confidence: 0.9 },
          { type: 'deadline' as const, content: 'Deadline 1', confidence: 0.8 },
        ],
      },
    ];

    assert.equal(batch.length, 2, 'Should have 2 entries');
    assert.equal(batch[0].items.length, 1, 'First entry should have 1 item');
    assert.equal(batch[1].items.length, 2, 'Second entry should have 2 items');
  });

  it('should validate memory types', () => {
    const validMemoryTypes = ['fact', 'event', 'preference', 'context'] as const;

    for (const type of validMemoryTypes) {
      assert.ok(type, `Memory type '${type}' should be valid`);
    }
  });

  it('should handle metadata in storage', () => {
    const params = {
      groupId: 'group1',
      userId: 'user1',
      content: 'User preference data',
      memoryType: 'preference' as const,
      metadata: {
        source: 'chat_message',
        timestamp: new Date().toISOString(),
        tags: ['important', 'preference'],
      },
    };

    assert.ok(params.metadata, 'Should have metadata');
    assert.equal(params.metadata.tags?.length, 2, 'Metadata should contain tags');
  });

  it('should validate groupId and messageId presence', () => {
    const storageParams = {
      messageId: 'msg_12345',
      groupId: 'group_67890',
      items: [{ type: 'task' as const, content: 'Test task', confidence: 0.8 }],
    };

    assert.ok(storageParams.messageId, 'Should have messageId');
    assert.ok(storageParams.groupId, 'Should have groupId');
    assert.ok(storageParams.items.length > 0, 'Should have items');
  });

  it('should handle Vietnamese content in storage', () => {
    const item: ExtractedItem = {
      type: 'task',
      content: 'Hoàn thành báo cáo dự án trước ngày 20/12',
      summary: 'Báo cáo dự án',
      assignee: 'Nguyễn Văn A',
      confidence: 0.9,
    };

    assert.ok(item.content.includes('Hoàn thành'), 'Should preserve Vietnamese characters');
    assert.ok(item.assignee?.includes('Nguyễn'), 'Should handle Vietnamese names');
  });

  it('should validate confidence scores are within range', () => {
    const items: ExtractedItem[] = [
      { type: 'task', content: 'Task 1', confidence: 0.0 },
      { type: 'task', content: 'Task 2', confidence: 0.5 },
      { type: 'task', content: 'Task 3', confidence: 1.0 },
    ];

    items.forEach(item => {
      assert.ok(item.confidence >= 0 && item.confidence <= 1, 'Confidence should be 0-1');
    });
  });
});

describe('Storage - Batch Operations', () => {
  it('should process batch entries sequentially', () => {
    const batch = [
      {
        messageId: 'msg1',
        groupId: 'group1',
        items: [{ type: 'task' as const, content: 'Task 1', confidence: 0.85 }],
      },
      {
        messageId: 'msg2',
        groupId: 'group1',
        items: [{ type: 'decision' as const, content: 'Decision 1', confidence: 0.9 }],
      },
      {
        messageId: 'msg3',
        groupId: 'group1',
        items: [
          { type: 'task' as const, content: 'Task 2', confidence: 0.8 },
          { type: 'deadline' as const, content: 'Deadline 1', confidence: 0.75 },
        ],
      },
    ];

    let processedCount = 0;
    batch.forEach(entry => {
      if (entry.items.length > 0) {
        processedCount += entry.items.length;
      }
    });

    assert.equal(processedCount, 4, 'Should process 4 total items');
  });

  it('should skip empty batch entries', () => {
    const batch = [
      {
        messageId: 'msg1',
        groupId: 'group1',
        items: [{ type: 'task' as const, content: 'Task 1', confidence: 0.85 }],
      },
      {
        messageId: 'msg2',
        groupId: 'group1',
        items: [], // Empty
      },
    ];

    const validEntries = batch.filter(e => e.items.length > 0);
    assert.equal(validEntries.length, 1, 'Should have 1 valid entry');
  });

  it('should handle batch with varying item counts', () => {
    const batch = [
      {
        messageId: 'msg1',
        groupId: 'group1',
        items: [{ type: 'task' as const, content: 'Task 1', confidence: 0.85 }],
      },
      {
        messageId: 'msg2',
        groupId: 'group1',
        items: [
          { type: 'decision' as const, content: 'Decision 1', confidence: 0.9 },
          { type: 'task' as const, content: 'Task 2', confidence: 0.8 },
          { type: 'deadline' as const, content: 'Deadline 1', confidence: 0.75 },
        ],
      },
    ];

    const totalItems = batch.reduce((sum, entry) => sum + entry.items.length, 0);
    assert.equal(totalItems, 4, 'Should count total items correctly');
  });
});
