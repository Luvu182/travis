// Provider and models
export { models, selectModel, getFallback, getModelName, type TaskType } from './provider.js';

// Gemini client
export { generate as generateGemini, stream as streamGemini } from './gemini.js';

// OpenAI client
export { generate as generateOpenAI, stream as streamOpenAI, generateStructured } from './openai.js';

// Unified service with fallback
export { generate, stream, type LLMRequest, type LLMResponse } from './service.js';

// Vietnamese prompts
export { SYSTEM_PROMPTS, getSystemPrompt } from './prompts.js';
