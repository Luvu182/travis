'use client';

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

type CardVariant = 'default' | 'glass' | 'elevated' | 'bordered' | 'gradient';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800',
  glass:
    'bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-neutral-200/50 dark:border-neutral-700/50',
  elevated: 'bg-white dark:bg-neutral-900 shadow-xl shadow-neutral-900/5 dark:shadow-neutral-900/50',
  bordered: 'bg-transparent border-2 border-neutral-200 dark:border-neutral-700',
  gradient:
    'bg-gradient-to-br from-primary-500/10 via-transparent to-accent-500/10 border border-primary-200/30 dark:border-primary-700/30',
};

const paddingStyles: Record<string, string> = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      hover = false,
      header,
      footer,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={`
          rounded-2xl overflow-hidden
          ${variantStyles[variant]}
          ${hover ? 'transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer' : ''}
          ${className}
        `}
        {...props}
      >
        {header && (
          <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
            {header}
          </div>
        )}
        <div className={paddingStyles[padding]}>{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
            {footer}
          </div>
        )}
      </div>
    );
  }
);

Card.displayName = 'Card';

export function CardContent({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}

export function CardHeader({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 ${className}`}
    >
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50 ${className}`}
    >
      {children}
    </div>
  );
}
