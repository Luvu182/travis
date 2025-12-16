'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Button,
  Icon,
  Container,
  Badge,
  ChatBubble,
  StreamingText,
  Avatar,
} from '@/components/ui';

const demoMessages = [
  {
    role: 'user' as const,
    message: 'Nhắc tôi họp với team marketing lúc 3h chiều mai nhé',
  },
  {
    role: 'assistant' as const,
    message:
      'Tôi đã ghi nhớ cuộc họp của bạn với team marketing vào 3h chiều ngày mai. Tôi sẽ nhắc bạn trước 30 phút. Bạn có muốn tôi tạo lịch trên Google Calendar không?',
  },
  {
    role: 'user' as const,
    message: 'Tìm lại quyết định về ngân sách Q4 tuần trước',
  },
  {
    role: 'assistant' as const,
    message:
      'Dựa trên cuộc họp ngày 10/12, team đã quyết định: Ngân sách Q4 là 500M VND, phân bổ 40% marketing, 35% R&D, 25% operations. Deadline phê duyệt: 15/12.',
  },
];

export function HeroSection() {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [showResponse, setShowResponse] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setShowResponse(true);
        setTimeout(() => {
          setShowResponse(false);
          setCurrentMessageIndex((prev) => (prev + 2) % demoMessages.length);
        }, 4000);
      }, 1500);
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  const userMessage = demoMessages[currentMessageIndex];
  const assistantMessage = demoMessages[currentMessageIndex + 1];

  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary-50/50 via-white to-white dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-950" />

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-400/20 rounded-full blur-3xl" />
      </div>

      <Container className="relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="text-center lg:text-left">
            <Badge variant="primary" className="mb-6">
              <Icon name="sparkles" size="xs" className="mr-1" />
              AI-Powered Executive Assistant
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 dark:text-white leading-tight mb-6">
              Your Intelligent
              <span className="block text-gradient">Vietnamese Assistant</span>
            </h1>

            <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 mb-8 max-w-xl mx-auto lg:mx-0">
              J.A.R.V.I.S remembers everything, extracts tasks automatically, and helps
              your team stay organized across Telegram and Lark Suite.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/dashboard/chat">
                <Button size="lg" rightIcon={<Icon name="arrow-right" size="sm" />}>
                  Try Now - Free
                </Button>
              </Link>
              <a href="#demo">
                <Button variant="outline" size="lg" leftIcon={<Icon name="play" size="sm" />}>
                  Watch Demo
                </Button>
              </a>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-6 mt-10">
              <div className="flex -space-x-2">
                {['Minh', 'Lan', 'Duc', 'Hoa'].map((name, i) => (
                  <Avatar key={name} name={name} size="sm" />
                ))}
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                <span className="font-semibold text-neutral-900 dark:text-white">500+</span> teams
                already using
              </div>
            </div>
          </div>

          <div className="relative" id="demo">
            <div className="relative bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl shadow-neutral-900/10 dark:shadow-neutral-900/50 border border-neutral-200 dark:border-neutral-800 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400 ml-2">
                  J.A.R.V.I.S Chat
                </span>
                <Badge variant="success" size="sm" dot className="ml-auto">
                  Online
                </Badge>
              </div>

              <div className="p-6 min-h-[320px] space-y-4">
                <ChatBubble
                  variant="user"
                  message={userMessage.message}
                  avatar={{ name: 'User' }}
                />

                {isTyping && (
                  <ChatBubble
                    variant="assistant"
                    message=""
                    isTyping
                    avatar={{ name: 'AI' }}
                  />
                )}

                {showResponse && assistantMessage && (
                  <ChatBubble
                    variant="assistant"
                    message=""
                    avatar={{ name: 'AI' }}
                  >
                    <StreamingText text={assistantMessage.message} speed={20} />
                  </ChatBubble>
                )}

                {!isTyping && !showResponse && assistantMessage && (
                  <ChatBubble
                    variant="assistant"
                    message={assistantMessage.message}
                    avatar={{ name: 'AI' }}
                  />
                )}
              </div>

              <div className="px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center gap-2 bg-white dark:bg-neutral-900 rounded-xl px-4 py-2 border border-neutral-200 dark:border-neutral-700">
                  <input
                    type="text"
                    placeholder="Ask J.A.R.V.I.S anything..."
                    className="flex-1 bg-transparent text-sm outline-none text-neutral-900 dark:text-white placeholder:text-neutral-400"
                    disabled
                  />
                  <Button size="sm" className="px-3">
                    <Icon name="send" size="xs" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary-600/30 animate-float">
              <Icon name="brain" size="lg" />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
