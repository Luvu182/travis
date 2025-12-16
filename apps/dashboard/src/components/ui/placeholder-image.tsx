import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

interface PlaceholderImageProps extends HTMLAttributes<HTMLDivElement> {
  width?: number | string;
  height?: number | string;
  label?: string;
  variant?: 'default' | 'gradient' | 'isometric';
}

export function PlaceholderImage({
  className,
  width = '100%',
  height = 300,
  label = 'Image Placeholder',
  variant = 'default',
  ...props
}: PlaceholderImageProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-xl overflow-hidden',
        variant === 'default' && 'bg-gradient-to-br from-gray-100 to-gray-200',
        variant === 'gradient' && 'bg-gradient-to-br from-blue-500/20 to-purple-500/20',
        variant === 'isometric' && 'bg-gradient-to-br from-blue-600 to-blue-800',
        className
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
      {...props}
    >
      <div className="text-center p-4">
        {variant === 'isometric' ? (
          <IsometricPlaceholder />
        ) : (
          <>
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm text-gray-500 font-medium">{label}</p>
          </>
        )}
      </div>
    </div>
  );
}

function IsometricPlaceholder() {
  return (
    <svg viewBox="0 0 200 150" className="w-full h-full max-w-[300px]">
      {/* Base platform */}
      <polygon
        points="100,120 20,80 100,40 180,80"
        fill="rgba(255,255,255,0.1)"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="1"
      />
      {/* 3D Blocks */}
      <g transform="translate(60, 50)">
        <polygon points="40,0 80,20 40,40 0,20" fill="#3b82f6" />
        <polygon points="0,20 40,40 40,70 0,50" fill="#2563eb" />
        <polygon points="40,40 80,20 80,50 40,70" fill="#1d4ed8" />
      </g>
      {/* Data lines */}
      <line x1="100" y1="30" x2="100" y2="10" stroke="#7db710" strokeWidth="2" strokeDasharray="4" />
      <circle cx="100" cy="8" r="3" fill="#7db710" />
      <line x1="140" y1="60" x2="160" y2="40" stroke="#7db710" strokeWidth="2" strokeDasharray="4" />
      <circle cx="162" cy="38" r="3" fill="#7db710" />
      {/* Floating elements */}
      <rect x="150" y="70" width="30" height="20" rx="3" fill="rgba(255,255,255,0.9)" />
      <text x="165" y="84" fontSize="8" fill="#3b82f6" textAnchor="middle" fontWeight="bold">70%</text>
    </svg>
  );
}
