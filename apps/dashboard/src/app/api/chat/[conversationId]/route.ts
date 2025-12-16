import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db, webConversations, webMessages } from '@jarvis/db';
import { eq, and, asc } from 'drizzle-orm';

// GET /api/chat/[conversationId] - Get conversation with messages
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { conversationId } = await params;

  try {
    // Verify ownership
    const [conversation] = await db
      .select()
      .from(webConversations)
      .where(
        and(
          eq(webConversations.id, conversationId),
          eq(webConversations.adminUserId, session.user.id)
        )
      );

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Get messages
    const messages = await db
      .select()
      .from(webMessages)
      .where(eq(webMessages.conversationId, conversationId))
      .orderBy(asc(webMessages.createdAt));

    return NextResponse.json({ conversation, messages });
  } catch (error) {
    console.error('Get conversation error:', error);
    return NextResponse.json({ error: 'Failed to fetch conversation' }, { status: 500 });
  }
}

// DELETE /api/chat/[conversationId] - Delete conversation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { conversationId } = await params;

  try {
    // Verify ownership and delete
    const result = await db
      .delete(webConversations)
      .where(
        and(
          eq(webConversations.id, conversationId),
          eq(webConversations.adminUserId, session.user.id)
        )
      )
      .returning();

    if (!result.length) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete conversation error:', error);
    return NextResponse.json({ error: 'Failed to delete conversation' }, { status: 500 });
  }
}
