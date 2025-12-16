# Memory Architecture

## Overview

J.A.R.V.I.S sử dụng mem0 (Python SDK) với pgvector để lưu trữ và truy vấn long-term memory cho chatbot.

## Shared Memory trong Group Chat

### Use Case

Bot được add vào group → members trao đổi → bot trích xuất thông tin → lưu memory

**Ví dụ:**
```
Group Chat "Team ABC"
├── User A: "Meeting với khách hàng X ngày 20/12 lúc 2h"
├── User B: "Budget Q1 là 500 triệu"
├── User C hỏi: "Meeting với khách X khi nào?"
│
└── Bot search ALL memories trong group → trả về: "Meeting ngày 20/12 lúc 2h"
```

### Nguyên tắc QUAN TRỌNG

1. **ADD memory**: Lưu `user_id` vào metadata để track AI nói gì
2. **SEARCH memory**: Get ALL trong group/workspace, **KHÔNG filter by user_id**
3. **Lý do**: Shared context - thông tin 1 người nói, cả nhóm cần access

### Memory Scoping

```
agent_id = workspace_{workspace_id}  hoặc  group_{group_id}
run_id = group_{group_id}  (khi có workspace)
user_id = chỉ dùng trong metadata khi ADD
```

## Workspace Layer (TODO)

Hiện tại mỗi group là isolated. Cần implement:

```
Workspace "Company A" (owned by Admin User)
├── Telegram Group 1  ─┐
├── Telegram Group 2   ├── Shared memory pool
├── Lark Group 1      ─┘
└── Bot search across ALL groups trong workspace
```

### Khi implement:
- Link groups vào workspace
- Update `agent_id` để scope theo workspace
- Bot search memories across all groups trong workspace

## API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `POST /memories/add` | Add memory với user_id trong metadata |
| `POST /memories/search` | Search ALL trong group (không filter user_id) |
| `POST /memories/all` | Get ALL memories trong group |
| `POST /memories/delete` | Delete specific memory |
| `POST /memories/delete-all` | Delete all memories trong group |

## Vietnamese Date Normalization

Memory service tự động normalize relative dates:
- "ngày mai" → "ngày 18/12/2024"
- "hôm nay" → "ngày 17/12/2024"
- "hôm qua" → "ngày 16/12/2024"

## Tech Stack

- **mem0**: Python SDK cho memory operations
- **pgvector**: Vector storage trong PostgreSQL
- **Gemini embedding-001**: 1536D embeddings
- **Gemini 2.5-flash-lite**: Extraction và processing
