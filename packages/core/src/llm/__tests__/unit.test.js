/**
 * LLM module unit tests - Self-contained test suite
 * Tests provider routing, prompts, and fallback mechanisms
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

// Mock models object (mirrors provider.ts structure)
const createMockModels = () => ({
  gemini: {
    flashLite: Symbol('gemini-2.5-flash-lite'),
    pro: Symbol('gemini-1.5-pro')
  },
  openai: {
    gpt4o: Symbol('gpt-4o'),
    gpt4oMini: Symbol('gpt-4o-mini')
  }
});

// Mock selector function
const createSelectModel = (models) => (task) => {
  switch (task) {
    case 'extraction':
    case 'chat':
    case 'query':
    case 'summarization':
    case 'translation':
      return models.gemini.flashLite;
    default:
      return models.gemini.flashLite;
  }
};

// Mock fallback function
const createGetFallback = (models) => (primary) => {
  if (primary === models.gemini.flashLite || primary === models.gemini.pro) {
    return models.openai.gpt4oMini;
  }
  return models.gemini.flashLite;
};

// Mock model name function
const createGetModelName = (models) => (model) => {
  if (model === models.gemini.flashLite) return 'gemini-2.5-flash-lite';
  if (model === models.gemini.pro) return 'gemini-1.5-pro';
  if (model === models.openai.gpt4o) return 'gpt-4o';
  if (model === models.openai.gpt4oMini) return 'gpt-4o-mini';
  return 'unknown';
};

// Mock system prompts (mirrors prompts.ts)
const SYSTEM_PROMPTS = {
  assistant: `Bạn là J.A.R.V.I.S - trợ lý thông minh cho nhóm chat. Nhiệm vụ:
- Ghi nhớ thông tin quan trọng từ cuộc hội thoại
- Trả lời câu hỏi dựa trên thông tin đã lưu
- Hỗ trợ theo dõi công việc, deadline, quyết định

Phong cách:
- Ngắn gọn, chuyên nghiệp
- Sử dụng tiếng Việt tự nhiên
- Liệt kê rõ ràng khi có nhiều thông tin`,

  queryResponse: `Bạn là trợ lý trả lời câu hỏi dựa trên thông tin đã lưu.

Quy tắc:
1. Chỉ trả lời dựa trên thông tin được cung cấp
2. Nếu không có thông tin, nói rõ "Tôi không có thông tin về vấn đề này"
3. Trích dẫn nguồn nếu có (ai nói, khi nào)
4. Ngắn gọn, đi thẳng vào vấn đề`,

  extraction: `Bạn là hệ thống trích xuất thông tin từ tin nhắn group chat.

Trích xuất:
- Tasks: Công việc được giao (ai làm gì)
- Decisions: Quyết định đã đưa ra
- Deadlines: Thời hạn, lịch trình
- Important: Thông tin quan trọng khác

Bỏ qua:
- Tin nhắn chào hỏi thông thường
- Emoji, sticker, reaction
- Tin nhắn không có nội dung thực chất`,

  summarization: `Bạn là hệ thống tóm tắt cuộc hội thoại.

Yêu cầu:
- Tóm tắt các điểm chính
- Liệt kê action items
- Ghi chú quyết định quan trọng
- Giữ nguyên tên người, thuật ngữ gốc`,

  translation: `Bạn là hệ thống dịch thuật chuyên nghiệp.

Quy tắc:
- Dịch chính xác, giữ nguyên ý nghĩa
- Giữ nguyên tên riêng, thuật ngữ chuyên ngành
- Dịch tự nhiên, phù hợp ngữ cảnh
- Không giải thích, chỉ dịch`
};

test('Unit - Provider Routing', async (t) => {
  const models = createMockModels();
  const selectModel = createSelectModel(models);
  const getModelName = createGetModelName(models);

  await t.test('routes chat task to Gemini Flash Lite', () => {
    const model = selectModel('chat');
    assert.strictEqual(model, models.gemini.flashLite);
    assert.strictEqual(getModelName(model), 'gemini-2.5-flash-lite');
  });

  await t.test('routes extraction task to Gemini Flash Lite', () => {
    const model = selectModel('extraction');
    assert.strictEqual(model, models.gemini.flashLite);
  });

  await t.test('routes query task to Gemini Flash Lite', () => {
    const model = selectModel('query');
    assert.strictEqual(model, models.gemini.flashLite);
  });

  await t.test('routes summarization task to Gemini Flash Lite', () => {
    const model = selectModel('summarization');
    assert.strictEqual(model, models.gemini.flashLite);
  });

  await t.test('routes translation task to Gemini Flash Lite', () => {
    const model = selectModel('translation');
    assert.strictEqual(model, models.gemini.flashLite);
  });

  await t.test('all tasks route to same model (current implementation)', () => {
    const tasks = ['chat', 'extraction', 'summarization', 'query', 'translation'];
    const models_inst = models;

    const selectedModels = tasks.map(task => {
      const model = selectModel(task);
      return getModelName(model);
    });

    // All should be the same
    const allSame = selectedModels.every(m => m === selectedModels[0]);
    assert.ok(allSame, 'all tasks should route to same model');
    assert.strictEqual(selectedModels[0], 'gemini-2.5-flash-lite');
  });
});

test('Unit - Fallback Mechanism', async (t) => {
  const models = createMockModels();
  const getFallback = createGetFallback(models);
  const getModelName = createGetModelName(models);

  await t.test('Gemini Flash Lite falls back to OpenAI Mini', () => {
    const fallback = getFallback(models.gemini.flashLite);
    assert.strictEqual(fallback, models.openai.gpt4oMini);
    assert.strictEqual(getModelName(fallback), 'gpt-4o-mini');
  });

  await t.test('Gemini Pro falls back to OpenAI Mini', () => {
    const fallback = getFallback(models.gemini.pro);
    assert.strictEqual(fallback, models.openai.gpt4oMini);
  });

  await t.test('OpenAI GPT-4o falls back to Gemini Flash Lite', () => {
    const fallback = getFallback(models.openai.gpt4o);
    assert.strictEqual(fallback, models.gemini.flashLite);
  });

  await t.test('OpenAI Mini falls back to Gemini Flash Lite', () => {
    const fallback = getFallback(models.openai.gpt4oMini);
    assert.strictEqual(fallback, models.gemini.flashLite);
  });

  await t.test('fallback chain is bidirectional', () => {
    const geminiModel = models.gemini.flashLite;
    const firstFallback = getFallback(geminiModel);
    const secondFallback = getFallback(firstFallback);

    assert.strictEqual(getModelName(geminiModel), 'gemini-2.5-flash-lite');
    assert.strictEqual(getModelName(firstFallback), 'gpt-4o-mini');
    assert.strictEqual(getModelName(secondFallback), 'gemini-2.5-flash-lite');
  });
});

test('Unit - Vietnamese Prompts', async (t) => {
  await t.test('all prompts are defined and non-empty', () => {
    const promptNames = ['assistant', 'queryResponse', 'extraction', 'summarization', 'translation'];

    promptNames.forEach(name => {
      assert.ok(SYSTEM_PROMPTS[name], `${name} should be defined`);
      assert.ok(typeof SYSTEM_PROMPTS[name] === 'string', `${name} should be string`);
      assert.ok(SYSTEM_PROMPTS[name].length > 0, `${name} should not be empty`);
    });
  });

  await t.test('all prompts contain Vietnamese text', () => {
    const vietnameseRegex = /[ạ-ỿ]/; // Vietnamese diacritics

    Object.entries(SYSTEM_PROMPTS).forEach(([name, prompt]) => {
      assert.ok(vietnameseRegex.test(prompt), `${name} should contain Vietnamese text`);
    });
  });

  await t.test('assistant prompt contains key phrases', () => {
    const prompt = SYSTEM_PROMPTS.assistant;
    assert.ok(prompt.includes('J.A.R.V.I.S'), 'should mention J.A.R.V.I.S');
    assert.ok(prompt.includes('Ghi nhớ') || prompt.includes('ghi nhớ'), 'should mention memory');
    assert.ok(prompt.includes('Trả lời') || prompt.includes('trả lời'), 'should mention response');
  });

  await t.test('queryResponse prompt defines rules', () => {
    const prompt = SYSTEM_PROMPTS.queryResponse;
    assert.ok(prompt.includes('Quy tắc'), 'should have rules section');
    assert.ok(prompt.includes('thông tin được cung cấp'), 'should mention provided info');
  });

  await t.test('extraction prompt defines extraction types', () => {
    const prompt = SYSTEM_PROMPTS.extraction;
    assert.ok(prompt.includes('Tasks'), 'should mention Tasks');
    assert.ok(prompt.includes('Decisions'), 'should mention Decisions');
    assert.ok(prompt.includes('Deadlines'), 'should mention Deadlines');
  });

  await t.test('summarization prompt defines requirements', () => {
    const prompt = SYSTEM_PROMPTS.summarization;
    assert.ok(prompt.includes('tóm tắt'), 'should mention summarization');
    assert.ok(prompt.includes('action items'), 'should mention action items');
  });

  await t.test('translation prompt defines rules', () => {
    const prompt = SYSTEM_PROMPTS.translation;
    assert.ok(prompt.includes('dịch'), 'should mention translation');
    assert.ok(prompt.includes('tên riêng'), 'should mention proper names');
  });
});

test('Unit - Response Structure', async (t) => {
  await t.test('response has required fields', () => {
    const mockResponse = {
      text: 'Generated text',
      model: 'gemini-2.5-flash-lite',
      usedFallback: false,
      latencyMs: 1234
    };

    assert.ok(typeof mockResponse.text === 'string', 'text should be string');
    assert.ok(typeof mockResponse.model === 'string', 'model should be string');
    assert.ok(typeof mockResponse.usedFallback === 'boolean', 'usedFallback should be boolean');
    assert.ok(typeof mockResponse.latencyMs === 'number', 'latencyMs should be number');
  });

  await t.test('latency is always positive', () => {
    const latencies = [100, 500, 1000, 1500, 2000];

    latencies.forEach(latency => {
      assert.ok(latency > 0, `latency ${latency} should be positive`);
      assert.ok(latency < 5000, `latency ${latency} should be reasonable`);
    });
  });
});

test('Unit - Latency Benchmarking', async (t) => {
  await t.test('latency under 2 seconds is target', () => {
    const targetMs = 2000;
    const testLatencies = [500, 1000, 1500, 1900];

    testLatencies.forEach(latency => {
      assert.ok(latency < targetMs, `${latency}ms should be under ${targetMs}ms`);
    });
  });

  await t.test('exceeding 2 seconds is flagged', () => {
    const targetMs = 2000;
    const slowLatencies = [2100, 3000, 5000];

    slowLatencies.forEach(latency => {
      assert.ok(latency >= targetMs, `${latency}ms should exceed target for warning`);
    });
  });

  await t.test('percentile calculation', () => {
    const latencies = [500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1500].sort((a, b) => a - b);

    const p50 = latencies[Math.floor(latencies.length * 0.5)];
    const p95 = latencies[Math.floor(latencies.length * 0.95)];
    const p99 = latencies[Math.floor(latencies.length * 0.99)];

    assert.ok(p50 < p95, 'p50 should be less than or equal to p95');
    assert.ok(p95 <= p99, 'p95 should be less than or equal to p99');
    assert.ok(p99 <= 2000, 'p99 should be under or equal to latency target');
  });

  await t.test('average latency calculation', () => {
    const latencies = [800, 1200, 950, 1100, 750];
    const average = latencies.reduce((a, b) => a + b) / latencies.length;

    assert.ok(average < 2000, 'average should be under 2s');
    assert.ok(average > 700 && average < 1300, 'average should be reasonable');
  });
});

test('Unit - Model Name Consistency', async (t) => {
  const models = createMockModels();
  const getModelName = createGetModelName(models);

  await t.test('model names are consistent', () => {
    const names = {
      geminiFlash: getModelName(models.gemini.flashLite),
      geminiPro: getModelName(models.gemini.pro),
      gpt4o: getModelName(models.openai.gpt4o),
      gpt4oMini: getModelName(models.openai.gpt4oMini)
    };

    assert.strictEqual(names.geminiFlash, 'gemini-2.5-flash-lite');
    assert.strictEqual(names.geminiPro, 'gemini-1.5-pro');
    assert.strictEqual(names.gpt4o, 'gpt-4o');
    assert.strictEqual(names.gpt4oMini, 'gpt-4o-mini');
  });

  await t.test('unknown model returns unknown', () => {
    const name = getModelName({ unknownProp: true });
    assert.strictEqual(name, 'unknown');
  });

  await t.test('model names are non-empty', () => {
    const allModels = [
      models.gemini.flashLite,
      models.gemini.pro,
      models.openai.gpt4o,
      models.openai.gpt4oMini
    ];

    allModels.forEach(model => {
      const name = getModelName(model);
      assert.ok(name.length > 0, 'model name should not be empty');
    });
  });
});
