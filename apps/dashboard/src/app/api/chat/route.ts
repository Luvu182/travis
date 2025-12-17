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

// POST /api/chat - Send message with streaming support
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { message, conversationId, context = [], useMemory = true, stream = false } = body;

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
    // Note: context from frontend already includes the current user message
    const now = new Date();
    const currentDate = now.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const currentTime = now.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });

    // Calculate reference dates
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date(now);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    const formatDate = (d: Date) =>
      `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;

    const messages = [
      {
        role: 'system',
        content: `Bạn là Jarvis, trợ lý điều hành (Executive Assistant) thông minh và chuyên nghiệp.

📅 THỜI GIAN HIỆN TẠI: ${currentDate}, ${currentTime} (Việt Nam)

📆 BẢNG QUY ĐỔI THỜI GIAN:
- Hôm nay = ${formatDate(now)}
- Hôm qua = ${formatDate(yesterday)}
- Ngày mai = ${formatDate(tomorrow)}
- Ngày mốt/ngày kia = ${formatDate(dayAfterTomorrow)}

🎯 VAI TRÒ CỦA BẠN:
- Hỗ trợ quản lý lịch trình, công việc, deadline
- Ghi nhận thông tin quan trọng (liên hệ, tài liệu, quyết định)
- Nhắc nhở và theo dõi tiến độ công việc
- Trả lời ngắn gọn, chuyên nghiệp, hữu ích

📌 QUY TẮC QUAN TRỌNG:
1. LUÔN dùng ngày tuyệt đối khi xác nhận lịch (VD: "${formatDate(dayAfterTomorrow)}" thay vì "ngày mốt")
2. Khi user nói "ngày mốt" → chuyển thành ${formatDate(dayAfterTomorrow)} (2 ngày sau hôm nay)
3. Khi user nói "ngày mai" → chuyển thành ${formatDate(tomorrow)} (1 ngày sau hôm nay)
4. Xác nhận lại thông tin quan trọng để tránh hiểu lầm
5. Trả lời bằng tiếng Việt, tự nhiên nhưng chuyên nghiệp${
          memoryContext ? `\n\n🧠 THÔNG TIN ĐÃ BIẾT VỀ USER:\n${memoryContext}` : ''
        }`,
      },
      ...context.slice(-10),
    ];

    // Streaming response
    if (stream) {
      const llmRes = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, stream: true }),
      });

      if (!llmRes.ok || !llmRes.body) {
        return NextResponse.json({ error: 'LLM request failed' }, { status: 500 });
      }

      // Create a TransformStream to collect full response for saving
      let fullResponse = '';
      const decoder = new TextDecoder();
      const userId = session.user.id;
      const userName = session.user.name || 'User';
      const userMessage = message;

      const transformStream = new TransformStream({
        transform(chunk, controller) {
          const text = decoder.decode(chunk);
          // Parse SSE data to collect full response
          const lines = text.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.content) {
                  fullResponse += data.content;
                }
              } catch {
                // Ignore parse errors
              }
            }
          }
          controller.enqueue(chunk);
        },
        async flush() {
          // Save assistant message after stream completes
          if (fullResponse) {
            await db.insert(webMessages).values({
              conversationId: convId,
              role: 'assistant',
              content: fullResponse,
            });
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
                  user_id: userId,
                  group_id: 'web_chat',
                  message: userMessage,
                  sender_name: userName,
                  platform: 'web',
                }),
              }).catch((e) => console.warn('Memory add failed:', e));
            }
          }
        },
      });

      // Pipe the response through transform stream
      const readable = llmRes.body.pipeThrough(transformStream);

      // Return SSE response with conversationId header
      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
          'X-Conversation-Id': convId,
        },
      });
    }

    // Non-streaming response
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
          platform: 'web',
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
