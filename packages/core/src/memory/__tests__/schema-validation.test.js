import { test, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { z } from 'zod';

// Define schema in test since we can't import TS modules directly
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

describe('Schema Validation - Extracted Info', () => {
  it('should validate correct extracted info structure', () => {
    const validData = {
      items: [
        {
          type: 'task',
          content: 'Complete project report',
          summary: 'Project report',
          assignee: 'John',
          dueDate: '2025-12-20T00:00:00Z',
          confidence: 0.85,
        },
      ],
    };

    const result = extractedInfoSchema.safeParse(validData);
    assert.ok(result.success, 'Valid data should pass schema validation');
  });

  it('should validate empty items array', () => {
    const validData = { items: [] };
    const result = extractedInfoSchema.safeParse(validData);
    assert.ok(result.success, 'Empty items array should be valid');
  });

  it('should reject invalid type', () => {
    const invalidData = {
      items: [
        {
          type: 'invalid_type',
          content: 'test',
          confidence: 0.85,
        },
      ],
    };

    const result = extractedInfoSchema.safeParse(invalidData);
    assert.ok(!result.success, 'Invalid type should fail schema validation');
  });

  it('should reject confidence > 1', () => {
    const invalidData = {
      items: [
        {
          type: 'task',
          content: 'test',
          confidence: 1.5,
        },
      ],
    };

    const result = extractedInfoSchema.safeParse(invalidData);
    assert.ok(!result.success, 'Confidence > 1 should fail schema validation');
  });

  it('should reject confidence < 0', () => {
    const invalidData = {
      items: [
        {
          type: 'task',
          content: 'test',
          confidence: -0.1,
        },
      ],
    };

    const result = extractedInfoSchema.safeParse(invalidData);
    assert.ok(!result.success, 'Confidence < 0 should fail schema validation');
  });

  it('should validate all item types', () => {
    const types = ['task', 'decision', 'deadline', 'important', 'general'];

    for (const type of types) {
      const data = {
        items: [
          {
            type,
            content: 'test content',
            confidence: 0.8,
          },
        ],
      };

      const result = extractedInfoSchema.safeParse(data);
      assert.ok(result.success, `Type '${type}' should be valid`);
    }
  });

  it('should allow optional fields', () => {
    const minimalData = {
      items: [
        {
          type: 'task',
          content: 'test content',
          confidence: 0.8,
        },
      ],
    };

    const result = extractedInfoSchema.safeParse(minimalData);
    assert.ok(result.success, 'Optional fields should be allowed');
  });

  it('should validate Vietnamese content with special characters', () => {
    const vietnameseData = {
      items: [
        {
          type: 'task',
          content: 'Hoàn thành báo cáo dự án trước ngày 20/12',
          summary: 'Báo cáo dự án',
          confidence: 0.9,
        },
      ],
    };

    const result = extractedInfoSchema.safeParse(vietnameseData);
    assert.ok(result.success, 'Vietnamese text with diacritics should be valid');
  });

  it('should validate Vietnamese names as assignees', () => {
    const data = {
      items: [
        {
          type: 'task',
          content: 'Liên hệ với Nguyễn Văn A',
          assignee: 'Nguyễn Văn A',
          confidence: 0.85,
        },
      ],
    };

    const result = extractedInfoSchema.safeParse(data);
    assert.ok(result.success, 'Vietnamese names should be valid assignees');
  });

  it('should handle mixed Vietnamese and English', () => {
    const data = {
      items: [
        {
          type: 'decision',
          content: 'Chúng ta sẽ dùng React framework cho project này',
          confidence: 0.88,
        },
      ],
    };

    const result = extractedInfoSchema.safeParse(data);
    assert.ok(result.success, 'Mixed Vietnamese-English should be valid');
  });
});
