import { cn } from '@/lib/utils';
import { forwardRef, type ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'lime';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center font-semibold',
          'rounded-full transition-spring',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          // Variants
          variant === 'primary' && [
            'bg-blue-600 text-white',
            'hover:bg-blue-700',
            'focus:ring-blue-500',
          ],
          variant === 'secondary' && [
            'bg-gray-800 text-white',
            'hover:bg-gray-900',
            'focus:ring-gray-500',
          ],
          variant === 'outline' && [
            'border-2 border-white/30 text-white bg-transparent',
            'hover:bg-white/10',
            'focus:ring-white/50',
          ],
          variant === 'ghost' && [
            'bg-transparent text-gray-700',
            'hover:bg-gray-100',
            'focus:ring-gray-300',
          ],
          variant === 'lime' && [
            'bg-lime-500 text-white',
            'hover:bg-lime-600',
            'focus:ring-lime-400',
          ],
          // Sizes
          size === 'sm' && 'px-4 py-2 text-sm',
          size === 'md' && 'px-6 py-3 text-base',
          size === 'lg' && 'px-8 py-4 text-lg',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
