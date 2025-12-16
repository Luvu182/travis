# LuxBot - Code Standards & Architecture

**Last Updated:** 2025-12-16
**Phase:** 03 - Memory Layer Implementation
**Document Version:** 1.1

## Project Standards

### Language & Runtime
- **Primary Language:** TypeScript 5.0+
- **Target Runtime:** Node.js 18+
- **Strict Mode:** Enabled (`strict: true` in tsconfig.json)

### Code Quality Tools
- **Linter:** ESLint (configured)
- **Formatter:** Prettier 3.7.4
- **Package Manager:** pnpm (workspaces)
- **Build Tool:** TypeScript Compiler
- **Test Framework:** (To be configured)

## Monorepo Structure

### Organization Pattern (Turborepo)

```
luxbot/
├── apps/
│   └── api/                    # Hono API server
│       ├── src/
│       │   ├── index.ts        # Server entry point
│       │   ├── routes/         # Endpoint handlers
│       │   └── middleware/     # Request/response middleware
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   ├── config/                 # Configuration management
│   │   ├── src/
│   │   │   └── index.ts        # Env validation
│   │   └── package.json
│   │
│   ├── db/                     # Database layer
│   │   ├── src/
│   │   │   ├── index.ts        # Main exports
│   │   │   ├── schema.ts       # Drizzle ORM schema
│   │   │   ├── client.ts       # Connection management
│   │   │   └── operations.ts   # CRUD operations
│   │   ├── drizzle.config.ts   # Drizzle configuration
│   │   └── package.json
│   │
│   └── core/                   # AI & memory logic
│       ├── src/
│       │   ├── index.ts        # Main exports
│       │   └── memory/         # Memory Layer (Phase 03)
│       │       ├── index.ts    # Barrel exports
│       │       ├── embeddings.ts  # 768D Gemini embeddings
│       │       ├── extractor.ts   # Vietnamese extraction
│       │       ├── storage.ts     # Storage with embeddings
│       │       └── retriever.ts   # Semantic search
│       └── package.json
│
├── docker/                     # Container configurations
│   └── docker-compose.dev.yml  # Development PostgreSQL + pgvector
│
├── .claude/                    # Claude workflows
│   └── workflows/
│
├── docs/                       # Project documentation
│   ├── codebase-summary.md
│   ├── system-architecture.md
│   ├── code-standards.md
│   └── project-overview-pdr.md
│
├── README.md
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

## TypeScript Configuration

### Compiler Options (tsconfig.json)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "moduleResolution": "node"
  }
}
```

## Naming Conventions

### Files & Directories
- **Directories:** kebab-case (lowercase with hyphens)
  - ✓ `packages/db/src/operations.ts`
  - ✗ `packages/DB/src/Operations.ts`

- **Files:** kebab-case for exports, index.ts for package entry
  - ✓ `client.ts`, `operations.ts`, `schema.ts`
  - ✗ `Database.ts`, `CRUDOps.ts`

- **API Routes:** kebab-case in URL paths
  - ✓ `/webhook/telegram`, `/health`
  - ✗ `/webhookTelegram`, `/Health`

### Variables & Functions
- **Constants:** UPPER_SNAKE_CASE
  - ✓ `MAX_POOL_CONNECTIONS`, `DEFAULT_LIMIT`
  - ✗ `maxPoolConnections`, `MaxPoolConnections`

- **Variables:** camelCase
  - ✓ `groupId`, `platformGroupId`, `userEmbedding`
  - ✗ `group_id`, `GroupId`, `GROUP_ID`

- **Functions:** camelCase
  - ✓ `upsertGroup()`, `searchByVector()`, `saveMessage()`
  - ✗ `upsert_group()`, `SearchByVector()`, `SAVE_MESSAGE()`

- **Classes:** PascalCase
  - ✓ `DatabaseClient`, `MemoryManager`
  - ✗ `databaseClient`, `memory_manager`

- **Types/Interfaces:** PascalCase
  - ✓ `type Group = {}`, `interface User {}`
  - ✗ `type group = {}`, `interface user {}`

- **Enums:** PascalCase with PascalCase members
  - ✓ `enum InfoType { Task, Decision }`
  - ✗ `enum info_type { task, decision }`

### Database Field Naming
- **Column Names:** snake_case in database
  - ✓ `platform_group_id`, `display_name`, `created_at`
  - ✗ `platformGroupId`, `displayName`, `createdAt`

- **Drizzle ORM (TypeScript):** camelCase in code
  - ✓ `platformGroupId: varchar('platform_group_id')`
  - ✗ `platform_group_id: varchar('platformGroupId')`

- **Table Names:** snake_case, plural
  - ✓ `groups`, `users`, `messages`, `extracted_info`
  - ✗ `Group`, `user`, `message`, `extractedinfo`

## Code Style Guidelines

### Imports Organization
1. External packages (node built-ins, npm packages)
2. Internal packages (monorepo imports)
3. Local imports (relative paths)

```typescript
// External packages
import { pgTable, varchar } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import postgres from 'postgres';

// Internal packages
import { env } from '@travis/config';
import * as schema from './schema.js';

// Local imports
import type { Group } from './schema.js';
```

### File Extensions
- **ESM imports:** Use `.js` extension for relative imports
  - ✓ `import { db } from './client.js';`
  - ✗ `import { db } from './client';`

- **Reason:** TypeScript compilation to ESM requires explicit extensions

### Function Signatures
```typescript
// Proper format with JSDoc
/**
 * Retrieve group by platform identifier
 * @param platform - Telegram or Lark
 * @param platformGroupId - External group ID
 * @returns Group or null if not found
 */
export async function getGroupByPlatformId(
  platform: 'telegram' | 'lark',
  platformGroupId: string
): Promise<Group | null> {
  // Implementation
}
```

### Type Definitions
```typescript
// Prefer interfaces for objects
interface User {
  id: string;
  platform: 'telegram' | 'lark';
  platformUserId: string;
}

// Use types for unions/functions
type Platform = 'telegram' | 'lark';
type InfoType = 'task' | 'decision' | 'deadline' | 'important' | 'general';

// Drizzle inferred types
type Group = typeof groups.$inferSelect;
type NewGroup = typeof groups.$inferInsert;
```

## Database Layer Conventions

### Schema Definition (Drizzle ORM)

```typescript
import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
  pgEnum,
  uniqueIndex,
  index,
  vector,
} from 'drizzle-orm/pg-core';

// 1. Define enums first
export const platformEnum = pgEnum('platform_type', ['telegram', 'lark']);

// 2. Define tables with inline indexes
export const groups = pgTable(
  'groups',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    platform: platformEnum('platform').notNull(),
    platformGroupId: varchar('platform_group_id', { length: 255 }).notNull(),
    name: varchar('name', { length: 255 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    metadata: jsonb('metadata').default({}),
  },
  (table) => ({
    platformGroupUnique: uniqueIndex('idx_groups_platform_group')
      .on(table.platform, table.platformGroupId),
  })
);

// 3. Export inferred types
export type Group = typeof groups.$inferSelect;
export type NewGroup = typeof groups.$inferInsert;
```

### Indexing Strategy

**Unique Indexes (Data Integrity):**
```typescript
uniqueIndex('idx_groups_platform_group').on(table.platform, table.platformGroupId)
```
Purpose: Enforce unique platform ID combinations

**Composite Indexes (Query Optimization):**
```typescript
index('idx_messages_group_created').on(table.groupId, table.createdAt)
```
Purpose: Optimize queries on both columns

**Single Column Indexes (Filtering):**
```typescript
index('idx_extracted_info_type').on(table.infoType)
```
Purpose: Fast filtering by single field

### Vector Operations Best Practices

```typescript
// Validation
if (!Array.isArray(embedding) || embedding.length !== 1536) {
  throw new Error('Invalid embedding: must be array of 1536 numbers');
}

// Safe parameterization
const embeddingStr = `[${embedding.join(',')}]`;
const result = await db.execute(sql`
  SELECT id, content, 1 - (embedding <=> ${embeddingStr}::vector) as similarity
  FROM extracted_info
  WHERE embedding IS NOT NULL
  ORDER BY embedding <=> ${embeddingStr}::vector
  LIMIT ${limit}
`);
```

## Operations Layer Conventions

### CRUD Operation Pattern

```typescript
// Upsert pattern (insert or update)
export async function upsertGroup(data: {
  platform: 'telegram' | 'lark';
  platformGroupId: string;
  name?: string;
  metadata?: Record<string, unknown>;
}) {
  const result = await db
    .insert(groups)
    .values({
      platform: data.platform,
      platformGroupId: data.platformGroupId,
      name: data.name,
      metadata: data.metadata,
    })
    .onConflictDoUpdate({
      target: [groups.platform, groups.platformGroupId],
      set: {
        name: sql`COALESCE(EXCLUDED.name, ${groups.name})`,
        updatedAt: new Date(),
      },
    })
    .returning();

  return result[0];
}

// Query pattern (read)
export async function getGroupByPlatformId(
  platform: 'telegram' | 'lark',
  platformGroupId: string
) {
  const result = await db
    .select()
    .from(groups)
    .where(and(eq(groups.platform, platform), eq(groups.platformGroupId, platformGroupId)))
    .limit(1);

  return result[0] || null;
}
```

## Error Handling

### Function-level Errors
```typescript
export async function searchByVector(
  embedding: number[],
  options: {
    groupId?: string;
    type?: InfoType;
    limit?: number;
    minSimilarity?: number;
  } = {}
) {
  // Validate input early
  if (!Array.isArray(embedding) || embedding.length !== 1536) {
    throw new Error('Invalid embedding: must be array of 1536 numbers');
  }

  if (!embedding.every(n => typeof n === 'number' && !isNaN(n))) {
    throw new Error('Invalid embedding: all elements must be valid numbers');
  }

  // Proceed with operation
  // ...
}
```

### Connection Errors
```typescript
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    if (!_client) {
      getDb();
    }
    await _client!`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}
```

## Testing Conventions

### Test File Organization
```
packages/db/
├── src/
│   ├── schema.ts
│   ├── client.ts
│   └── operations.ts
└── tests/
    ├── schema.test.ts
    ├── client.test.ts
    ├── operations.test.ts
    └── fixtures/
        └── sample-data.ts
```

### Naming Pattern
- Test files: `.test.ts` suffix
- Describe blocks: Component/function name
- Test cases: Action + expected result

```typescript
describe('searchByVector', () => {
  it('should return results within similarity threshold', async () => {
    // Test implementation
  });

  it('should throw error on invalid embedding dimension', async () => {
    // Error case
  });
});
```

## Documentation Standards

### Code Comments
- **Why, not what:** Explain design decisions, not obvious code
- **Before complex logic:** Add context for algorithms
- **Avoid:** Comments that restate code

```typescript
// Bad
const result = db.select(); // Select from database

// Good
// Use lazy initialization to avoid unnecessary DB connections in serverless
let _db: ReturnType<typeof drizzle> | null = null;
```

### JSDoc Comments
```typescript
/**
 * Upsert group, creating if not exists or updating if exists
 * @param data - Group data including platform and external ID
 * @param data.platform - Platform identifier (telegram or lark)
 * @param data.platformGroupId - External group ID from platform
 * @param data.name - Optional display name
 * @param data.metadata - Optional platform-specific metadata
 * @returns Created or updated group record
 * @throws Error if database operation fails
 */
export async function upsertGroup(data: {
  platform: 'telegram' | 'lark';
  platformGroupId: string;
  name?: string;
  metadata?: Record<string, unknown>;
}): Promise<Group> {
  // Implementation
}
```

## Environment Configuration

### Variable Naming (env variables)
- UPPERCASE_SNAKE_CASE
- Grouped by feature
- Descriptive and unambiguous

```bash
# Database
DATABASE_URL=postgresql://...

# Telegram
TELEGRAM_BOT_TOKEN=...

# Lark Suite
LARK_APP_ID=...
LARK_APP_SECRET=...

# LLMs
GEMINI_API_KEY=...
OPENAI_API_KEY=...

# Deployment
NODE_ENV=development|production
WEBHOOK_DOMAIN=https://...
```

### Config Validation
```typescript
import { z } from 'zod'; // If using Zod

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  TELEGRAM_BOT_TOKEN: z.string().min(10),
  GEMINI_API_KEY: z.string().min(10),
  NODE_ENV: z.enum(['development', 'production']).default('development'),
});

export const env = envSchema.parse(process.env);
```

## Package Management

### Workspace Dependencies
```json
// Root package.json
{
  "workspaces": [
    "apps/*",
    "packages/*"
  ]
}
```

### Internal Dependencies
```json
// packages/db/package.json
{
  "dependencies": {
    "@travis/config": "workspace:*"
  }
}
```

**Import path:** `@travis/config`

### External Dependencies
- Keep versions in sync across monorepo
- Use exact versions for databases (postgres, drizzle-orm)
- Allow patch versions for utilities

## Performance Standards

### Query Optimization
1. **Add indexes before querying**
   - Composite indexes for multi-column WHERE clauses
   - Partial indexes for filtered tables

2. **Limit result sets**
   - Always use LIMIT in queries
   - Default: 10-20 results
   - Configurable for API consumers

3. **Vector search efficiency**
   - Validate embeddings before query
   - Use similarity threshold to filter
   - Add HNSW indexes at scale

### Connection Pooling
```typescript
// Development: 1 connection (testing)
max: 1

// Production: 20 connections (concurrent requests)
max: 20
```

### Lazy Initialization
```typescript
// Only initialize when needed, prevent unnecessary connections
let _db: ReturnType<typeof drizzle> | null = null;

if (!_db) {
  _db = drizzle(_client, { schema });
}
```

## Security Standards

### Input Validation
- All user inputs validated before database operations
- Type checking at compile time (TypeScript)
- Runtime validation for untrusted data

### SQL Safety
- Parameterized queries (Drizzle ORM provides)
- Avoid raw SQL except for complex queries (vector search)
- Use parameterization for all raw SQL

```typescript
// Safe: parameterized
const result = await db.execute(sql`
  SELECT * FROM extracted_info
  WHERE group_id = ${groupId}::uuid
`);

// Unsafe: string concatenation
const result = await db.query(`SELECT * FROM extracted_info WHERE group_id = '${groupId}'`);
```

### Secrets Management
- Never commit .env files
- Use .env.example for reference
- Environment variables validated on startup
- No secrets in logs

## Deployment Standards

### Build Process
```bash
# Type check
pnpm typecheck

# Lint
pnpm lint

# Format
pnpm format

# Build
pnpm build

# Test (when configured)
pnpm test
```

### Version Management
- Semantic versioning for packages
- Single source of truth for version (package.json)
- Tag releases in git

### Database Migrations
- Drizzle ORM migration files tracked in git
- Test migrations in staging before production
- Always backup before running migrations

## Memory Layer Standards (Phase 03)

### Embedding Vector Handling
- **Dimension:** 768 (Gemini text-embedding-004)
- **Validation:** Always verify array length before operations
- **Storage:** Pass arrays directly to pgvector type
- **Similarity:** Use cosineSimilarity() for manual calculations

```typescript
// Validate before search
if (!Array.isArray(embedding) || embedding.length !== 768) {
  throw new Error('Invalid embedding: must be 768D array');
}

// Safe storage pattern
const embedding = await embedText(content);
await storeExtractedInfo({ messageId, groupId, items });
```

### Extraction Confidence
- **Threshold:** Filter items with confidence ≥0.7
- **Range:** All scores 0.0-1.0
- **Storage:** Include confidence in metadata
- **Filtering:** Already applied in extractInfo()

```typescript
// Extraction automatically filters <0.7
const items = await extractInfo(message);
// items only contain confidence ≥0.7 items
console.log(items[0].confidence); // Always ≥0.7
```

### Vietnamese Language Handling
- **Extraction Prompt:** Optimized for Vietnamese group chats
- **Date Formats:** Support Vietnamese date expressions
- **Names:** Store original names without normalization
- **Context:** Include previous messages for clarity

```typescript
// Vietnamese-aware extraction
const items = await extractInfo(
  'Hoàn thành file report đến ngày 25/12',
  { senderName: 'Quang', groupName: 'Dev Team' }
);
// Automatically handles Vietnamese context
```

### Multi-Search Deduplication
- **Strategy:** Keep highest similarity per ID
- **Sorting:** Final results sorted by similarity (descending)
- **Limit:** Applied after deduplication

```typescript
// Multi-search returns deduplicated results
const combined = await multiSearch(['query1', 'query2'], { limit: 5 });
// Returns top 5 unique items by similarity
```

## Future Standards (Post-Phase-03)

### Testing Framework
- Jest or Vitest for unit tests
- Test coverage minimum: 70%
- Integration tests for memory layer operations
- Extraction confidence benchmarking

### Linting Rules
- ESLint configuration standardized
- Prettier formatting enforced in CI/CD

### Documentation Generation
- API documentation from JSDoc
- Markdown generation from TypeScript types

### Performance Monitoring
- Embedding generation latency tracking
- Vector search performance profiling
- Extraction confidence statistics
- Memory usage for batch operations

## Glossary

| Term | Definition |
|------|-----------|
| **ESM** | ECMAScript Modules (native JS modules) |
| **camelCase** | First word lowercase, subsequent words capitalized |
| **PascalCase** | All words capitalized, no separators |
| **snake_case** | Words separated by underscores, lowercase |
| **UPPER_SNAKE_CASE** | Words separated by underscores, uppercase |
| **Strict Mode** | TypeScript compiler option enforcing type safety |
| **Monorepo** | Single repository with multiple packages |
| **Workspace** | pnpm workspace defining package relationships |
| **Lazy Init** | Defer initialization until first use |
| **Parameterized Query** | Query with placeholders instead of string interpolation |
| **768D Embedding** | Gemini text-embedding-004 output (768 dimensions) |
| **Confidence Score** | Extraction confidence 0.0-1.0, filtered ≥0.7 |
| **Deduplication** | Combining results while keeping highest similarity per ID |

---

*Code standards and architectural patterns for LuxBot Phase 03: Memory Layer*
