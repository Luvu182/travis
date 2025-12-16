import { test, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { extractedInfoSchema, normalizeDueDate } from '../extractor.js';

describe('Extractor - extractedInfoSchema', () => {
  it('should validate correct extracted info structure', () => {
    const validData = {
      items: [
        {
          type: 'task' as const,
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
    const types = ['task', 'decision', 'deadline', 'important', 'general'] as const;

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
          type: 'task' as const,
          content: 'test content',
          confidence: 0.8,
        },
      ],
    };

    const result = extractedInfoSchema.safeParse(minimalData);
    assert.ok(result.success, 'Optional fields should be allowed');
  });
});

describe('Extractor - normalizeDueDate', () => {
  it('should parse ISO date string correctly', () => {
    const isoDate = '2025-12-20T00:00:00Z';
    const result = normalizeDueDate(isoDate);
    assert.ok(result, 'Should return a date string');
    assert.equal(new Date(result!).toISOString(), isoDate);
  });

  it('should parse simple date string', () => {
    const simpleDate = '2025-12-20';
    const result = normalizeDueDate(simpleDate);
    assert.ok(result, 'Should parse simple date format');
    // Check that it's a valid ISO date
    assert.ok(/^\d{4}-\d{2}-\d{2}T/.test(result), 'Should return ISO format');
  });

  it('should return null for invalid date', () => {
    const invalidDate = 'not a date';
    const result = normalizeDueDate(invalidDate);
    assert.equal(result, null, 'Should return null for invalid date');
  });

  it('should return null for undefined input', () => {
    const result = normalizeDueDate(undefined);
    assert.equal(result, null, 'Should return null for undefined');
  });

  it('should return null for empty string', () => {
    const result = normalizeDueDate('');
    assert.equal(result, null, 'Should return null for empty string');
  });

  it('should handle numeric timestamp', () => {
    const timestamp = '1735689600000'; // Valid timestamp
    const result = normalizeDueDate(timestamp);
    assert.ok(result, 'Should parse numeric timestamp');
  });

  it('should preserve date when converting to ISO', () => {
    const inputDate = '2025-12-25';
    const result = normalizeDueDate(inputDate);
    assert.ok(result?.startsWith('2025-12-25'), 'Should preserve the input date');
  });
});

describe('Extractor - Vietnamese text handling', () => {
  it('should validate Vietnamese content with special characters', () => {
    const vietnameseData = {
      items: [
        {
          type: 'task' as const,
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
          type: 'task' as const,
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
          type: 'decision' as const,
          content: 'Chúng ta sẽ dùng React framework cho project này',
          confidence: 0.88,
        },
      ],
    };

    const result = extractedInfoSchema.safeParse(data);
    assert.ok(result.success, 'Mixed Vietnamese-English should be valid');
  });
});
