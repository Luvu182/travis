// Embeddings
export { embedText, embedBatch, cosineSimilarity } from './embeddings.js';

// Extraction
export {
  extractInfo,
  extractBatch,
  normalizeDueDate,
  extractedInfoSchema,
  type ExtractedInfo,
  type ExtractedItem,
} from './extractor.js';

// Storage
export { storeExtractedInfo, storeMemory, storeBatch } from './storage.js';

// Retrieval
export {
  searchExtractedInfo,
  searchMemory,
  getRecentExtractedInfo,
  searchTasksByAssignee,
  searchUpcomingDeadlines,
  multiSearch,
  type MemorySearchResult,
} from './retriever.js';
