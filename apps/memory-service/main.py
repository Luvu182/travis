"""
Memory Service - FastAPI wrapper for mem0 Python SDK
Provides REST API for memory operations with pgvector storage

Production-grade with dependency injection pattern.
"""
import os
import re
from typing import Optional, Any
from datetime import datetime, timedelta
from contextlib import asynccontextmanager
from functools import lru_cache

from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from mem0 import Memory


# =============================================================================
# Utilities
# =============================================================================

def normalize_vietnamese_dates(text: str, reference_date: Optional[datetime] = None) -> str:
    """
    Normalize Vietnamese relative dates to absolute dates.

    ONLY normalizes when there's a CLEAR TIME INDICATOR (giờ, lúc, sáng, chiều, tối).
    This avoids false positives like "mai mốt đi ăn nghe" (idiom meaning "sometime").

    Patterns handled (only with time indicators):
    - Exact days: hôm nay, ngày mai, hôm qua, ngày kia
    - Weeks: tuần sau, tuần tới, tuần này
    - Months: tháng sau, tháng tới, tháng này
    """
    if not reference_date:
        reference_date = datetime.now()

    # Time indicators that signal a real schedule (not idiom)
    # Must be followed by actual time info, not just "sáng nay trời đẹp"
    time_indicators = r'(?:lúc\s*\d|giờ|sáng\s*(?:họp|bay|gặp|đi)|chiều\s*(?:họp|bay|gặp|đi)|tối\s*(?:họp|bay|gặp|đi)|trưa\s*(?:họp|ăn|gặp)|\d{1,2}h|\d{1,2}:\d{2})'

    # Idiom patterns that should NEVER be normalized (casual "sometime" expressions)
    idiom_patterns = [
        r'\bmai mốt\b',      # "sometime later" idiom
        r'\bmai này\b',      # "some day" idiom
        r'\bmai kia\b',      # "see you later" idiom
        r'\bbữa nào\b',      # "someday"
        r'\bhôm nào\b',      # "when/some day"
        r'\blúc nào\b',      # "when/sometime"
        r'\bkhi nào\b',      # "when"
    ]

    # Check if message contains idioms - if so, skip day normalization entirely
    has_idiom = any(re.search(p, text, re.IGNORECASE) for p in idiom_patterns)

    result = text

    # Day patterns - only process if NOT an idiom and has time indicator
    if not has_idiom:
        # Pattern: "ngày mai lúc 10h" or "mai 10h họp"
        day_patterns_with_time = [
            (r'\bngày mai\s+' + time_indicators, 1, 'ngày mai'),
            (r'\bmai\s+' + time_indicators, 1, 'mai'),
            (r'\bhôm nay\s+' + time_indicators, 0, 'hôm nay'),
            (r'\bhôm qua\s+' + time_indicators, -1, 'hôm qua'),
            (r'\bngày kia\s+' + time_indicators, 2, 'ngày kia'),
            (r'\bngày mốt\s+' + time_indicators, 2, 'ngày mốt'),
        ]

        for pattern, days_offset, original in day_patterns_with_time:
            def replace_day(match, offset=days_offset, orig=original):
                target_date = reference_date + timedelta(days=offset)
                date_str = f"ngày {target_date.strftime('%d/%m/%Y')}"
                # Keep the time part, replace only the day reference
                return match.group(0).replace(orig, date_str, 1)

            result = re.sub(pattern, replace_day, result, flags=re.IGNORECASE)

        # Also handle patterns like "họp lúc 10h ngày mai"
        reverse_patterns = [
            (time_indicators + r'\s+ngày mai\b', 1, 'ngày mai'),
            (time_indicators + r'\s+hôm nay\b', 0, 'hôm nay'),
            (time_indicators + r'\s+ngày kia\b', 2, 'ngày kia'),
        ]

        for pattern, days_offset, original in reverse_patterns:
            def replace_reverse(match, offset=days_offset, orig=original):
                target_date = reference_date + timedelta(days=offset)
                date_str = f"ngày {target_date.strftime('%d/%m/%Y')}"
                return match.group(0).replace(orig, date_str, 1)

            result = re.sub(pattern, replace_reverse, result, flags=re.IGNORECASE)

    # Week patterns - these are usually specific enough
    week_patterns = [
        (r'\btuần sau\b', 1),
        (r'\btuần tới\b', 1),
        (r'\btuần trước\b', -1),
    ]

    for pattern, weeks_offset in week_patterns:
        current_weekday = reference_date.weekday()
        start_of_week = reference_date - timedelta(days=current_weekday) + timedelta(weeks=weeks_offset)
        end_of_week = start_of_week + timedelta(days=6)
        date_range = f"tuần {start_of_week.strftime('%d/%m')}-{end_of_week.strftime('%d/%m/%Y')}"
        result = re.sub(pattern, date_range, result, flags=re.IGNORECASE)

    # Month patterns - these are usually specific enough
    month_patterns = [
        (r'\btháng sau\b', 1),
        (r'\btháng tới\b', 1),
        (r'\btháng trước\b', -1),
    ]

    for pattern, months_offset in month_patterns:
        target_month = reference_date.month + months_offset
        target_year = reference_date.year
        while target_month > 12:
            target_month -= 12
            target_year += 1
        while target_month < 1:
            target_month += 12
            target_year -= 1
        month_str = f"tháng {target_month}/{target_year}"
        result = re.sub(pattern, month_str, result, flags=re.IGNORECASE)

    return result


# =============================================================================
# Configuration
# =============================================================================

def get_fact_extraction_prompt() -> str:
    """
    Generate custom fact extraction prompt for Executive Assistant.
    Focuses on extracting actionable information for work management.
    Called fresh each time to ensure date is always current.
    """
    current_date = datetime.now().strftime("%d/%m/%Y")
    current_weekday = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"][datetime.now().weekday()]
    tomorrow = (datetime.now() + timedelta(days=1)).strftime("%d/%m/%Y")
    day_after = (datetime.now() + timedelta(days=2)).strftime("%d/%m/%Y")

    # Calculate next week range
    now = datetime.now()
    next_week_start = now - timedelta(days=now.weekday()) + timedelta(weeks=1)
    next_week_end = next_week_start + timedelta(days=6)

    return f"""
Bạn là bộ não của trợ lý điều hành (Executive Assistant). Nhiệm vụ: trích xuất thông tin QUAN TRỌNG để hỗ trợ quản lý công việc.

📅 NGÀY HIỆN TẠI: {current_weekday}, {current_date}

═══════════════════════════════════════════════════════════════
🎯 THÔNG TIN CẦN TRÍCH XUẤT (theo thứ tự ưu tiên)
═══════════════════════════════════════════════════════════════

1. LỊCH TRÌNH & CUỘC HỌP
   - Thời gian cụ thể (ngày, giờ)
   - Người tham gia, địa điểm
   - Mục đích cuộc họp
   ⚠️ LUÔN chuyển ngày tương đối → ngày tuyệt đối

2. CÔNG VIỆC & DEADLINE
   - Task cần làm
   - Deadline (ngày cụ thể)
   - Người giao việc, độ ưu tiên

3. LIÊN HỆ & MỐI QUAN HỆ
   - Tên người, chức vụ, công ty
   - Số điện thoại, email
   - Quan hệ (đối tác, khách hàng, đồng nghiệp)

4. SỞ THÍCH & THÓI QUEN
   - Thói quen làm việc (giờ làm, cách liên lạc ưa thích)
   - Sở thích cá nhân (ăn uống, du lịch)
   - Điều cần tránh/lưu ý

5. THÔNG TIN CÔNG VIỆC
   - Dự án đang làm
   - Vấn đề cần giải quyết
   - Quyết định đã đưa ra

6. LINKS & TÀI LIỆU
   - URL websites, Google Docs, Sheets, Drive
   - File đính kèm (tên file, loại file, mục đích)
   - Tài liệu tham khảo (báo cáo, hợp đồng, proposal)

═══════════════════════════════════════════════════════════════
⚠️ QUY TẮC QUAN TRỌNG
═══════════════════════════════════════════════════════════════

✅ CHUYỂN ĐỔI NGÀY:
- "ngày mai" → "{tomorrow}"
- "ngày kia/mốt" → "{day_after}"
- "tuần sau" → "tuần {next_week_start.strftime('%d/%m')}-{next_week_end.strftime('%d/%m/%Y')}"
- "tháng sau" → "tháng {(now.month % 12) + 1}/{now.year if now.month < 12 else now.year + 1}"

❌ KHÔNG TRÍCH XUẤT:
- Chào hỏi, xã giao ("Hi", "Cảm ơn", "Ok")
- Nhận xét thời tiết, cảm xúc thoáng qua
- Câu hỏi chung không chứa thông tin mới
- Idiom không rõ thời gian ("mai mốt đi ăn nghe", "bữa nào gặp")

═══════════════════════════════════════════════════════════════
📝 VÍ DỤ
═══════════════════════════════════════════════════════════════

Input: Ngày mai 10h họp với anh Tuấn bên ABC Corp về dự án ERP
Output: {{"facts": ["Họp ngày {tomorrow} lúc 10:00 với anh Tuấn (ABC Corp) về dự án ERP"]}}

Input: Anh Nam - GĐ FPT Software, số 0912345678, đối tác chiến lược
Output: {{"facts": ["Anh Nam - Giám đốc FPT Software, SĐT: 0912345678, đối tác chiến lược"]}}

Input: Deadline báo cáo Q4 là 25/12, gửi cho sếp Hùng
Output: {{"facts": ["Deadline báo cáo Q4: 25/12, gửi cho sếp Hùng"]}}

Input: Tôi thích uống cà phê đen, không đường
Output: {{"facts": ["Sở thích: cà phê đen không đường"]}}

Input: Tuần sau bay Đà Nẵng công tác 3 ngày
Output: {{"facts": ["Công tác Đà Nẵng tuần {next_week_start.strftime('%d/%m')}-{next_week_end.strftime('%d/%m/%Y')}, 3 ngày"]}}

Input: Dự án X đang bị delay, cần tăng tốc
Output: {{"facts": ["Dự án X đang delay, cần tăng tốc"]}}

Input: Email quan trọng gửi trước 5h chiều
Output: {{"facts": ["Cần gửi email quan trọng trước 17:00 ngày {current_date}"]}}

Input: File báo cáo Q4 ở đây: https://docs.google.com/spreadsheets/d/abc123
Output: {{"facts": ["Báo cáo Q4: https://docs.google.com/spreadsheets/d/abc123 (Google Sheets)"]}}

Input: Gửi bạn proposal.pdf, xem và feedback nhé
Output: {{"facts": ["File proposal.pdf cần review và feedback"]}}

Input: Link design: https://figma.com/file/xyz - bản UI mới cho app mobile
Output: {{"facts": ["Design UI app mobile: https://figma.com/file/xyz (Figma)"]}}

Input: Hợp đồng ABC_Corp_2025.docx đã ký xong
Output: {{"facts": ["Hợp đồng ABC_Corp_2025.docx - đã ký"]}}

Input: Hi, hôm nay trời đẹp quá
Output: {{"facts": []}}

Input: Mai mốt mình đi ăn nhé
Output: {{"facts": []}}

Input: Ok, cảm ơn bạn
Output: {{"facts": []}}

═══════════════════════════════════════════════════════════════
Trả về JSON với key "facts" duy nhất. Mỗi fact là 1 string ngắn gọn, đầy đủ thông tin.
"""


@lru_cache()
def get_base_config() -> dict:
    """Get base configuration (without date-sensitive prompts). Cached for performance."""
    return {
        "llm": {
            "provider": "gemini",
            "config": {
                "model": "gemini-2.5-flash-lite",
                "temperature": 0.1,
                "max_tokens": 2000,
            },
        },
        "embedder": {
            "provider": "gemini",
            "config": {
                "model": "gemini-embedding-001",
            },
        },
        "vector_store": {
            "provider": "pgvector",
            "config": {
                "host": os.getenv("DB_HOST", "localhost"),
                "port": int(os.getenv("DB_PORT", "5432")),
                "user": os.getenv("DB_USER", "postgres"),
                "password": os.getenv("DB_PASSWORD"),
                "dbname": os.getenv("DB_NAME", "jarvis"),
                "collection_name": "memories",
                "embedding_model_dims": 1536,
            },
        },
        "version": "v1.1",
    }


def get_config() -> dict:
    """Build full mem0 configuration with fresh date in prompt."""
    config = get_base_config().copy()
    config["custom_fact_extraction_prompt"] = get_fact_extraction_prompt()
    return config


# =============================================================================
# Dependency Injection
# =============================================================================

class MemoryService:
    """Singleton wrapper for mem0 Memory instance."""

    _instance: Optional[Memory] = None

    @classmethod
    def initialize(cls) -> None:
        """Initialize the Memory instance. Called once at startup."""
        if cls._instance is None:
            print("[Memory Service] Initializing mem0 with pgvector...")
            cls._instance = Memory.from_config(get_config())
            print("[Memory Service] Ready!")

    @classmethod
    def shutdown(cls) -> None:
        """Cleanup on shutdown."""
        print("[Memory Service] Shutting down...")
        cls._instance = None

    @classmethod
    def get_instance(cls) -> Memory:
        """Get the Memory instance. Raises if not initialized."""
        if cls._instance is None:
            raise RuntimeError("MemoryService not initialized")
        return cls._instance


def get_memory() -> Memory:
    """
    FastAPI dependency for Memory instance.
    Raises HTTP 503 if service not ready.
    """
    try:
        return MemoryService.get_instance()
    except RuntimeError:
        raise HTTPException(
            status_code=503,
            detail="Memory service not initialized"
        )


@asynccontextmanager
async def lifespan(_app: FastAPI):
    """Application lifespan: initialize on startup, cleanup on shutdown."""
    MemoryService.initialize()
    yield
    MemoryService.shutdown()


app = FastAPI(
    title="Jarvis Memory Service",
    description="Memory layer powered by mem0 with pgvector",
    version="1.0.0",
    lifespan=lifespan,
)


# Request/Response models
# Updated for multi-tenant workspace isolation:
# - workspace_id: isolates memories between different workspaces (required for multi-tenant)
# - group_id: context within workspace (run_id in mem0)
# - user_id: individual chat user within group

class AddMemoryRequest(BaseModel):
    user_id: str
    group_id: str
    workspace_id: Optional[str] = None  # For multi-tenant isolation
    message: str
    sender_name: Optional[str] = None
    group_name: Optional[str] = None
    platform: Optional[str] = None  # telegram, lark, web - for AI context
    sent_at: Optional[str] = None  # ISO format


class SearchMemoryRequest(BaseModel):
    user_id: str
    group_id: str
    workspace_id: Optional[str] = None  # For multi-tenant isolation
    query: str
    limit: int = 5


class GetAllMemoriesRequest(BaseModel):
    user_id: str
    group_id: str
    workspace_id: Optional[str] = None  # For multi-tenant isolation
    limit: int = 10


class UpdateMemoryRequest(BaseModel):
    memory_id: str
    data: str


class DeleteMemoryRequest(BaseModel):
    memory_id: str


class DeleteAllMemoriesRequest(BaseModel):
    user_id: str
    group_id: str
    workspace_id: Optional[str] = None  # For multi-tenant isolation


class MemoryItem(BaseModel):
    id: str
    memory: str
    metadata: Optional[dict] = None
    score: Optional[float] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class MemoryResponse(BaseModel):
    success: bool
    data: Optional[Any] = None
    error: Optional[str] = None


# =============================================================================
# Endpoints
# =============================================================================

@app.get("/health")
async def health():
    """Health check endpoint."""
    is_ready = MemoryService._instance is not None
    return {"status": "ok", "service": "memory-service", "mem0": is_ready}


@app.post("/memories/add", response_model=MemoryResponse)
async def add_memory(req: AddMemoryRequest, memory: Memory = Depends(get_memory)):
    """
    Add a new memory entry.

    Multi-tenant memory scoping:
    - agent_id = workspace_id (isolates between workspaces)
    - run_id = group_id (context within workspace)
    - user_id = chat user (individual user memory)
    """
    try:
        # Parse reference date from sent_at or use now
        reference_date = datetime.now()
        if req.sent_at:
            try:
                reference_date = datetime.fromisoformat(req.sent_at.replace('Z', '+00:00'))
            except ValueError:
                pass  # Use current time if parsing fails

        # Normalize Vietnamese relative dates to absolute dates
        normalized_message = normalize_vietnamese_dates(req.message, reference_date)

        messages = [{"role": "user", "content": normalized_message}]
        metadata = {
            "sender_name": req.sender_name,  # Human-readable name for attribution
            "group_name": req.group_name,
            "platform": req.platform,  # telegram, lark, web - for AI context
            "sent_at": req.sent_at or reference_date.isoformat(),
            "original_message": req.message,
            "workspace_id": req.workspace_id,
            "group_id": req.group_id,
        }

        # Multi-tenant scoping:
        # - agent_id: workspace isolation (primary tenant boundary)
        # - run_id: group context within workspace
        # - user_id: individual user within group
        agent_id = f"workspace_{req.workspace_id}" if req.workspace_id else f"group_{req.group_id}"
        run_id = f"group_{req.group_id}" if req.workspace_id else None

        add_kwargs = {
            "user_id": req.user_id,
            "agent_id": agent_id,
            "metadata": metadata,
        }
        if run_id:
            add_kwargs["run_id"] = run_id

        result = memory.add(messages, **add_kwargs)

        return MemoryResponse(success=True, data=result if result else [])
    except Exception as e:
        return MemoryResponse(success=False, error=str(e))


@app.post("/memories/search", response_model=MemoryResponse)
async def search_memories(req: SearchMemoryRequest, memory: Memory = Depends(get_memory)):
    """
    Search memories by query with multi-tenant scoping.

    NOTE: user_id is NOT used for filtering - we search ALL memories in the group/workspace.
    This allows group members to access shared information (e.g., meeting times announced by others).
    user_id is only used when ADDING memories to track who said what.
    """
    try:
        # Multi-tenant scoping - NO user_id filter (shared memory within group)
        agent_id = f"workspace_{req.workspace_id}" if req.workspace_id else f"group_{req.group_id}"
        run_id = f"group_{req.group_id}" if req.workspace_id else None

        search_kwargs = {
            "agent_id": agent_id,
            "limit": req.limit,
        }
        if run_id:
            search_kwargs["run_id"] = run_id

        results = memory.search(req.query, **search_kwargs)
        return MemoryResponse(success=True, data=results if results else [])
    except Exception as e:
        return MemoryResponse(success=False, error=str(e))


@app.post("/memories/all", response_model=MemoryResponse)
async def get_all_memories(req: GetAllMemoriesRequest, memory: Memory = Depends(get_memory)):
    """
    Get all memories for a group/workspace.

    NOTE: user_id is NOT used for filtering - returns ALL memories in the group/workspace.
    This enables shared memory access within teams.
    """
    try:
        # Multi-tenant scoping - NO user_id filter (shared memory within group)
        agent_id = f"workspace_{req.workspace_id}" if req.workspace_id else f"group_{req.group_id}"
        run_id = f"group_{req.group_id}" if req.workspace_id else None

        get_kwargs = {
            "agent_id": agent_id,
            "limit": req.limit,
        }
        if run_id:
            get_kwargs["run_id"] = run_id

        memories = memory.get_all(**get_kwargs)
        return MemoryResponse(success=True, data=memories if memories else [])
    except Exception as e:
        return MemoryResponse(success=False, error=str(e))


@app.post("/memories/update", response_model=MemoryResponse)
async def update_memory(req: UpdateMemoryRequest, memory: Memory = Depends(get_memory)):
    """Update a specific memory."""
    try:
        memory.update(req.memory_id, req.data)
        return MemoryResponse(success=True)
    except Exception as e:
        return MemoryResponse(success=False, error=str(e))


@app.post("/memories/delete", response_model=MemoryResponse)
async def delete_memory(req: DeleteMemoryRequest, memory: Memory = Depends(get_memory)):
    """Delete a specific memory."""
    try:
        memory.delete(req.memory_id)
        return MemoryResponse(success=True)
    except Exception as e:
        return MemoryResponse(success=False, error=str(e))


@app.post("/memories/delete-all", response_model=MemoryResponse)
async def delete_all_memories(req: DeleteAllMemoriesRequest, memory: Memory = Depends(get_memory)):
    """Delete all memories for a user/group with multi-tenant scoping."""
    try:
        # Multi-tenant scoping
        agent_id = f"workspace_{req.workspace_id}" if req.workspace_id else f"group_{req.group_id}"
        run_id = f"group_{req.group_id}" if req.workspace_id else None

        delete_kwargs = {
            "user_id": req.user_id,
            "agent_id": agent_id,
        }
        if run_id:
            delete_kwargs["run_id"] = run_id

        memory.delete_all(**delete_kwargs)
        return MemoryResponse(success=True)
    except Exception as e:
        return MemoryResponse(success=False, error=str(e))


@app.get("/memories/history/{memory_id}", response_model=MemoryResponse)
async def get_memory_history(memory_id: str, memory: Memory = Depends(get_memory)):
    """Get history of a specific memory."""
    try:
        history = memory.history(memory_id)
        return MemoryResponse(success=True, data=history if history else [])
    except Exception as e:
        return MemoryResponse(success=False, error=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
