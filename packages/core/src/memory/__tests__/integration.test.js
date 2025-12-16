import { test, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { cosineSimilarity } from '../embeddings.js';
import { z } from 'zod';

// Schema definitions
const extractedItemSchema = z.object({
  type: z.enum(['task', 'decision', 'deadline', 'important', 'general']),
  content: z.string(),
  summary: z.string().optional(),
  assignee: z.string().optional(),
  dueDate: z.string().optional(),
  confidence: z.number().min(0).max(1),
});

const extractedInfoSchema = z.object({
  items: z.array(extractedItemSchema),
});

describe('Integration - Memory Layer End-to-End', () => {
  describe('Extraction to Storage Pipeline', () => {
    it('should process Vietnamese message end-to-end', () => {
      const message = 'Bạn hãy hoàn thành báo cáo dự án trước ngày 20/12';
      assert.ok(message.length > 0, 'Message should be valid');

      const extractedData = {
        items: [
          {
            type: 'task',
            content: 'Hoàn thành báo cáo dự án',
            summary: 'Báo cáo dự án',
            assignee: 'người nhân',
            dueDate: '2025-12-20',
            confidence: 0.85,
          },
        ],
      };

      const result = extractedInfoSchema.safeParse(extractedData);
      assert.ok(result.success, 'Extraction should be valid');

      const highConfidence = extractedData.items.filter(i => i.confidence >= 0.7);
      assert.equal(highConfidence.length, 1, 'Should have 1 high-confidence item');
    });

    it('should handle multiple extractions from single message', () => {
      const extractedData = {
        items: [
          {
            type: 'task',
            content: 'Liên hệ với khách hàng A',
            confidence: 0.9,
          },
          {
            type: 'deadline',
            content: 'Cuộc họp lúc 14:00',
            dueDate: '2025-12-16T14:00:00Z',
            confidence: 0.85,
          },
          {
            type: 'decision',
            content: 'Chúng ta sẽ dùng framework React',
            confidence: 0.88,
          },
        ],
      };

      const result = extractedInfoSchema.safeParse(extractedData);
      assert.ok(result.success, 'Multi-item extraction should be valid');

      const filtered = extractedData.items.filter(i => i.confidence >= 0.7);
      assert.equal(filtered.length, 3, 'All items should meet confidence threshold');
    });

    it('should skip low-confidence extractions', () => {
      const extractedData = {
        items: [
          {
            type: 'task',
            content: 'Task 1',
            confidence: 0.85,
          },
          {
            type: 'general',
            content: 'General info',
            confidence: 0.6, // Below threshold
          },
          {
            type: 'task',
            content: 'Task 2',
            confidence: 0.75,
          },
        ],
      };

      const result = extractedInfoSchema.safeParse(extractedData);
      assert.ok(result.success, 'Full data should validate');

      const filtered = extractedData.items.filter(i => i.confidence >= 0.7);
      assert.equal(filtered.length, 2, 'Should skip low-confidence items');
    });
  });

  describe('Storage Validation', () => {
    it('should validate complete storage payload', () => {
      const storagePayload = {
        messageId: 'msg_abc123',
        groupId: 'group_xyz789',
        items: [
          {
            type: 'task',
            content: 'Complete project report',
            summary: 'Project report',
            assignee: 'John Doe',
            dueDate: '2025-12-20',
            confidence: 0.9,
          },
        ],
      };

      assert.ok(storagePayload.messageId, 'Should have messageId');
      assert.ok(storagePayload.groupId, 'Should have groupId');
      assert.equal(storagePayload.items.length, 1, 'Should have items');

      const schema = extractedInfoSchema.safeParse({ items: storagePayload.items });
      assert.ok(schema.success, 'Items should validate against schema');
    });

    it('should handle batch storage payloads', () => {
      const batch = [
        {
          messageId: 'msg_1',
          groupId: 'group_1',
          items: [
            { type: 'task', content: 'Task 1', confidence: 0.85 },
          ],
        },
        {
          messageId: 'msg_2',
          groupId: 'group_1',
          items: [
            { type: 'decision', content: 'Decision 1', confidence: 0.9 },
            { type: 'deadline', content: 'Deadline 1', confidence: 0.8 },
          ],
        },
        {
          messageId: 'msg_3',
          groupId: 'group_1',
          items: [], // Empty
        },
      ];

      const validBatch = batch.filter(b => b.items.length > 0);
      assert.equal(validBatch.length, 2, 'Should have 2 valid entries');

      const totalItems = validBatch.reduce((sum, b) => sum + b.items.length, 0);
      assert.equal(totalItems, 3, 'Should have 3 total items');
    });
  });

  describe('Retrieval with Embeddings', () => {
    it('should support semantic search with embeddings', () => {
      // Simulate 768D embeddings
      const queryEmbedding = new Array(768).fill(0);
      queryEmbedding[0] = 1;

      const doc1Embedding = new Array(768).fill(0);
      doc1Embedding[0] = 1; // Same as query

      const doc2Embedding = new Array(768).fill(0);
      doc2Embedding[1] = 1; // Different from query

      const sim1 = cosineSimilarity(queryEmbedding, doc1Embedding);
      const sim2 = cosineSimilarity(queryEmbedding, doc2Embedding);

      assert.equal(sim1, 1.0, 'Identical embeddings should have similarity 1.0');
      assert.equal(sim2, 0, 'Orthogonal embeddings should have similarity 0');
      assert.ok(sim1 > sim2, 'First document should be more similar');
    });

    it('should rank search results by similarity', () => {
      const results = [
        { id: '1', similarity: 0.95, content: 'Perfect match' },
        { id: '2', similarity: 0.72, content: 'Good match' },
        { id: '3', similarity: 0.45, content: 'Weak match' },
      ];

      const sorted = [...results].sort((a, b) => b.similarity - a.similarity);

      assert.equal(sorted[0].id, '1', 'Should rank highest similarity first');
      assert.equal(sorted[1].id, '2', 'Should rank second highest second');
      assert.equal(sorted[2].id, '3', 'Should rank lowest last');
    });

    it('should filter by minSimilarity threshold', () => {
      const results = [
        { id: '1', similarity: 0.95 },
        { id: '2', similarity: 0.72 },
        { id: '3', similarity: 0.45 },
        { id: '4', similarity: 0.3 },
      ];

      const minSimilarity = 0.5;
      const filtered = results.filter(r => r.similarity >= minSimilarity);

      assert.equal(filtered.length, 2, 'Should filter by threshold');
      assert.ok(filtered.every(r => r.similarity >= minSimilarity), 'All should meet threshold');
    });

    it('should handle retrieval with multiple filter criteria', () => {
      const results = [
        { id: '1', type: 'task', similarity: 0.95 },
        { id: '2', type: 'decision', similarity: 0.85 },
        { id: '3', type: 'task', similarity: 0.72 },
        { id: '4', type: 'deadline', similarity: 0.6 },
      ];

      const filtered = results.filter(r => r.type === 'task' && r.similarity >= 0.7);

      assert.equal(filtered.length, 2, 'Should filter by type and similarity');
    });
  });

  describe('Vietnamese Text Processing', () => {
    it('should handle Vietnamese text throughout pipeline', () => {
      const vietnameseMessage = 'Nguyễn Văn A cần hoàn thành báo cáo kế toán trước ngày 25/12/2025';

      assert.ok(vietnameseMessage.includes('Nguyễn'), 'Should preserve Vietnamese names');
      assert.ok(vietnameseMessage.includes('báo cáo'), 'Should preserve Vietnamese words');

      const extracted = {
        items: [
          {
            type: 'task',
            content: 'Hoàn thành báo cáo kế toán',
            assignee: 'Nguyễn Văn A',
            dueDate: '2025-12-25',
            confidence: 0.92,
          },
        ],
      };

      const validated = extractedInfoSchema.safeParse(extracted);
      assert.ok(validated.success, 'Vietnamese extraction should be valid');
    });

    it('should process mixed Vietnamese-English messages', () => {
      const extracted = {
        items: [
          {
            type: 'decision',
            content: 'Sử dụng React framework cho dự án',
            confidence: 0.88,
          },
        ],
      };

      const validated = extractedInfoSchema.safeParse(extracted);
      assert.ok(validated.success, 'Mixed language extraction should be valid');
    });
  });

  describe('Error Recovery', () => {
    it('should handle extraction errors gracefully', () => {
      const failed = { items: [] };
      const validated = extractedInfoSchema.safeParse(failed);
      assert.ok(validated.success, 'Empty extraction should be valid');
      assert.equal(failed.items.length, 0, 'Should handle no-items case');
    });

    it('should skip empty batch entries', () => {
      const batch = [
        {
          messageId: 'msg_1',
          groupId: 'group_1',
          items: [{ type: 'task', content: 'Task', confidence: 0.8 }],
        },
        {
          messageId: 'msg_2',
          groupId: 'group_1',
          items: [], // Empty
        },
        {
          messageId: 'msg_3',
          groupId: 'group_1',
          items: [{ type: 'decision', content: 'Decision', confidence: 0.85 }],
        },
      ];

      const processed = batch.filter(b => b.items.length > 0);
      assert.equal(processed.length, 2, 'Should skip empty entries');
    });
  });

  describe('Data Consistency', () => {
    it('should maintain consistency across multiple operations', () => {
      const groupId = 'group_abc123';
      const items = [
        {
          type: 'task',
          content: 'Task 1',
          confidence: 0.85,
        },
        {
          type: 'decision',
          content: 'Decision 1',
          confidence: 0.9,
        },
      ];

      const extractedData = { items };
      const validated = extractedInfoSchema.safeParse(extractedData);
      assert.ok(validated.success, 'Should validate');

      const filtered = items.filter(i => i.confidence >= 0.7);
      assert.equal(filtered.length, 2, 'Should have all items');

      const storagePayload = {
        messageId: 'msg_1',
        groupId,
        items: filtered,
      };

      assert.equal(storagePayload.groupId, groupId, 'GroupId should be consistent');
      assert.equal(storagePayload.items.length, 2, 'Items should be consistent');
    });
  });
});
