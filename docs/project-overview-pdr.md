# J.A.R.V.I.S - Project Overview & PDR (Product Development Requirements)

**Document Version:** 2.0
**Status:** Phase 10 Complete (All Phases)
**Last Updated:** 2025-12-17

## Project Vision

J.A.R.V.I.S is an AI-powered Vietnamese executive assistant chatbot with long-term memory, designed for seamless integration with Telegram and Lark Suite. The system extracts actionable intelligence from group conversations, maintains persistent context, and provides intelligent responses informed by historical context.

### Core Value Proposition
- **Automatic Task Extraction:** Convert conversations into structured tasks with assignees and deadlines
- **Persistent Memory:** Remember group context, decisions, and preferences across sessions
- **Semantic Search:** Find related tasks, decisions, and information using natural language
- **Multi-Platform:** Native integration with Telegram and Lark Suite
- **Vietnamese-First:** Optimized for Vietnamese language processing and cultural nuances

## Project Scope

### In Scope
- PostgreSQL database with pgvector for semantic search
- 6-table relational schema with 14 CRUD operations
- Vector search on 1536-dimensional Gemini embeddings
- Hono API server for webhook handling
- Integration with Telegram and Lark Suite platforms
- Information extraction (tasks, decisions, deadlines, important notes)
- Long-term memory persistence with mem0

### Out of Scope (Future Phases)
- Mobile app clients
- Advanced analytics dashboards
- Custom embedding model training
- Conversation branching/threading UI
- Third-party integrations (Slack, Teams, Discord)

## Phase Breakdown - Completion Status

### Phase 01: Foundation (Completed ✓)
- Project structure setup with Turborepo monorepo
- Configuration layer with Zod validation
- Environment validation with type safety
- Development environment (Docker + PostgreSQL + pgvector)
- **Completed:** 2025-12-16

### Phase 02: Database Schema (Completed ✓)
- Drizzle ORM schema definition (type-safe)
- 4 core tables (groups, users, messages, queryLogs)
- Vector search infrastructure (pgvector 1536D via mem0)
- 7 CRUD operations + vector search
- Connection pooling & lazy initialization
- Comprehensive indexes for performance
- **Completed:** 2025-12-16

### Phase 03: Memory Layer (Completed ✓)
- Python FastAPI memory service with mem0ai SDK
- Gemini 2.5-flash-lite LLM for memory extraction
- Gemini embedding-001 (1536D) vector embeddings
- PostgreSQL + pgvector storage
- TypeScript HTTP client for memory operations
- Vietnamese date normalization (ngày mai, hôm nay, hôm qua)
- Automatic deduplication via mem0
- **Completed:** 2025-12-17

### Phase 04: LLM Integration (Completed ✓)
- Gemini 2.5-flash-lite primary model (all tasks)
- GPT-4o-mini automatic fallback mechanism
- Task-based routing (5 types: chat, extraction, summarization, query, translation)
- Vietnamese system prompts optimized per task
- Streaming support via AsyncGenerator
- Type-safe LLMRequest/LLMResponse interfaces
- Latency tracking and error recovery
- Test coverage: 33/33 tests passing (100%)
- **Completed:** 2025-12-17

### Phase 05: API Integration (Completed ✓)
- Hono API server with TypeScript
- 8 endpoints for core operations (health, chat, extract, search, query, metrics, auth, dashboard-metrics)
- 2 webhooks (Telegram, Lark Suite)
- 3 middleware (rate-limit, error-handler, dashboard-auth)
- Request validation and error handling
- Rate limiting: 100 req/15min per user+group
- Health check with database connectivity
- **Completed:** 2025-12-17

### Phase 06: Bot Integration (Completed ✓)
- Telegram webhook handler via grammY
- Lark Suite webhook handler via @larksuiteoapi/node-sdk
- Platform-specific message normalization
- Group/user metadata extraction and storage
- Multi-platform command handling
- **Completed:** 2025-12-17

### Phase 07: Production Hardening (Completed ✓)
- Connection pooling (20 max connections)
- Error handling and graceful degradation
- Security: Input validation, SQL injection prevention
- Monitoring via queryLogs table
- Rate limiting per user+group
- **Completed:** 2025-12-17

### Phase 08: Advanced Features (Completed ✓)
- Group context extraction and storage
- User preference tracking
- Message history and analytics
- Extraction confidence scoring
- Multi-search deduplication
- **Completed:** 2025-12-17

### Phase 09: Testing & Quality (Completed ✓)
- LLM layer unit tests (4 test suites)
- Integration tests (fallback, streaming, Vietnamese language)
- Memory service integration tests
- API endpoint validation
- Type checking (TypeScript strict mode)
- Linting (ESLint configuration)
- **Completed:** 2025-12-17

### Phase 10: Dashboard & Admin UI (Completed ✓)
- Next.js 15 + React 19 dashboard
- 7 pages (login, dashboard, chat, conversations, memory, performance, settings)
- NextAuth v5 JWT authentication
- Real-time metrics via Server-Sent Events (SSE)
- Dark/light mode support
- Responsive design (Tailwind CSS + Shadcn/ui)
- Chart.js integration for analytics
- Zustand state management
- Chat interface with WebSocket/SSE
- **Completed:** 2025-12-17

## Functional Requirements

### FR1: Multi-Platform Support

**Requirement:** Support Telegram and Lark Suite with feature parity

**Specifications:**
- Receive messages from both platforms via webhooks
- Parse platform-specific message formats
- Store platform identifiers for reference
- Return responses in platform-native format

**Acceptance Criteria:**
- Telegram bot responds to group messages
- Lark Suite bot responds to suite messages
- Same extraction logic for both platforms
- Users/groups identified uniquely per platform

### FR2: Information Extraction

**Requirement:** Automatically extract structured information from unstructured messages

**Specifications:**
- Extract tasks (actionable items)
- Extract decisions (choices made)
- Extract deadlines (time-bound commitments)
- Extract important information
- Extract general insights

**Extraction Fields:**
- Content (full text)
- Summary (short description)
- Type (task/decision/deadline/important/general)
- Assignee (optional user)
- Due date (optional timestamp)
- Status (active/completed/archived)

**Acceptance Criteria:**
- Classify messages into 5+ information types
- Identify task assignees with 85%+ accuracy
- Parse due dates from natural language
- Generate summaries < 200 characters

### FR3: Vector-Based Semantic Search

**Requirement:** Enable semantic search across extracted information and memories

**Specifications:**
- Generate 1536-dimensional embeddings (Gemini embedding-001)
- Store embeddings alongside content
- Support vector similarity search (cosine distance)
- Filter search by group, type, date range
- Return ranked results by similarity

**Acceptance Criteria:**
- Search latency < 100ms for 10,000+ records
- Similarity threshold configurable (0.0-1.0)
- Return results in relevance order
- Support filtering on search results

### FR4: Long-Term Memory

**Requirement:** Maintain persistent, contextual memory across conversations

**Specifications:**
- Store facts about users and groups
- Store preferences and settings
- Store conversation context
- Retrieve relevant memory for context
- Update memory based on new information

**Memory Types:**
- Facts (objective information)
- Preferences (user/group choices)
- Context (conversation background)

**Acceptance Criteria:**
- Memory persistence across sessions
- Semantic similarity for memory retrieval
- Automatic memory updates
- No memory loss on server restart

### FR5: Response Generation

**Requirement:** Generate contextual, Vietnamese-language responses

**Specifications:**
- Integrate with Gemini Flash for primary responses
- Fallback to OpenAI GPT-4 on failure
- Include relevant memories in context
- Acknowledge extracted information
- Provide suggestions for ambiguous cases

**Acceptance Criteria:**
- Responses in Vietnamese
- Response latency < 3 seconds
- Grammar/spelling accuracy > 95%
- Appropriate tone for business context

### FR6: Health Monitoring

**Requirement:** Provide system health status and diagnostics

**Specifications:**
- API health endpoint
- Database connection verification
- Query latency tracking
- Error rate monitoring

**Acceptance Criteria:**
- Health check completes < 500ms
- Detailed error information logged
- Metrics available for monitoring

## Non-Functional Requirements

### NFR1: Performance

**Requirement:** Optimize for low latency and high throughput

**Specifications:**
- API response time: < 3 seconds (99th percentile)
- Vector search: < 100ms for 10,000 records
- Database connection: < 100ms
- Webhook processing: < 1 second

**Acceptance Criteria:**
- Load test passes 1000 concurrent users
- No response time degradation with 100K records
- Database query time < 50ms

### NFR2: Scalability

**Requirement:** Support growth from 10 to 1000+ groups

**Specifications:**
- Horizontal scaling: stateless API
- Vertical scaling: database optimization
- Connection pooling: 20 max connections
- Future: read replicas for query scaling

**Acceptance Criteria:**
- Support 1000+ groups
- Support 10,000+ users
- Support 1M+ messages
- Throughput: 100+ requests/second

### NFR3: Reliability

**Requirement:** Maintain high availability and data integrity

**Specifications:**
- 99.9% uptime SLA
- Automatic failover for LLM APIs
- Database backup strategy
- Connection pool error handling

**Acceptance Criteria:**
- Graceful degradation on API failure
- No data loss on unexpected shutdown
- Automatic backup on schedule
- Recovery time < 5 minutes

### NFR4: Security

**Requirement:** Protect sensitive data and prevent unauthorized access

**Specifications:**
- SSL/TLS for all connections
- Environment variable validation
- SQL injection prevention (parameterized queries)
- API authentication (future: webhook signatures)
- Data encryption at rest (future)

**Acceptance Criteria:**
- No SQL injection vulnerabilities
- Secrets not in logs
- HTTPS for all connections
- Database access restricted

### NFR5: Maintainability

**Requirement:** Enable easy updates and modifications

**Specifications:**
- TypeScript for type safety
- Comprehensive documentation
- Consistent code style
- Clear separation of concerns
- Database schema versioning

**Acceptance Criteria:**
- Code coverage > 70%
- Documentation complete
- Migrations tracked in git
- Linting passes CI/CD

## Technical Specifications

### Technology Stack

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Runtime | Node.js 18+ | Industry standard, TypeScript support |
| Language | TypeScript | Type safety, developer experience |
| ORM | Drizzle ORM | Type-safe, simple, Postgres native |
| Database | PostgreSQL 15+ | Robust, pgvector extension |
| Vector Ext | pgvector 0.5+ | Vector operations, cosine similarity |
| Embeddings | Gemini embedding-001 | Fast, 1536D, Vietnamese support |
| Primary LLM | Gemini Flash | Low latency, cost effective |
| Fallback LLM | OpenAI GPT-4 | High quality fallback |
| Memory | mem0 + Vercel AI | Long-term memory framework |
| API | Hono | Lightweight, TypeScript, fast |
| Telegram SDK | grammY | Easy integration, active support |
| Lark SDK | @larksuiteoapi/node-sdk | Official Lark support |
| Monorepo | Turborepo + pnpm | Fast, efficient workspaces |

### Database Schema

**Tables:** 6 core + 1 logging
**Relationships:** Fully normalized with cascading deletes
**Indexes:** 9 strategic indexes
**Vector Dimensions:** 1536 (Gemini embedding-001)

**Core Tables:**
1. `groups` - Platform groups/suites
2. `users` - Individual users
3. `messages` - Message audit trail
4. `extractedInfo` - Structured data + embeddings
5. `memories` - Long-term memory + embeddings
6. `queryLogs` - Analytics and debugging

### API Architecture

**Framework:** Hono (TypeScript)
**Pattern:** Webhook-based (event-driven)

**Endpoints (Phase 03):**
- `GET /health` - System health
- `POST /webhook/telegram` - Telegram messages
- `POST /webhook/lark` - Lark Suite messages

### LLM Integration

**Pipeline:**
1. Receive message (text)
2. Generate embedding (1536D)
3. Search similar memories/tasks
4. Call LLM for extraction/generation
5. Store results + embeddings
6. Return response

**Fallback Strategy:**
- Try Gemini first
- On failure, use OpenAI
- Return error if both fail

## Success Metrics

### User Adoption
- Number of active groups: Target 50+
- Number of users: Target 500+
- Daily active users: Target 30%+
- Tasks extracted per week: Target 100+

### System Performance
- API uptime: 99.9%
- Average response time: < 2 seconds
- Vector search latency: < 100ms
- Database CPU utilization: < 70%

### Data Quality
- Information extraction accuracy: 85%+
- Memory relevance (user rating): 4/5 average
- Task completion rate: 70%+
- User satisfaction: 4/5 average

### Developer Experience
- Code review approval time: < 1 day
- Deployment time: < 10 minutes
- Onboarding time for new developer: < 2 hours
- Documentation completeness: 100%

## Risk Assessment

### Risk 1: Vector Search Scalability
**Probability:** Medium
**Impact:** High
**Mitigation:** HNSW indexing in Phase 05
**Monitoring:** Track vector search latency

### Risk 2: LLM API Downtime
**Probability:** Low
**Impact:** Medium
**Mitigation:** Fallback to OpenAI, local caching
**Monitoring:** Track API success rates

### Risk 3: Database Connection Pool Exhaustion
**Probability:** Low
**Impact:** High
**Mitigation:** Connection pooling, monitoring
**Monitoring:** Track active connections

### Risk 4: Memory Bloat
**Probability:** Medium
**Impact:** Medium
**Mitigation:** Automatic cleanup, archiving
**Monitoring:** Track table sizes

### Risk 5: Vietnamese Language Quality
**Probability:** Medium
**Impact:** Medium
**Mitigation:** Native speaker review, user feedback
**Monitoring:** User satisfaction surveys

## Dependencies & Constraints

### External Dependencies
- PostgreSQL 15+ (must be available)
- Gemini API (primary LLM)
- OpenAI API (fallback)
- Telegram Bot API
- Lark Suite API

### Internal Dependencies
- Node.js 18+ runtime
- pnpm package manager
- TypeScript compiler

### Constraints
- Database must be PostgreSQL (pgvector requirement)
- Embeddings must be 1536D (Gemini embedding-001)
- API responses must be < 3 seconds
- Webhook signature verification required
- Max message size: 4KB (platform limits)

## Deployment Strategy

### Development Environment
- Docker Compose PostgreSQL + pgvector
- Hot reload for API changes
- Local testing of webhooks

### Staging Environment
- Full environment parity with production
- Load testing before releases
- Backup restore testing

### Production Environment
- Self-hosted VPS
- Automated daily backups
- WAL archiving for recovery
- Monitoring and alerting

### Deployment Process
1. Run tests and linting
2. Build TypeScript
3. Database migrations (backup first)
4. Health check
5. Gradual rollout (if applicable)

## Timeline & Milestones

| Phase | Duration | Status | Key Deliverables | Completed |
|-------|----------|--------|------------------|-----------|
| Phase 01 | 1 week | Complete | Project setup, config | 2025-12-16 |
| Phase 02 | 1 week | Complete | Database schema, 7 operations | 2025-12-16 |
| Phase 03 | 1 week | Complete | Memory layer, mem0 service | 2025-12-17 |
| Phase 04 | 1 week | Complete | LLM integration, fallback | 2025-12-17 |
| Phase 05 | 1 week | Complete | API endpoints, webhooks | 2025-12-17 |
| Phase 06 | 3 days | Complete | Bot integration (Telegram/Lark) | 2025-12-17 |
| Phase 07 | 3 days | Complete | Production hardening | 2025-12-17 |
| Phase 08 | 2 days | Complete | Advanced features | 2025-12-17 |
| Phase 09 | 2 days | Complete | Testing & quality assurance | 2025-12-17 |
| Phase 10 | 1 week | Complete | Dashboard & admin UI | 2025-12-17 |

**Total Timeline:** 3 weeks
**Project Status:** Production Ready ✓

## Glossary

| Term | Definition |
|------|-----------|
| **Extraction** | Converting unstructured text into structured data |
| **Vector** | Numerical representation of semantic meaning (1536D) |
| **Embedding** | Process of converting text to vectors |
| **Cosine Similarity** | Distance metric for comparing vectors (0-1 scale) |
| **pgvector** | PostgreSQL extension for vector operations |
| **mem0** | Long-term memory framework for AI agents |
| **Webhook** | HTTP callback triggered by platform events |
| **Lazy Init** | Deferring initialization until first use |
| **Pool** | Set of reusable database connections |
| **Fallback** | Secondary option if primary fails |
| **WAL** | Write-Ahead Logging (database backup mechanism) |

---

## Sign-Off

**Product Owner:** [To be assigned]
**Technical Lead:** [To be assigned]
**Phase 02 Complete:** 2025-12-16

---

*J.A.R.V.I.S Project Overview & PDR - Phase 02: Database Schema Completion*
