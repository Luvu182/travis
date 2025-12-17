import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

const MEMORY_SERVICE_URL = process.env.MEMORY_SERVICE_URL || 'http://localhost:8000';

// GET /api/dashboard/me/memories - Get user's memories
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const memRes = await fetch(`${MEMORY_SERVICE_URL}/memories/all`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: session.user.id,
        group_id: 'web_chat',
        limit: 50,
      }),
    });

    const memData = await memRes.json();

    if (!memData.success) {
      return NextResponse.json({ memories: [] });
    }

    // Transform memory data and sort by newest first
    const memories = (memData.data?.results || [])
      .map((m: {
        id: string;
        memory: string;
        metadata?: Record<string, unknown>;
        created_at?: string;
        updated_at?: string;
      }) => ({
        id: m.id,
        memory: m.memory,
        metadata: m.metadata,
        created_at: m.created_at,
        updated_at: m.updated_at,
      }))
      .sort((a: { updated_at?: string; created_at?: string }, b: { updated_at?: string; created_at?: string }) =>
        new Date(b.updated_at || b.created_at || 0).getTime() -
        new Date(a.updated_at || a.created_at || 0).getTime()
      );

    return NextResponse.json({ memories });
  } catch (error) {
    console.error('Get memories error:', error);
    return NextResponse.json({ memories: [] });
  }
}

// DELETE /api/dashboard/me/memories - Delete a memory
export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { memoryId } = await request.json();
    if (!memoryId) {
      return NextResponse.json({ error: 'Memory ID required' }, { status: 400 });
    }

    const res = await fetch(`${MEMORY_SERVICE_URL}/memories/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memory_id: memoryId }),
    });

    const data = await res.json();
    return NextResponse.json({ success: data.success });
  } catch (error) {
    console.error('Delete memory error:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}

// PUT /api/dashboard/me/memories - Update a memory
export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { memoryId, content } = await request.json();
    if (!memoryId || !content) {
      return NextResponse.json({ error: 'Memory ID and content required' }, { status: 400 });
    }

    const res = await fetch(`${MEMORY_SERVICE_URL}/memories/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memory_id: memoryId, data: content }),
    });

    const data = await res.json();
    return NextResponse.json({ success: data.success });
  } catch (error) {
    console.error('Update memory error:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
