'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, RefreshCw, Bot } from 'lucide-react';
import { Button, Badge, Icon } from '@/components/ui';
import { ChatBubble } from '@/components/ui/chat-bubble';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

interface Memory {
  id: string;
  memory: string;
  created_at: string;
  updated_at: string;
}

interface ChatSettings {
  contextLength: number;
  useMemory: boolean;
}

const DEFAULT_SETTINGS: ChatSettings = {
  contextLength: 10,
  useMemory: true,
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<ChatSettings>(DEFAULT_SETTINGS);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoadingMemories, setIsLoadingMemories] = useState(false);
  const [showMemories, setShowMemories] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Web user ID (generate or load from localStorage)
  const getUserId = useCallback(() => {
    let id = localStorage.getItem('web-user-id');
    if (!id) {
      id = `web-${crypto.randomUUID()}`;
      localStorage.setItem('web-user-id', id);
    }
    return id;
  }, []);

  // Fetch memories from API
  const fetchMemories = useCallback(async () => {
    setIsLoadingMemories(true);
    try {
      const userId = getUserId();
      const res = await fetch(`${API_URL}/search/all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          groupId: 'web-dashboard',
          limit: 20,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data?.results) {
          // Sort by updated_at descending (newest first)
          const sorted = [...data.data.results].sort((a, b) =>
            new Date(b.updated_at || b.created_at).getTime() -
            new Date(a.updated_at || a.created_at).getTime()
          );
          setMemories(sorted);
        }
      }
    } catch (error) {
      console.error('Failed to fetch memories:', error);
    } finally {
      setIsLoadingMemories(false);
    }
  }, [getUserId]);

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('chat-settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch {
        // Ignore invalid JSON
      }
    }
    // Initial fetch of memories
    fetchMemories();
  }, [fetchMemories]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  // Build context from recent messages
  const buildContext = () => {
    const recentMessages = messages.slice(-settings.contextLength);
    return recentMessages.map(m => ({
      role: m.role,
      content: m.content,
    }));
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Create placeholder for streaming response
    const assistantMessageId = crypto.randomUUID();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, assistantMessage]);

    try {
      const context = buildContext();

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          conversationId,
          context,
          useMemory: settings.useMemory,
          stream: true,
        }),
      });

      // Get conversationId from header
      const newConvId = response.headers.get('X-Conversation-Id');
      if (newConvId && !conversationId) {
        setConversationId(newConvId);
      }

      if (!response.ok || !response.body) {
        throw new Error('Stream failed');
      }

      // Read SSE stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                fullContent += data.content;
                // Update message content in real-time
                setMessages(prev =>
                  prev.map(msg =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: fullContent }
                      : msg
                  )
                );
              }
              if (data.done) {
                // Stream complete
                break;
              }
              if (data.error) {
                throw new Error(data.error);
              }
            } catch (e) {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }

      // If no content received, show error
      if (!fullContent) {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === assistantMessageId
              ? { ...msg, content: 'Xin lỗi, có lỗi xảy ra.' }
              : msg
          )
        );
      }

      // Refresh memories after message
      setTimeout(() => fetchMemories(), 1500);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantMessageId
            ? { ...msg, content: 'Không thể kết nối với server. Vui lòng thử lại.' }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatMemoryDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }) + ' · ' + date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex h-full bg-white">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-primary-500/25">
                  <Bot className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-neutral-900 mb-2">Xin chào! Tôi là Jarvis.</h1>
                <p className="text-neutral-500 text-center max-w-md">
                  Tôi là trợ lý AI với khả năng ghi nhớ dài hạn. Hãy hỏi tôi bất cứ điều gì!
                </p>
                <div className="flex flex-wrap gap-2 mt-6 justify-center">
                  <Badge variant="default" size="sm">
                    <Icon name="brain" size="xs" className="mr-1" />
                    Long-term Memory
                  </Badge>
                  <Badge variant="default" size="sm">
                    <Icon name="lightning" size="xs" className="mr-1" />
                    Gemini Flash
                  </Badge>
                  <Badge variant="default" size="sm">
                    <Icon name="sparkles" size="xs" className="mr-1" />
                    Vietnamese
                  </Badge>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <ChatBubble
                  key={message.id}
                  variant={message.role}
                  message={message.content}
                  timestamp={formatTime(message.createdAt)}
                  avatar={{ name: message.role === 'assistant' ? 'Jarvis' : 'User' }}
                />
              ))
            )}
            {isLoading && (
              <ChatBubble
                variant="assistant"
                message=""
                isTyping
                avatar={{ name: 'Jarvis' }}
              />
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="shrink-0 bg-white px-4 py-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-3 items-center">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập tin nhắn... (Enter để gửi, Shift+Enter để xuống dòng)"
                rows={1}
                className="flex-1 resize-none px-4 py-3 border border-neutral-200 rounded-2xl bg-neutral-50 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all scrollbar-hide overflow-hidden"
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                variant="primary"
                className="h-12 w-12 rounded-xl p-0 shrink-0 flex items-center justify-center"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-xs text-neutral-400 mt-2 text-center">
              Jarvis có thể mắc lỗi. Hãy kiểm tra các thông tin quan trọng.
            </p>
          </div>
        </div>
      </div>

      {/* Memories Sidebar */}
      {showMemories && (
        <div className="w-72 border-l border-neutral-200 bg-neutral-50 flex flex-col shrink-0">
          {/* Header */}
          <div className="px-4 py-3 border-b border-neutral-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="brain" size="sm" className="text-primary-600" />
              <span className="font-semibold text-neutral-900">Memories</span>
            </div>
            <button
              onClick={fetchMemories}
              disabled={isLoadingMemories}
              className="p-1.5 hover:bg-neutral-200 rounded-lg transition-colors text-neutral-500 hover:text-neutral-700"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingMemories ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Memories List */}
          <div className="flex-1 overflow-y-auto scrollbar-hide p-3 space-y-3">
            {memories.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-xl bg-neutral-200 flex items-center justify-center mx-auto mb-3">
                  <Icon name="brain" size="md" className="text-neutral-400" />
                </div>
                <p className="text-sm text-neutral-500">Chưa có memories</p>
                <p className="text-xs text-neutral-400 mt-1">
                  Chat để tạo memories mới
                </p>
              </div>
            ) : (
              memories.map((memory) => (
                <div
                  key={memory.id}
                  className="p-3 bg-white rounded-xl border border-neutral-200 hover:border-neutral-300 transition-colors"
                >
                  <p className="text-sm text-neutral-800 leading-relaxed">
                    {memory.memory}
                  </p>
                  <p className="text-xs text-neutral-400 mt-2">
                    {formatMemoryDate(memory.updated_at || memory.created_at)}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-neutral-200">
            <p className="text-xs text-neutral-400 text-center">
              {memories.length} memories
            </p>
          </div>
        </div>
      )}

      {/* Toggle Memories Button (when hidden) */}
      {!showMemories && (
        <button
          onClick={() => setShowMemories(true)}
          className="fixed right-4 top-1/2 -translate-y-1/2 p-2 bg-white border border-neutral-200 rounded-lg shadow-sm hover:bg-neutral-50 transition-colors"
        >
          <Icon name="brain" size="sm" className="text-primary-600" />
        </button>
      )}
    </div>
  );
}
