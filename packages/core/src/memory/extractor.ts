import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { env } from '@travis/config';

// Schema for extracted info
export const extractedInfoSchema = z.object({
  items: z.array(
    z.object({
      type: z.enum(['task', 'decision', 'deadline', 'important', 'general']),
      content: z.string(),
      summary: z.string().optional(),
      assignee: z.string().optional(),
      dueDate: z.string().optional(), // ISO date string
      confidence: z.number().min(0).max(1),
    })
  ),
});

export type ExtractedInfo = z.infer<typeof extractedInfoSchema>;
export type ExtractedItem = ExtractedInfo['items'][number];

// Vietnamese-optimized extraction prompt
const EXTRACTION_PROMPT = `Bạn là trợ lý phân tích tin nhắn. Nhiệm vụ: trích xuất thông tin quan trọng từ tin nhắn group chat.

Phân loại thông tin:
- **task**: Công việc được giao (có người thực hiện cụ thể)
- **decision**: Quyết định đã đưa ra
- **deadline**: Thời hạn, lịch trình
- **important**: Thông tin quan trọng khác
- **general**: Thông tin chung cần ghi nhớ

Quy tắc:
1. Chỉ trích xuất thông tin thực sự quan trọng
2. Bỏ qua tin nhắn chào hỏi, hội thoại thông thường
3. Giữ nguyên ngôn ngữ gốc (Vietnamese)
4. Confidence >= 0.7 mới đáng tin cậy

Output JSON format:
{
  "items": [
    {
      "type": "task|decision|deadline|important|general",
      "content": "Nội dung đầy đủ",
      "summary": "Tóm tắt ngắn",
      "assignee": "Tên người được giao (nếu có)",
      "dueDate": "2025-12-20T00:00:00Z (nếu có)",
      "confidence": 0.85
    }
  ]
}

Nếu không có thông tin quan trọng, trả về: {"items": []}`;

/**
 * Extract important information from a message
 * @param message Message content to analyze
 * @param context Optional context (sender, group, recent messages)
 * @returns Array of extracted items with confidence >= 0.7
 */
export async function extractInfo(
  message: string,
  context?: {
    senderName?: string;
    groupName?: string;
    recentMessages?: string[];
  }
): Promise<ExtractedItem[]> {
  if (!message || message.trim().length === 0) {
    return [];
  }

  const contextStr = context?.recentMessages
    ? `\n\nContext (tin nhắn gần đây):\n${context.recentMessages.join('\n')}`
    : '';

  const prompt = `Sender: ${context?.senderName || 'Unknown'}
Group: ${context?.groupName || 'Unknown'}
Message: ${message}${contextStr}`;

  try {
    const { text } = await generateText({
      model: google('gemini-2.5-flash-lite') as any,
      system: EXTRACTION_PROMPT,
      prompt,
      temperature: 0.1,
    });

    // Parse JSON response
    const parsed = JSON.parse(text);
    const validated = extractedInfoSchema.parse(parsed);

    // Filter by confidence threshold
    const highConfidenceItems = validated.items.filter(item => item.confidence >= 0.7);

    return highConfidenceItems;
  } catch (error) {
    console.error('Failed to extract info from message:', error);
    // Return empty array on failure instead of throwing
    // This allows the system to continue processing other messages
    return [];
  }
}

/**
 * Batch extract information from multiple messages
 * @param messages Array of messages with context
 * @returns Array of extraction results
 */
export async function extractBatch(
  messages: Array<{
    content: string;
    context?: {
      senderName?: string;
      groupName?: string;
      recentMessages?: string[];
    };
  }>
): Promise<ExtractedItem[][]> {
  if (messages.length === 0) {
    return [];
  }

  try {
    const results = await Promise.all(
      messages.map(({ content, context }) => extractInfo(content, context))
    );

    return results;
  } catch (error) {
    console.error('Failed to extract batch:', error);
    throw new Error(`Batch extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validate and normalize due date string
 * @param dateStr Date string (various formats accepted)
 * @returns ISO date string or null
 */
export function normalizeDueDate(dateStr: string | undefined): string | null {
  if (!dateStr) return null;

  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;

    return date.toISOString();
  } catch {
    return null;
  }
}
