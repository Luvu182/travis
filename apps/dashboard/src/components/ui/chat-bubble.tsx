'use client';

import { type ReactNode } from 'react';
import { Avatar } from './avatar';

type ChatBubbleVariant = 'user' | 'assistant' | 'system';

interface ChatBubbleProps {
  variant?: ChatBubbleVariant;
  message: string;
  timestamp?: string;
  avatar?: {
    src?: string;
    name?: string;
  };
  isTyping?: boolean;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}

const variantStyles: Record<ChatBubbleVariant, { container: string; bubble: string }> = {
  user: {
    container: 'flex-row-reverse',
    bubble: 'bg-primary-600 text-white rounded-2xl rounded-br-md',
  },
  assistant: {
    container: 'flex-row',
    bubble:
      'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-2xl rounded-bl-md',
  },
  system: {
    container: 'justify-center',
    bubble:
      'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 rounded-full text-sm px-4 py-1',
  },
};

export function ChatBubble({
  variant = 'assistant',
  message,
  timestamp,
  avatar,
  isTyping = false,
  actions,
  children,
  className = '',
}: ChatBubbleProps) {
  const styles = variantStyles[variant];

  if (variant === 'system') {
    return (
      <div className={`flex ${styles.container} my-2 ${className}`}>
        <span className={styles.bubble}>{message}</span>
      </div>
    );
  }

  return (
    <div className={`flex ${styles.container} gap-3 items-end mb-4 ${className}`}>
      {avatar && (
        <Avatar
          size="sm"
          src={avatar.src}
          name={avatar.name || (variant === 'assistant' ? 'AI' : 'User')}
        />
      )}
      <div
        className={`flex flex-col ${variant === 'user' ? 'items-end' : 'items-start'} max-w-[75%]`}
      >
        <div className={`${styles.bubble} px-4 py-3`}>
          {isTyping ? (
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-current rounded-full animate-bounce" />
              <span
                className="w-2 h-2 bg-current rounded-full animate-bounce"
                style={{ animationDelay: '0.1s' }}
              />
              <span
                className="w-2 h-2 bg-current rounded-full animate-bounce"
                style={{ animationDelay: '0.2s' }}
              />
            </div>
          ) : children ? (
            <div className="text-sm leading-relaxed whitespace-pre-wrap">{children}</div>
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message}</p>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1 px-1">
          {timestamp && (
            <span className="text-xs text-neutral-400 dark:text-neutral-500">{timestamp}</span>
          )}
          {actions}
        </div>
      </div>
    </div>
  );
}
