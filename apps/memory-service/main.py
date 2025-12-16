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
    Normalize only 100% UNAMBIGUOUS Vietnamese relative dates.

    ✅ Normalize: "ngày mai", "hôm nay", "hôm qua" (clear meaning)
    ❌ Skip: everything else (ambiguous or regional)
    """
    if not reference_date:
        reference_date = datetime.now()

    patterns = [
        (r'\bngày mai\b', 1),   # Tomorrow
        (r'\bhôm nay\b', 0),    # Today
        (r'\bhôm qua\b', -1),   # Yesterday
    ]

    result = text
    for pattern, days_offset in patterns:
        target_date = reference_date + timedelta(days=days_offset)
        date_str = target_date.strftime("ngày %d/%m/%Y")
        result = re.sub(pattern, date_str, result, flags=re.IGNORECASE)

    return result


# =============================================================================
# Configuration
# =============================================================================

@lru_cache()
def get_config() -> dict:
    """Build mem0 configuration from environment. Cached for performance."""
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
    }


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
            "sender_name": req.sender_name,
            "group_name": req.group_name,
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
    """Search memories by query with multi-tenant scoping."""
    try:
        # Multi-tenant scoping (same as add)
        agent_id = f"workspace_{req.workspace_id}" if req.workspace_id else f"group_{req.group_id}"
        run_id = f"group_{req.group_id}" if req.workspace_id else None

        search_kwargs = {
            "user_id": req.user_id,
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
    """Get all memories for a user/group with multi-tenant scoping."""
    try:
        # Multi-tenant scoping
        agent_id = f"workspace_{req.workspace_id}" if req.workspace_id else f"group_{req.group_id}"
        run_id = f"group_{req.group_id}" if req.workspace_id else None

        get_kwargs = {
            "user_id": req.user_id,
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
