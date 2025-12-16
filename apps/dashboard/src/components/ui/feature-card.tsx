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
    <Card variant="default" hover className={`group relative ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-accent-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <Icon
            name={icon}
            size="lg"
            className="text-neutral-400 group-hover:text-primary-500 transition-colors"
          />
          {badge && (
            <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-600">
              {badge}
            </span>
          )}
        </div>

        <h3 className="text-lg font-semibold text-neutral-900 mb-2 group-hover:text-primary-700 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-neutral-600 leading-relaxed mb-4">
          {description}
        </p>

        {action && <div className="pt-2">{action}</div>}
      </div>
    </Card>
  );
}
