import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db, webConversations, webMessages } from '@jarvis/db';
import { eq, desc } from 'drizzle-orm';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const MEMORY_SERVICE_URL = process.env.MEMORY_SERVICE_URL || 'http://localhost:8000';

// GET /api/chat - List all conversations
export async function GET(_request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const conversations = await db
      .select()
      .from(webConversations)
      .where(eq(webConversations.adminUserId, session.user.id))
      .orderBy(desc(webConversations.updatedAt));

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}

// POST /api/chat - Send message (create conversation if needed)
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { message, conversationId, context = [], useMemory = true } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    let convId = conversationId;

    // Create new conversation if not provided
    if (!convId) {
      const [newConv] = await db
        .insert(webConversations)
        .values({
          adminUserId: session.user.id,
          title: message.slice(0, 50) + (message.length > 50 ? '...' : ''),
        })
        .returning();
      convId = newConv.id;
    }

    // Save user message
    await db.insert(webMessages).values({
      conversationId: convId,
      role: 'user',
      content: message,
    });

    // Build messages for LLM
    let memoryContext = '';
    if (useMemory) {
      try {
        const memRes = await fetch(`${MEMORY_SERVICE_URL}/memories/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: session.user.id,
            group_id: 'web_chat',
            query: message,
            limit: 5,
          }),
        });
        const memData = await memRes.json();
        if (memData.success && memData.data?.results?.length) {
          memoryContext = memData.data.results
            .map((m: { memory: string }) => m.memory)
            .join('\n');
        }
      } catch (e) {
        console.warn('Memory service unavailable:', e);
      }
    }

    // Build conversation context
    const messages = [
      {
        role: 'system',
        content: `Bạn là Jarvis, trợ lý AI thông minh. Trả lời bằng tiếng Việt, ngắn gọn và hữu ích.${
          memoryContext ? `\n\nThông tin đã biết về user:\n${memoryContext}` : ''
        }`,
      },
      ...context.slice(-10), // Last 10 messages from context
      { role: 'user', content: message },
    ];

    // Call main API for LLM response
    const llmRes = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });

    let response = 'Xin lỗi, không thể xử lý yêu cầu.';
    if (llmRes.ok) {
      const llmData = await llmRes.json();
      response = llmData.response || llmData.content || response;
    }

    // Save assistant message
    await db.insert(webMessages).values({
      conversationId: convId,
      role: 'assistant',
      content: response,
    });

    // Update conversation timestamp
    await db
      .update(webConversations)
      .set({ updatedAt: new Date() })
      .where(eq(webConversations.id, convId));

    // Save to memory (async, don't wait)
    if (useMemory) {
      fetch(`${MEMORY_SERVICE_URL}/memories/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: session.user.id,
          group_id: 'web_chat',
          message: message,
          sender_name: session.user.name || 'User',
        }),
      }).catch(() => {});
    }

    return NextResponse.json({
      response,
      conversationId: convId,
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Failed to process message' }, { status: 500 });
  }
}
