'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button, Icon, Container, Badge, Avatar } from '@/components/ui';

// Dynamic date helpers
const formatDate = (date: Date) =>
  date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

const getTomorrowDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return formatDate(tomorrow);
};

const getDaysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
};

const getDaysFromNow = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return formatDate(date);
};

const demoConversations = [
  {
    user: 'Nhắc tôi họp với team marketing lúc 3h chiều mai nhé',
    assistant: 'Đã ghi nhớ! Tôi sẽ nhắc bạn trước 30 phút.',
    extracted: {
      type: 'meeting',
      title: 'Họp team marketing',
      fields: [
        { label: 'Thời gian', value: '15:00' },
        { label: 'Ngày', value: getTomorrowDate() },
        { label: 'Nhắc nhở', value: '30 phút trước' },
      ],
    },
  },
  {
    user: 'Tìm lại quyết định về ngân sách Q4 tuần trước',
    assistant: `Tìm thấy từ cuộc họp ngày ${getDaysAgo(7)}:`,
    extracted: {
      type: 'memory',
      title: 'Quyết định ngân sách Q4',
      fields: [
        { label: 'Tổng ngân sách', value: '500M VND' },
        { label: 'Marketing', value: '40%' },
        { label: 'R&D', value: '35%' },
        { label: 'Nguồn', value: `Họp ${getDaysAgo(7)}` },
      ],
    },
  },
  {
    user: 'Ai được assign task redesign homepage?',
    assistant: 'Tìm thấy trong Sprint Planning:',
    extracted: {
      type: 'task',
      title: 'Redesign Homepage',
      fields: [
        { label: 'Người thực hiện', value: 'Minh' },
        { label: 'Deadline', value: getDaysFromNow(3) },
        { label: 'Trạng thái', value: 'In Progress' },
        { label: 'Sprint', value: 'Sprint 23' },
      ],
    },
  },
];

type Phase = 'idle' | 'typing-user' | 'extracting' | 'typing-assistant' | 'done';

export function HeroSection() {
  const [conversationIndex, setConversationIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [userText, setUserText] = useState('');
  const [assistantText, setAssistantText] = useState('');
  const [showExtracted, setShowExtracted] = useState(false);

  const currentConvo = demoConversations[conversationIndex];

  const resetAndNext = useCallback(() => {
    setUserText('');
    setAssistantText('');
    setShowExtracted(false);
    setPhase('idle');
    setConversationIndex((prev) => (prev + 1) % demoConversations.length);
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (phase === 'idle') {
      timeout = setTimeout(() => setPhase('typing-user'), 800);
    } else if (phase === 'typing-user') {
      if (userText.length < currentConvo.user.length) {
        timeout = setTimeout(() => {
          setUserText(currentConvo.user.slice(0, userText.length + 1));
        }, 30);
      } else {
        timeout = setTimeout(() => setPhase('extracting'), 600);
      }
    } else if (phase === 'extracting') {
      timeout = setTimeout(() => {
        setShowExtracted(true);
        timeout = setTimeout(() => setPhase('typing-assistant'), 800);
      }, 500);
    } else if (phase === 'typing-assistant') {
      if (assistantText.length < currentConvo.assistant.length) {
        timeout = setTimeout(() => {
          setAssistantText(currentConvo.assistant.slice(0, assistantText.length + 1));
        }, 25);
      } else {
        setPhase('done');
      }
    } else if (phase === 'done') {
      timeout = setTimeout(resetAndNext, 4000);
    }

    return () => clearTimeout(timeout);
  }, [phase, userText, assistantText, currentConvo, resetAndNext]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'meeting': return 'clock';
      case 'memory': return 'memory';
      case 'task': return 'check';
      default: return 'sparkles';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'text-blue-500 bg-blue-50';
      case 'memory': return 'text-purple-500 bg-purple-50';
      case 'task': return 'text-emerald-500 bg-emerald-50';
      default: return 'text-primary-500 bg-primary-50';
    }
  };

  return (
    <section className="relative min-h-[calc(100vh-100px)] flex items-center py-12 lg:py-16 overflow-hidden bg-neutral-50 bg-dots-light">
      <Container className="relative">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div className="text-center lg:text-left">
            <Badge variant="primary" className="mb-5">
              <Icon name="sparkles" size="xs" className="mr-1" />
              Trợ Lý AI Thông Minh
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 leading-tight mb-5">
              Trợ Lý Thông Minh
              <span className="block text-gradient">Cho Người Việt</span>
            </h1>

            <p className="text-lg md:text-xl text-neutral-700 mb-7 max-w-xl mx-auto lg:mx-0">
              J.A.R.V.I.S ghi nhớ mọi thứ, tự động trích xuất công việc, và giúp team của bạn
              luôn ngăn nắp trên Telegram và Lark Suite.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/dashboard/chat">
                <Button size="lg" rightIcon={<Icon name="arrow-right" size="sm" />}>
                  Dùng Thử Miễn Phí
                </Button>
              </Link>
              <a href="#features">
                <Button variant="outline" size="lg" leftIcon={<Icon name="play" size="sm" />}>
                  Xem Tính Năng
                </Button>
              </a>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-6 mt-8">
              <div className="flex -space-x-2">
                {['Minh', 'Lan', 'Đức', 'Hoa'].map((name) => (
                  <Avatar key={name} name={name} size="sm" />
                ))}
              </div>
              <div className="text-sm text-neutral-700">
                <span className="font-semibold text-neutral-900">500+</span> teams đang sử dụng
              </div>
            </div>
          </div>

          <div className="relative" id="demo">
            {/* Chat Window */}
            <div className="relative bg-gradient-to-b from-neutral-50 to-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-neutral-100">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="flex items-center gap-2">
                    <Icon name="bot" size="xs" className="text-primary-600" />
                    <span className="text-sm font-medium text-neutral-700">J.A.R.V.I.S Chat</span>
                  </div>
                </div>
                <Badge variant="success" size="sm" dot>
                  Online
                </Badge>
              </div>

              {/* Chat Content */}
              <div className="p-5 min-h-[320px]">
                <div className="space-y-4">
                  {/* User Message */}
                  {(phase !== 'idle') && userText && (
                    <div className="flex items-start gap-3 justify-end animate-fadeIn">
                      <div className="max-w-[85%]">
                        <div className="bg-primary-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5">
                          <p className="text-sm leading-relaxed">
                            {userText}
                            {phase === 'typing-user' && (
                              <span className="inline-block w-0.5 h-4 bg-white/80 ml-0.5 animate-pulse" />
                            )}
                          </p>
                        </div>
                      </div>
                      <Avatar name="User" size="sm" className="shrink-0" />
                    </div>
                  )}

                  {/* Extracting indicator */}
                  {phase === 'extracting' && !showExtracted && (
                    <div className="flex items-start gap-3 animate-fadeIn">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shrink-0">
                        <Icon name="bot" size="xs" className="text-white" />
                      </div>
                      <div className="bg-neutral-100 rounded-2xl rounded-tl-sm px-4 py-2.5">
                        <div className="flex items-center gap-2 text-sm text-neutral-500">
                          <Icon name="sparkles" size="xs" className="animate-pulse" />
                          <span>Đang phân tích...</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Extracted Info Card */}
                  {showExtracted && currentConvo.extracted && (
                    <div className="flex items-start gap-3 animate-fadeIn">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shrink-0">
                        <Icon name="bot" size="xs" className="text-white" />
                      </div>
                      <div className="flex-1 max-w-[85%] space-y-2">
                        {/* Extracted card */}
                        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
                          <div className="px-3 py-2 bg-neutral-50 border-b border-neutral-100 flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-md flex items-center justify-center ${getTypeColor(currentConvo.extracted.type)}`}>
                              <Icon name={getTypeIcon(currentConvo.extracted.type) as any} size="xs" />
                            </div>
                            <span className="text-sm font-medium text-neutral-800">
                              {currentConvo.extracted.title}
                            </span>
                          </div>
                          <div className="p-3 grid grid-cols-2 gap-2">
                            {currentConvo.extracted.fields.map((field, i) => (
                              <div key={i} className="text-xs">
                                <span className="text-neutral-400">{field.label}</span>
                                <p className="font-medium text-neutral-700">{field.value}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Assistant response */}
                        {assistantText && (
                          <div className="bg-neutral-100 rounded-2xl rounded-tl-sm px-4 py-2.5">
                            <p className="text-sm text-neutral-700 leading-relaxed">
                              {assistantText}
                              {phase === 'typing-assistant' && (
                                <span className="inline-block w-0.5 h-4 bg-primary-600 ml-0.5 animate-pulse" />
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Empty State */}
                  {phase === 'idle' && (
                    <div className="flex flex-col items-center justify-center h-[220px] text-center">
                      <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mb-3">
                        <Icon name="sparkles" size="md" className="text-primary-600" />
                      </div>
                      <p className="text-sm text-neutral-400">Đang bắt đầu hội thoại...</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Input Bar */}
              <div className="px-4 py-3 bg-white border-t border-neutral-100">
                <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-2.5 border border-neutral-200">
                  <input
                    type="text"
                    placeholder="Hỏi J.A.R.V.I.S bất cứ điều gì..."
                    className="flex-1 bg-transparent text-sm outline-none text-neutral-900 placeholder:text-neutral-400"
                    disabled
                  />
                  <Button size="sm" className="px-3">
                    <Icon name="send" size="xs" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
