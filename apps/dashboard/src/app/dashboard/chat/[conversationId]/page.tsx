'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Send, RefreshCw, Bot, ArrowLeft, Pencil, Trash2, Check, X } from 'lucide-react';
import Link from 'next/link';
import { Button, Icon } from '@/components/ui';
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

export default function ConversationPage() {
  const params = useParams();
  const conversationId = params.conversationId as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [settings, setSettings] = useState<ChatSettings>(DEFAULT_SETTINGS);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoadingMemories, setIsLoadingMemories] = useState(false);
  const [showMemories, setShowMemories] = useState(true);
  const [conversationTitle, setConversationTitle] = useState('');
  const [editingMemoryId, setEditingMemoryId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Fetch conversation history
  const fetchHistory = useCallback(async () => {
    if (!conversationId) return;

    setIsLoadingHistory(true);
    try {
      const res = await fetch(`/api/chat/${conversationId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.messages) {
          setMessages(data.messages.map((m: { id: string; role: string; content: string; createdAt: string }) => ({
            id: m.id,
            role: m.role as 'user' | 'assistant',
            content: m.content,
            createdAt: m.createdAt,
          })));
        }
        if (data.conversation?.title) {
          setConversationTitle(data.conversation.title);
        }
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [conversationId]);

  // Fetch memories from dashboard API (which uses session user)
  const fetchMemories = useCallback(async () => {
    setIsLoadingMemories(true);
    try {
      const res = await fetch('/api/dashboard/me/memories');

      if (res.ok) {
        const data = await res.json();
        if (data.memories) {
          setMemories(data.memories);
        }
      }
    } catch (error) {
      console.error('Failed to fetch memories:', error);
    } finally {
      setIsLoadingMemories(false);
    }
  }, []);

  // Delete memory
  const deleteMemory = async (memoryId: string) => {
    try {
      const res = await fetch('/api/dashboard/me/memories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memoryId }),
      });
      if (res.ok) {
        setMemories(prev => prev.filter(m => m.id !== memoryId));
      }
    } catch (error) {
      console.error('Failed to delete memory:', error);
    }
  };

  // Update memory
  const updateMemory = async (memoryId: string) => {
    if (!editingContent.trim()) return;
    try {
      const res = await fetch('/api/dashboard/me/memories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memoryId, content: editingContent.trim() }),
      });
      if (res.ok) {
        setMemories(prev => prev.map(m =>
          m.id === memoryId ? { ...m, memory: editingContent.trim() } : m
        ));
        setEditingMemoryId(null);
        setEditingContent('');
      }
    } catch (error) {
      console.error('Failed to update memory:', error);
    }
  };

  // Start editing
  const startEditing = (memory: Memory) => {
    setEditingMemoryId(memory.id);
    setEditingContent(memory.memory);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingMemoryId(null);
    setEditingContent('');
  };

  // Load on mount
  useEffect(() => {
    const saved = localStorage.getItem('chat-settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch {
        // Ignore
      }
    }
    fetchHistory();
    fetchMemories();
  }, [fetchHistory, fetchMemories]);

  // Scroll to bottom
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

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      createdAt: new Date().toISOString(),
    };

    // Build context BEFORE updating state (includes previous messages + current)
    const previousMessages = messages.slice(-settings.contextLength);
    const context = [...previousMessages, userMessage].slice(-settings.contextLength).map(m => ({
      role: m.role,
      content: m.content,
    }));

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const assistantMessageId = crypto.randomUUID();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, assistantMessage]);

    try {

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

      if (!response.ok || !response.body) {
        throw new Error('Stream failed');
      }

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
                setMessages(prev =>
                  prev.map(msg =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: fullContent }
                      : msg
                  )
                );
              }
              if (data.done) break;
              if (data.error) throw new Error(data.error);
            } catch {
              // Ignore parse errors
            }
          }
        }
      }

      if (!fullContent) {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === assistantMessageId
              ? { ...msg, content: 'Xin lỗi, có lỗi xảy ra.' }
              : msg
          )
        );
      }

      // Refresh memories after message (memory extraction takes time)
      setTimeout(() => fetchMemories(), 2000);
      setTimeout(() => fetchMemories(), 5000);
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

  if (isLoadingHistory) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-neutral-500">Đang tải cuộc hội thoại...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-white">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="shrink-0 px-4 py-3 border-b border-neutral-200 flex items-center gap-3">
          <Link
            href="/dashboard/chat"
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-600" />
          </Link>
          <div>
            <h1 className="font-semibold text-neutral-900 truncate max-w-md">
              {conversationTitle || 'Cuộc hội thoại'}
            </h1>
            <p className="text-xs text-neutral-500">{messages.length} tin nhắn</p>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[40vh]">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-primary-500/25">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <p className="text-neutral-500">Chưa có tin nhắn nào</p>
              </div>
            ) : (
              messages.map((message) => (
                <ChatBubble
                  key={message.id}
                  variant={message.role}
                  message={message.content}
                  timestamp={message.content ? formatTime(message.createdAt) : undefined}
                  avatar={{ name: message.role === 'assistant' ? 'Jarvis' : 'User' }}
                  isTyping={message.role === 'assistant' && !message.content && isLoading}
                />
              ))
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
          </div>
        </div>
      </div>

      {/* Memories Sidebar */}
      {showMemories && (
        <div className="w-72 border-l border-neutral-200 bg-neutral-50 flex flex-col shrink-0">
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

          <div className="flex-1 overflow-y-auto scrollbar-hide p-3 space-y-3">
            {memories.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-xl bg-neutral-200 flex items-center justify-center mx-auto mb-3">
                  <Icon name="brain" size="md" className="text-neutral-400" />
                </div>
                <p className="text-sm text-neutral-500">Chưa có memories</p>
              </div>
            ) : (
              memories.map((memory) => (
                <div
                  key={memory.id}
                  className="group p-3 bg-white rounded-xl border border-neutral-200 hover:border-neutral-300 transition-colors"
                >
                  {editingMemoryId === memory.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        className="w-full text-sm text-neutral-800 bg-neutral-50 border border-neutral-200 rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                        rows={3}
                        autoFocus
                      />
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={cancelEditing}
                          className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => updateMemory(memory.id)}
                          className="p-1.5 text-primary-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-neutral-800 leading-relaxed">
                        {memory.memory}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-neutral-400">
                          {formatMemoryDate(memory.updated_at || memory.created_at)}
                        </p>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => startEditing(memory)}
                            className="p-1 text-neutral-400 hover:text-primary-500 hover:bg-primary-50 rounded transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteMemory(memory.id)}
                            className="p-1 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="px-4 py-3 border-t border-neutral-200">
            <p className="text-xs text-neutral-400 text-center">
              {memories.length} memories
            </p>
          </div>
        </div>
      )}

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
