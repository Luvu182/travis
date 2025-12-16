'use client';

import { type ReactNode } from 'react';
import { Card } from './card';
import { Icon, type IconName } from './icon';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  icon?: IconName;
  suffix?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  change,
  icon,
  suffix,
  className = '',
}: StatCardProps) {
  return (
    <Card variant="glass" className={className}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">
            {label}
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </span>
            {suffix && (
              <span className="text-sm text-neutral-500 dark:text-neutral-400">{suffix}</span>
            )}
          </div>
          {change && (
            <div
              className={`flex items-center gap-1 mt-2 text-sm ${
                change.type === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              <Icon
                name={change.type === 'increase' ? 'chevron-up' : 'chevron-down'}
                size="xs"
              />
              <span>{Math.abs(change.value)}%</span>
              <span className="text-neutral-400">vs last week</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
            <Icon name={icon} size="sm" />
          </div>
        )}
      </div>
    </Card>
  );
}
