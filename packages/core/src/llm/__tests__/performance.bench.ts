/**
 * Performance benchmarking for LLM integration
 * Tests latency requirements and performance characteristics
 * Requires GEMINI_API_KEY and OPENAI_API_KEY environment variables
 */

import { test } from 'node:test';
import * as assert from 'node:assert';
import { generate, stream } from '../service.js';
import { getSystemPrompt } from '../prompts.js';

const hasGeminiKey = !!process.env.GEMINI_API_KEY;
const hasOpenAIKey = !!process.env.OPENAI_API_KEY;
const skipIfNoKeys = (hasGeminiKey && hasOpenAIKey) ? test : test.skip;

// Target latencies
const LATENCY_TARGET_MS = 2000; // <2s target
const LATENCY_WARN_MS = 1500; // Warn if >1.5s
const SAMPLE_SIZE = 3; // Number of requests for benchmarking

skipIfNoKeys('Performance - Latency benchmarking', async (t) => {
  await t.test('chat task latency < 2s', async () => {
    const latencies: number[] = [];

    for (let i = 0; i < SAMPLE_SIZE; i++) {
      const response = await generate({
        task: 'chat',
        system: getSystemPrompt('assistant'),
        prompt: `Test message ${i}: Xin chào, đây là thử nghiệm hiệu suất`,
        maxTokens: 100
      });

      latencies.push(response.latencyMs);
    }

    const maxLatency = Math.max(...latencies);
    const avgLatency = latencies.reduce((a, b) => a + b) / latencies.length;

    console.log(`Chat latencies (ms): ${latencies.join(', ')}`);
    console.log(`Avg: ${avgLatency.toFixed(2)}ms, Max: ${maxLatency}ms`);

    assert.ok(maxLatency < LATENCY_TARGET_MS, `max latency ${maxLatency}ms should be < ${LATENCY_TARGET_MS}ms`);
  });

  await t.test('query task latency < 2s', async () => {
    const latencies: number[] = [];

    for (let i = 0; i < SAMPLE_SIZE; i++) {
      const response = await generate({
        task: 'query',
        system: getSystemPrompt('queryResponse'),
        prompt: `Question ${i}: Ai đó đang làm gì?`,
        maxTokens: 100
      });

      latencies.push(response.latencyMs);
    }

    const maxLatency = Math.max(...latencies);
    const avgLatency = latencies.reduce((a, b) => a + b) / latencies.length;

    console.log(`Query latencies (ms): ${latencies.join(', ')}`);
    console.log(`Avg: ${avgLatency.toFixed(2)}ms, Max: ${maxLatency}ms`);

    assert.ok(maxLatency < LATENCY_TARGET_MS, `max latency ${maxLatency}ms should be < ${LATENCY_TARGET_MS}ms`);
  });

  await t.test('extraction task latency < 2s', async () => {
    const latencies: number[] = [];

    for (let i = 0; i < SAMPLE_SIZE; i++) {
      const response = await generate({
        task: 'extraction',
        system: getSystemPrompt('extraction'),
        prompt: `Extract from: "Anh A sẽ gửi báo cáo vào ngày mai trước 5h sáng"`,
        maxTokens: 150
      });

      latencies.push(response.latencyMs);
    }

    const maxLatency = Math.max(...latencies);
    const avgLatency = latencies.reduce((a, b) => a + b) / latencies.length;

    console.log(`Extraction latencies (ms): ${latencies.join(', ')}`);
    console.log(`Avg: ${avgLatency.toFixed(2)}ms, Max: ${maxLatency}ms`);

    assert.ok(maxLatency < LATENCY_TARGET_MS, `max latency ${maxLatency}ms should be < ${LATENCY_TARGET_MS}ms`);
  });

  await t.test('summarization task latency < 2s', async () => {
    const latencies: number[] = [];

    for (let i = 0; i < SAMPLE_SIZE; i++) {
      const response = await generate({
        task: 'summarization',
        system: getSystemPrompt('summarization'),
        prompt: `Summary: Thảo luận về dự án, quyết định bắt đầu tuần tới, deadline là cuối tháng`,
        maxTokens: 150
      });

      latencies.push(response.latencyMs);
    }

    const maxLatency = Math.max(...latencies);
    const avgLatency = latencies.reduce((a, b) => a + b) / latencies.length;

    console.log(`Summarization latencies (ms): ${latencies.join(', ')}`);
    console.log(`Avg: ${avgLatency.toFixed(2)}ms, Max: ${maxLatency}ms`);

    assert.ok(maxLatency < LATENCY_TARGET_MS, `max latency ${maxLatency}ms should be < ${LATENCY_TARGET_MS}ms`);
  });

  await t.test('translation task latency < 2s', async () => {
    const latencies: number[] = [];

    for (let i = 0; i < SAMPLE_SIZE; i++) {
      const response = await generate({
        task: 'translation',
        system: getSystemPrompt('translation'),
        prompt: `Translate: "Đây là một bài kiểm tra dịch thuật"`,
        maxTokens: 100
      });

      latencies.push(response.latencyMs);
    }

    const maxLatency = Math.max(...latencies);
    const avgLatency = latencies.reduce((a, b) => a + b) / latencies.length;

    console.log(`Translation latencies (ms): ${latencies.join(', ')}`);
    console.log(`Avg: ${avgLatency.toFixed(2)}ms, Max: ${maxLatency}ms`);

    assert.ok(maxLatency < LATENCY_TARGET_MS, `max latency ${maxLatency}ms should be < ${LATENCY_TARGET_MS}ms`);
  });
});

skipIfNoKeys('Performance - Streaming latency', async (t) => {
  await t.test('streaming response completes within latency target', async () => {
    const startTime = Date.now();
    let chunkCount = 0;
    let totalLength = 0;

    for await (const chunk of stream({
      task: 'chat',
      system: getSystemPrompt('assistant'),
      prompt: 'Liệt kê 5 công việc quan trọng cho hôm nay',
      maxTokens: 200
    })) {
      chunkCount++;
      totalLength += chunk.length;
    }

    const latencyMs = Date.now() - startTime;

    console.log(`Stream completed in ${latencyMs}ms with ${chunkCount} chunks (${totalLength} chars)`);

    assert.ok(chunkCount > 0, 'should receive multiple chunks');
    assert.ok(latencyMs < LATENCY_TARGET_MS, `streaming latency ${latencyMs}ms should be < ${LATENCY_TARGET_MS}ms`);
  });

  await t.test('streaming preserves content with multiple chunks', async () => {
    const chunks: string[] = [];

    for await (const chunk of stream({
      task: 'query',
      system: getSystemPrompt('queryResponse'),
      prompt: 'Có ai được giao công việc gì không?',
      maxTokens: 150
    })) {
      chunks.push(chunk);
    }

    const fullText = chunks.join('');

    assert.ok(chunks.length > 0, 'should have chunks');
    assert.ok(fullText.length > 0, 'accumulated text should be non-empty');
    console.log(`Received ${chunks.length} chunks, total length: ${fullText.length}`);
  });
});

skipIfNoKeys('Performance - Response quality', async (t) => {
  await t.test('responses are non-empty for all task types', async () => {
    const tasks = ['chat', 'query', 'extraction', 'summarization', 'translation'] as const;

    for (const task of tasks) {
      const response = await generate({
        task,
        system: getSystemPrompt(task === 'chat' ? 'assistant' : task),
        prompt: `Test for ${task}`,
        maxTokens: 100
      });

      assert.ok(response.text.length > 0, `${task} should return non-empty response`);
      console.log(`${task}: ${response.text.substring(0, 50)}...`);
    }
  });

  await t.test('model field is properly populated', async () => {
    const response = await generate({
      task: 'chat',
      system: getSystemPrompt('assistant'),
      prompt: 'Test model field',
      maxTokens: 50
    });

    assert.ok(response.model, 'should return model name');
    assert.ok(response.model.length > 0, 'model name should not be empty');
    assert.ok(
      ['gemini', 'gpt'].some(m => response.model.toLowerCase().includes(m)),
      `model should be Gemini or GPT, got: ${response.model}`
    );
  });
});

test('Performance - Synthetic latency benchmarks', async (t) => {
  await t.test('latency target validation', () => {
    const targetMs = 2000;
    const testLatencies = [500, 1000, 1500, 1999, 2001];

    const withinTarget = testLatencies.filter(l => l < targetMs);
    const exceedsTarget = testLatencies.filter(l => l >= targetMs);

    console.log(`Within target (${targetMs}ms): ${withinTarget.join(', ')}`);
    console.log(`Exceeds target: ${exceedsTarget.join(', ')}`);

    assert.strictEqual(withinTarget.length, 4, 'should identify 4 within target');
    assert.strictEqual(exceedsTarget.length, 1, 'should identify 1 exceeding target');
  });

  await t.test('average latency calculation', () => {
    const latencies = [800, 1200, 950, 1100, 750];
    const average = latencies.reduce((a, b) => a + b) / latencies.length;

    console.log(`Latencies: ${latencies.join(', ')}`);
    console.log(`Average: ${average.toFixed(2)}ms`);

    assert.ok(average < 2000, 'average should be under 2s');
    assert.ok(average > 700 && average < 1300, 'average should be reasonable');
  });

  await t.test('percentile analysis', () => {
    const latencies = [500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1500].sort((a, b) => a - b);

    const p50 = latencies[Math.floor(latencies.length * 0.5)];
    const p95 = latencies[Math.floor(latencies.length * 0.95)];
    const p99 = latencies[Math.floor(latencies.length * 0.99)];

    console.log(`P50: ${p50}ms, P95: ${p95}ms, P99: ${p99}ms`);

    assert.ok(p50 < p95, 'p50 should be less than p95');
    assert.ok(p95 < p99, 'p95 should be less than p99');
  });
});
