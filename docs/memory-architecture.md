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

Memory service tự động normalize relative dates khi có **time indicator** (lúc, giờ, sáng, chiều, tối, trưa, Xh):

**Được normalize (có time indicator):**
- "mai 10h họp" → "ngày 18/12/2025 10h họp"
- "ngày mai lúc 3 giờ chiều" → "ngày 18/12/2025 lúc 3 giờ chiều"
- "hôm nay sáng họp" → "ngày 17/12/2025 sáng họp"

**KHÔNG normalize (idiom/không có time indicator):**
- "mai mốt đi ăn nghe" → giữ nguyên (idiom = "sometime")
- "hôm nay trời đẹp" → giữ nguyên (không phải lịch)

**Week/Month patterns (luôn normalize):**
- "tuần sau" → "tuần 22/12-28/12/2025"
- "tháng sau" → "tháng 1/2026"

## Custom Fact Extraction Prompt

mem0 hỗ trợ `custom_fact_extraction_prompt` để customize logic extraction:

```python
config = {
    "llm": {...},
    "embedder": {...},
    "vector_store": {...},
    "custom_fact_extraction_prompt": """
Extract important facts about the user...
Current date for reference: {current_date}
...
""",
    "version": "v1.1",
}
```

**File cấu hình:** `apps/memory-service/main.py` - function `get_fact_extraction_prompt()`

**Best practices:**
- Cung cấp few-shot examples với positive và negative cases
- Specify ngày hiện tại để LLM có thể convert relative dates
- Trả về JSON format với key "facts"

**Tài liệu tham khảo:**
- [mem0 Custom Fact Extraction](https://docs.mem0.ai/open-source/features/custom-fact-extraction-prompt)
- [mem0 Custom Update Memory](https://docs.mem0.ai/open-source/features/custom-update-memory-prompt)

## Tech Stack

- **mem0**: Python SDK cho memory operations
- **pgvector**: Vector storage trong PostgreSQL
- **Gemini embedding-001**: 1536D embeddings
- **Gemini 2.5-flash-lite**: Extraction và processing
