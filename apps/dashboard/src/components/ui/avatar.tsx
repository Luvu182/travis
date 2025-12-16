'use client';

import { useState, type ImgHTMLAttributes } from 'react';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'size'> {
  size?: AvatarSize;
  name?: string;
  status?: 'online' | 'offline' | 'busy' | 'away';
}

const sizeStyles: Record<AvatarSize, { container: string; text: string; status: string }> = {
  xs: { container: 'w-6 h-6', text: 'text-xs', status: 'w-1.5 h-1.5 border' },
  sm: { container: 'w-8 h-8', text: 'text-sm', status: 'w-2 h-2 border' },
  md: { container: 'w-10 h-10', text: 'text-base', status: 'w-2.5 h-2.5 border-2' },
  lg: { container: 'w-12 h-12', text: 'text-lg', status: 'w-3 h-3 border-2' },
  xl: { container: 'w-16 h-16', text: 'text-xl', status: 'w-4 h-4 border-2' },
};

const statusColors: Record<string, string> = {
  online: 'bg-green-500',
  offline: 'bg-neutral-400',
  busy: 'bg-red-500',
  away: 'bg-amber-500',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getColorFromName(name: string): string {
  const colors = [
    'bg-primary-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-amber-500',
    'bg-red-500',
    'bg-pink-500',
    'bg-purple-500',
    'bg-indigo-500',
  ];
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
}

export function Avatar({
  size = 'md',
  name,
  status,
  src,
  alt,
  className = '',
  ...props
}: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const styles = sizeStyles[size];

  const showFallback = !src || imgError;

  return (
    <div className={`relative inline-flex ${className}`}>
      {showFallback ? (
        <div
          className={`
            ${styles.container}
            ${name ? getColorFromName(name) : 'bg-neutral-300 dark:bg-neutral-700'}
            rounded-full flex items-center justify-center text-white font-medium
            ${styles.text}
          `}
        >
          {name ? getInitials(name) : '?'}
        </div>
      ) : (
        <img
          src={src}
          alt={alt || name || 'Avatar'}
          onError={() => setImgError(true)}
          className={`${styles.container} rounded-full object-cover`}
          {...props}
        />
      )}
      {status && (
        <span
          className={`
            absolute bottom-0 right-0 block rounded-full
            ${styles.status}
            ${statusColors[status]}
            border-white dark:border-neutral-900
          `}
        />
      )}
    </div>
  );
}
