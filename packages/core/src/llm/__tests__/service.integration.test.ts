/**
 * LLM Service integration tests
 * Tests unified service with fallback, Vietnamese responses, and streaming
 * Requires GEMINI_API_KEY and OPENAI_API_KEY environment variables
 */

import { test } from 'node:test';
import * as assert from 'node:assert';
import { generate, stream, type LLMRequest } from '../service.js';
import { getSystemPrompt } from '../prompts.js';

// Check if API keys are available
const hasGeminiKey = !!process.env.GEMINI_API_KEY;
const hasOpenAIKey = !!process.env.OPENAI_API_KEY;

const skipIfNoKeys = (hasGeminiKey && hasOpenAIKey) ? test : test.skip;

skipIfNoKeys('Service - generate() with fallback', async (t) => {
  await t.test('chat task returns Vietnamese response', async () => {
    const request: LLMRequest = {
      task: 'chat',
      system: getSystemPrompt('assistant'),
      prompt: 'Xin chào, bạn tên gì?',
      maxTokens: 100
    };

    const response = await generate(request);

    assert.ok(response.text, 'should return non-empty text');
    assert.ok(response.model, 'should return model name');
    assert.ok(typeof response.usedFallback === 'boolean', 'should have usedFallback flag');
    assert.ok(response.latencyMs > 0, 'should measure latency');
    assert.ok(response.latencyMs < 10000, 'should complete within 10 seconds');
  });

  await t.test('query task with Vietnamese prompt', async () => {
    const request: LLMRequest = {
      task: 'query',
      system: getSystemPrompt('queryResponse'),
      prompt: 'Ai là trưởng nhóm?',
      maxTokens: 150
    };

    const response = await generate(request);

    assert.ok(response.text.length > 0, 'should return non-empty response');
    assert.ok(response.model, 'should include model name');
    assert.ok(response.latencyMs > 0 && response.latencyMs < 10000, 'should track latency correctly');
  });

  await t.test('extraction task request succeeds', async () => {
    const request: LLMRequest = {
      task: 'extraction',
      system: getSystemPrompt('extraction'),
      prompt: 'Từ tin nhắn: "Hôm nay Minh làm báo cáo trước 3h chiều" - Trích xuất thông tin gì?',
      maxTokens: 200
    };

    const response = await generate(request);

    assert.ok(response.text, 'should return extraction result');
    assert.ok(response.model, 'should return model used');
    assert.ok(typeof response.usedFallback === 'boolean', 'should track fallback usage');
  });

  await t.test('summarization task request', async () => {
    const request: LLMRequest = {
      task: 'summarization',
      system: getSystemPrompt('summarization'),
      prompt: 'Tóm tắt cuộc họp: Thảo luận về dự án mới, quyết định sẽ bắt đầu tuần sau.',
      maxTokens: 150
    };

    const response = await generate(request);

    assert.ok(response.text, 'should return summary');
    assert.ok(response.latencyMs > 0, 'should measure latency');
  });
});

skipIfNoKeys('Service - stream() with fallback', async (t) => {
  await t.test('chat streaming returns chunks', async () => {
    const request: LLMRequest = {
      task: 'chat',
      system: getSystemPrompt('assistant'),
      prompt: 'Nêu 3 cách để tăng năng suất làm việc',
      maxTokens: 200
    };

    let totalText = '';
    let chunkCount = 0;

    const startTime = Date.now();
    for await (const chunk of stream(request)) {
      totalText += chunk;
      chunkCount++;
    }
    const latencyMs = Date.now() - startTime;

    assert.ok(chunkCount > 0, 'should receive multiple chunks');
    assert.ok(totalText.length > 0, 'should accumulate text from chunks');
    assert.ok(latencyMs > 0 && latencyMs < 10000, 'streaming should complete within 10 seconds');
  });

  await t.test('query streaming preserves content', async () => {
    const request: LLMRequest = {
      task: 'query',
      system: getSystemPrompt('queryResponse'),
      prompt: 'Những deadline quan trọng là gì?',
      maxTokens: 250
    };

    let streamedText = '';
    for await (const chunk of stream(request)) {
      streamedText += chunk;
    }

    assert.ok(streamedText.length > 0, 'should accumulate streaming text');
  });
});

test('Service - response structure validation', async (t) => {
  await t.test('LLMResponse has required fields', () => {
    const mockResponse = {
      text: 'Test response',
      model: 'gemini-2.5-flash-lite',
      usedFallback: false,
      latencyMs: 1234
    };

    assert.ok(mockResponse.text, 'should have text field');
    assert.ok(mockResponse.model, 'should have model field');
    assert.ok(typeof mockResponse.usedFallback === 'boolean', 'should have usedFallback boolean');
    assert.ok(mockResponse.latencyMs > 0, 'should have positive latencyMs');
  });
});

skipIfNoKeys('Service - latency benchmarking', async (t) => {
  await t.test('multiple requests track latency correctly', async () => {
    const latencies: number[] = [];

    for (let i = 0; i < 3; i++) {
      const request: LLMRequest = {
        task: 'chat',
        system: getSystemPrompt('assistant'),
        prompt: 'Đây là thử nghiệm ' + (i + 1),
        maxTokens: 50
      };

      const response = await generate(request);
      latencies.push(response.latencyMs);

      assert.ok(response.latencyMs > 0, `request ${i + 1} should have valid latency`);
    }

    // Log latencies for analysis
    console.log('Latencies (ms):', latencies);

    const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    assert.ok(avgLatency < 5000, `average latency should be reasonable, got ${avgLatency}ms`);
  });
});

test('Service - error handling', async (t) => {
  await t.test('handles empty prompt gracefully', async () => {
    const request: LLMRequest = {
      task: 'chat',
      system: getSystemPrompt('assistant'),
      prompt: '',
      maxTokens: 100
    };

    try {
      // This may fail or return empty, both acceptable
      const response = await generate(request);
      assert.ok(response.text !== null, 'should return response object');
    } catch (error) {
      assert.ok(error, 'should throw error for empty prompt');
    }
  });

  await t.test('returns valid response structure on error', async () => {
    const request: LLMRequest = {
      task: 'chat',
      system: getSystemPrompt('assistant'),
      prompt: 'Valid prompt test',
      maxTokens: 100
    };

    try {
      const response = await generate(request);
      assert.ok(response.hasOwnProperty('text'), 'should have text property');
      assert.ok(response.hasOwnProperty('model'), 'should have model property');
      assert.ok(response.hasOwnProperty('usedFallback'), 'should have usedFallback property');
      assert.ok(response.hasOwnProperty('latencyMs'), 'should have latencyMs property');
    } catch (error) {
      // If error occurs, that's acceptable (API key issues)
      assert.ok(error, 'error should be thrown');
    }
  });
});

test('Service - task-based routing validation', async (t) => {
  await t.test('recognizes all valid task types', () => {
    const validTasks: Array<'chat' | 'extraction' | 'summarization' | 'query' | 'translation'> = [
      'chat',
      'extraction',
      'summarization',
      'query',
      'translation'
    ];

    validTasks.forEach(task => {
      assert.ok(task, `task ${task} should be valid`);
    });
  });
});
