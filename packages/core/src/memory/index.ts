// Mem0 client - core memory operations
export {
  memory,
  addMemory,
  searchMemories,
  getAllMemories,
  updateMemory,
  deleteMemory,
  type MemoryItem,
} from './mem0-client.js';

// Simplified extractor (delegates to mem0)
export { extractAndStore } from './extractor.js';

// Simplified retriever (wraps mem0 search)
export { searchRelevantMemories, formatMemoriesForPrompt } from './retriever.js';

// Message storage (audit trail only, not for memory)
export { storeMessage } from './storage.js';
