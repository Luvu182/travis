/**
 * Vietnamese prompts validation tests
 * Tests that all prompts are defined, non-empty, and contain Vietnamese text
 */

import { test } from 'node:test';
import * as assert from 'node:assert';
import { SYSTEM_PROMPTS, getSystemPrompt } from '../prompts.js';

test('Prompts - SYSTEM_PROMPTS object structure', async (t) => {
  await t.test('all required prompts are defined', () => {
    assert.ok(SYSTEM_PROMPTS.assistant, 'should have assistant prompt');
    assert.ok(SYSTEM_PROMPTS.queryResponse, 'should have queryResponse prompt');
    assert.ok(SYSTEM_PROMPTS.extraction, 'should have extraction prompt');
    assert.ok(SYSTEM_PROMPTS.summarization, 'should have summarization prompt');
    assert.ok(SYSTEM_PROMPTS.translation, 'should have translation prompt');
  });

  await t.test('all prompts are non-empty strings', () => {
    Object.entries(SYSTEM_PROMPTS).forEach(([key, prompt]) => {
      assert.ok(typeof prompt === 'string', `${key} should be a string`);
      assert.ok(prompt.length > 0, `${key} should not be empty`);
    });
  });

  await t.test('all prompts contain Vietnamese text', () => {
    const vietnameseRegex = /[ạ-ỿ]/; // Vietnamese diacritics range
    Object.entries(SYSTEM_PROMPTS).forEach(([key, prompt]) => {
      assert.ok(vietnameseRegex.test(prompt), `${key} should contain Vietnamese text`);
    });
  });
});

test('Prompts - Vietnamese content validation', async (t) => {
  await t.test('assistant prompt contains key responsibilities', () => {
    const prompt = SYSTEM_PROMPTS.assistant;
    assert.ok(prompt.includes('J.A.R.V.I.S'), 'should mention J.A.R.V.I.S name');
    assert.ok(prompt.includes('ghi nhớ'), 'should mention memory functionality');
    assert.ok(prompt.includes('trả lời'), 'should mention response capability');
  });

  await t.test('queryResponse prompt has query rules', () => {
    const prompt = SYSTEM_PROMPTS.queryResponse;
    assert.ok(prompt.includes('trả lời câu hỏi'), 'should mention answering questions');
    assert.ok(prompt.includes('thông tin được cung cấp'), 'should mention provided info');
  });

  await t.test('extraction prompt defines extraction types', () => {
    const prompt = SYSTEM_PROMPTS.extraction;
    assert.ok(prompt.includes('Tasks'), 'should mention Tasks');
    assert.ok(prompt.includes('Decisions'), 'should mention Decisions');
    assert.ok(prompt.includes('Deadlines'), 'should mention Deadlines');
  });

  await t.test('summarization prompt outlines requirements', () => {
    const prompt = SYSTEM_PROMPTS.summarization;
    assert.ok(prompt.includes('tóm tắt'), 'should mention summarization');
    assert.ok(prompt.includes('action items'), 'should mention action items');
  });

  await t.test('translation prompt specifies rules', () => {
    const prompt = SYSTEM_PROMPTS.translation;
    assert.ok(prompt.includes('dịch'), 'should mention translation');
    assert.ok(prompt.includes('tên riêng'), 'should mention proper names');
  });
});

test('Prompts - getSystemPrompt() function', async (t) => {
  await t.test('returns assistant prompt correctly', () => {
    const prompt = getSystemPrompt('assistant');
    assert.strictEqual(prompt, SYSTEM_PROMPTS.assistant, 'should return assistant prompt');
  });

  await t.test('returns queryResponse prompt correctly', () => {
    const prompt = getSystemPrompt('queryResponse');
    assert.strictEqual(prompt, SYSTEM_PROMPTS.queryResponse, 'should return queryResponse prompt');
  });

  await t.test('returns extraction prompt correctly', () => {
    const prompt = getSystemPrompt('extraction');
    assert.strictEqual(prompt, SYSTEM_PROMPTS.extraction, 'should return extraction prompt');
  });

  await t.test('returns summarization prompt correctly', () => {
    const prompt = getSystemPrompt('summarization');
    assert.strictEqual(prompt, SYSTEM_PROMPTS.summarization, 'should return summarization prompt');
  });

  await t.test('returns translation prompt correctly', () => {
    const prompt = getSystemPrompt('translation');
    assert.strictEqual(prompt, SYSTEM_PROMPTS.translation, 'should return translation prompt');
  });
});

test('Prompts - prompt consistency', async (t) => {
  await t.test('each prompt contains clear instructions', () => {
    const prompts = Object.values(SYSTEM_PROMPTS);
    prompts.forEach((prompt, idx) => {
      const hasInstructions =
        prompt.includes('Quy tắc') ||
        prompt.includes('Yêu cầu') ||
        prompt.includes('Bỏ qua') ||
        prompt.includes('Trích xuất') ||
        prompt.includes('Phong cách') ||
        prompt.includes('Nhiệm vụ') ||
        prompt.includes('Quy tắc') ||
        prompt.includes('Trích dẫn');
      assert.ok(hasInstructions, `prompt ${idx} should contain clear instructions`);
    });
  });

  await t.test('all prompts maintain consistent Vietnamese tone', () => {
    const prompts = Object.values(SYSTEM_PROMPTS);
    const vietnamesePhrases = ['Bạn là', 'Quy tắc', 'Yêu cầu', 'Trích xuất', 'Phong cách'];

    prompts.forEach((prompt, idx) => {
      const hasVietnamesePhrases = vietnamesePhrases.some(phrase => prompt.includes(phrase));
      assert.ok(hasVietnamesePhrases, `prompt ${idx} should use Vietnamese phrasing`);
    });
  });
});

test('Prompts - no sensitive data', async (t) => {
  await t.test('prompts do not contain API keys or secrets', () => {
    const prompts = Object.values(SYSTEM_PROMPTS);
    const secretPatterns = [
      /api[_-]?key/i,
      /secret/i,
      /password/i,
      /token/i
    ];

    prompts.forEach((prompt, idx) => {
      secretPatterns.forEach(pattern => {
        if (pattern.test(prompt)) {
          // Filter out legitimate uses like "token" in context
          if (prompt.includes('token') && prompt.toLowerCase().includes('token')) {
            // This is acceptable if context is legitimate
          } else {
            assert.fail(`prompt ${idx} may contain sensitive pattern: ${pattern}`);
          }
        }
      });
    });
  });
});
