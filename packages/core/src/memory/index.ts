// Mem0 client - core memory operations
export {
  addMemory,
  searchMemories,
  getAllMemories,
  updateMemory,
  deleteMemory,
  getMemoryHistory,
  deleteAllMemories,
  isMemoryEnabled,
  getMemoryHealth,
  type MemoryItem,
  type MemoryHistoryEntry,
} from './mem0-client.js';

// Retriever helpers (wraps mem0 search + formatting)
export { searchRelevantMemories, formatMemoriesForPrompt } from './retriever.js';

// Message storage (audit trail only, not for memory)
export { storeMessage } from './storage.js';
