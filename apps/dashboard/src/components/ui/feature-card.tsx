'use client';

import { type ReactNode } from 'react';
import { Card } from './card';
import { Icon, type IconName } from './icon';

interface FeatureCardProps {
  icon: IconName;
  title: string;
  description: string;
  badge?: string;
  action?: ReactNode;
  className?: string;
}

export function FeatureCard({
  icon,
  title,
  description,
  badge,
  action,
  className = '',
}: FeatureCardProps) {
  return (
    <Card variant="glass" hover className={`group relative ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-accent-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform duration-300">
            <Icon name={icon} size="md" />
          </div>
          {badge && (
            <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
              {badge}
            </span>
          )}
        </div>

        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
          {title}
        </h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
          {description}
        </p>

        {action && <div className="pt-2">{action}</div>}
      </div>
    </Card>
  );
}
