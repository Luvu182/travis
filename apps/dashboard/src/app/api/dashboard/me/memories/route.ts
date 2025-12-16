import { NextResponse } from 'next/server';
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

    // Transform memory data
    const memories = (memData.data?.results || []).map((m: {
      id: string;
      memory: string;
      metadata?: Record<string, unknown>;
      created_at?: string;
    }) => ({
      id: m.id,
      memory: m.memory,
      metadata: m.metadata,
      created_at: m.created_at,
    }));

    return NextResponse.json({ memories });
  } catch (error) {
    console.error('Get memories error:', error);
    return NextResponse.json({ memories: [] });
  }
}
