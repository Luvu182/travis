import { type HTMLAttributes, type ReactNode } from 'react';

type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: ContainerSize;
  children: ReactNode;
}

const sizeStyles: Record<ContainerSize, string> = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-full',
};

export function Container({
  size = 'xl',
  className = '',
  children,
  ...props
}: ContainerProps) {
  return (
    <div
      className={`mx-auto px-4 sm:px-6 lg:px-8 w-full ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
