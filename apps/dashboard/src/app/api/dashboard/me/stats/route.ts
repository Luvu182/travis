import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db, webConversations, webMessages } from '@jarvis/db';
import { eq, count, desc, sql } from 'drizzle-orm';

const MEMORY_SERVICE_URL = process.env.MEMORY_SERVICE_URL || 'http://localhost:8000';

// GET /api/dashboard/me/stats - Get user's personal stats
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get conversation count
    const [convCount] = await db
      .select({ count: count() })
      .from(webConversations)
      .where(eq(webConversations.adminUserId, session.user.id));

    // Get message count
    const [msgCount] = await db
      .select({ count: count() })
      .from(webMessages)
      .innerJoin(webConversations, eq(webMessages.conversationId, webConversations.id))
      .where(eq(webConversations.adminUserId, session.user.id));

    // Get last active timestamp
    const [lastConv] = await db
      .select({ updatedAt: webConversations.updatedAt })
      .from(webConversations)
      .where(eq(webConversations.adminUserId, session.user.id))
      .orderBy(desc(webConversations.updatedAt))
      .limit(1);

    // Get memories count (from memory service)
    let memoriesCount = 0;
    try {
      const memRes = await fetch(`${MEMORY_SERVICE_URL}/memories/all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: session.user.id,
          group_id: 'web_chat',
          limit: 100,
        }),
      });
      const memData = await memRes.json();
      if (memData.success && memData.data?.results) {
        memoriesCount = memData.data.results.length;
      }
    } catch (e) {
      console.warn('Memory service unavailable:', e);
    }

    return NextResponse.json({
      totalConversations: convCount?.count || 0,
      totalMessages: msgCount?.count || 0,
      memoriesCount,
      lastActive: lastConv?.updatedAt || null,
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
