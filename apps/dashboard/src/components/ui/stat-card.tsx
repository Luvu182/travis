'use client';

import { Card } from './card';
import { Icon, type IconName } from './icon';
import { cn } from '@/lib/utils';

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
    <Card variant="default" className={cn('group', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-500 mb-1">
            {label}
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-neutral-900">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </span>
            {suffix && (
              <span className="text-sm text-neutral-500">{suffix}</span>
            )}
          </div>
          {change && (
            <div
              className={cn(
                'flex items-center gap-1 mt-2 text-sm',
                change.type === 'increase' ? 'text-emerald-600' : 'text-red-600'
              )}
            >
              <Icon
                name={change.type === 'increase' ? 'chevron-up' : 'chevron-down'}
                size="xs"
              />
              <span>{Math.abs(change.value)}%</span>
              <span className="text-neutral-400">so với tuần trước</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
            <Icon
              name={icon}
              size="sm"
              className="text-primary-600"
            />
          </div>
        )}
      </div>
    </Card>
  );
}
