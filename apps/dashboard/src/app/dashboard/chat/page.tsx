'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Settings, Trash2, Bot, User, Plus, MessageSquare, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { TypingIndicator } from '@/components/ui/typing-indicator';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
}

interface ChatSettings {
  contextLength: number;
  useMemory: boolean;
}

const DEFAULT_SETTINGS: ChatSettings = {
  contextLength: 10,
  useMemory: true,
};

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<ChatSettings>(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [loadingConversations, setLoadingConversations] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
  }, []);

  // Load conversations on mount
  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/chat');
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Load messages when conversation changes
  useEffect(() => {
    if (!currentConversationId) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      try {
        const res = await fetch(`/api/chat/${currentConversationId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
        }
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    };

    loadMessages();
  }, [currentConversationId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

    try {
      const context = buildContext();

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          conversationId: currentConversationId,
          context,
          useMemory: settings.useMemory,
        }),
      });

      const data = await response.json();

      // Update current conversation ID if new conversation was created
      if (data.conversationId && !currentConversationId) {
        setCurrentConversationId(data.conversationId);
        // Refresh conversations list
        loadConversations();
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.response || 'Xin lỗi, có lỗi xảy ra.',
        createdAt: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Không thể kết nối với server. Vui lòng thử lại.',
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const startNewChat = () => {
    setCurrentConversationId(null);
    setMessages([]);
  };

  const selectConversation = (id: string) => {
    setCurrentConversationId(id);
  };

  const deleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Xóa cuộc trò chuyện này?')) return;

    try {
      const res = await fetch(`/api/chat/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setConversations(prev => prev.filter(c => c.id !== id));
        if (currentConversationId === id) {
          setCurrentConversationId(null);
          setMessages([]);
        }
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Hôm nay';
    if (days === 1) return 'Hôm qua';
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-neutral-50 dark:bg-neutral-950">
      {/* Sidebar - Conversations List */}
      {showSidebar && (
        <div className="w-64 border-r border-neutral-200 dark:border-neutral-800 flex flex-col bg-white dark:bg-neutral-900">
          <div className="p-3 border-b border-neutral-200 dark:border-neutral-800">
            <Button
              onClick={startNewChat}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Cuộc trò chuyện mới
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingConversations ? (
              <div className="p-4 text-center text-neutral-500 dark:text-neutral-400">Đang tải...</div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-neutral-500 dark:text-neutral-400 text-sm">
                Chưa có cuộc trò chuyện nào
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => selectConversation(conv.id)}
                    className={`group flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all duration-200 ${
                      currentConversationId === conv.id
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                        : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{conv.title}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">{formatDate(conv.updatedAt)}</p>
                    </div>
                    <button
                      onClick={(e) => deleteConversation(conv.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-red-500 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <ChevronLeft className={`w-5 h-5 transition-transform ${showSidebar ? '' : 'rotate-180'}`} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                Chat với Jarvis
              </h1>
            </div>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
              showSettings ? 'text-primary-500' : 'text-neutral-500'
            }`}
            title="Cài đặt"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="px-4 py-3 bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-200 dark:border-neutral-800">
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-3">
                <label className="text-sm text-neutral-600 dark:text-neutral-400">
                  Số tin nhắn context:
                </label>
                <select
                  value={settings.contextLength}
                  onChange={(e) => {
                    const newSettings = { ...settings, contextLength: Number(e.target.value) };
                    setSettings(newSettings);
                    localStorage.setItem('chat-settings', JSON.stringify(newSettings));
                  }}
                  className="px-3 py-1.5 text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                >
                  {[5, 10, 15, 20, 30, 50].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-neutral-600 dark:text-neutral-400">
                  Sử dụng Memory:
                </label>
                <input
                  type="checkbox"
                  checked={settings.useMemory}
                  onChange={(e) => {
                    const newSettings = { ...settings, useMemory: e.target.checked };
                    setSettings(newSettings);
                    localStorage.setItem('chat-settings', JSON.stringify(newSettings));
                  }}
                  className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 text-primary-600 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-neutral-500 dark:text-neutral-400">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary-500/25">
                <Bot className="w-10 h-10 text-white" />
              </div>
              <p className="text-lg font-medium text-neutral-700 dark:text-neutral-300">Xin chào! Tôi là Jarvis.</p>
              <p className="text-sm mt-2">Hãy gửi tin nhắn để bắt đầu trò chuyện.</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <Card
                  className={`max-w-[70%] px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-primary-600 text-white border-transparent'
                      : 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 border-neutral-200 dark:border-neutral-700'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-primary-200' : 'text-neutral-500 dark:text-neutral-400'
                  }`}>
                    {formatTime(message.createdAt)}
                  </p>
                </Card>
                {message.role === 'user' && (
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                    <User className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
                  </div>
                )}
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <Card className="px-4 py-3 bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
                <TypingIndicator />
              </Card>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <div className="flex gap-3 items-end">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => handleKeyDown(e)}
              placeholder="Nhập tin nhắn... (Enter để gửi, Shift+Enter để xuống dòng)"
              rows={1}
              className="flex-1 resize-none"
              style={{ maxHeight: '120px' }}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="p-3 bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
