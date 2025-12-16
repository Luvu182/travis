/**
 * JARVIS Design System Tokens
 *
 * AI-native design with neutral tones and purple accent
 * Tech Startup typography: Space Grotesk + DM Sans
 */

export const colors = {
  // Primary - AI Purple
  primary: {
    50: '#FAF5FF',
    100: '#F3E8FF',
    200: '#E9D5FF',
    300: '#D8B4FE',
    400: '#C084FC',
    500: '#A855F7',
    600: '#9333EA',
    700: '#7C3AED',
    800: '#6B21A8',
    900: '#581C87',
    950: '#3B0764',
  },

  // Secondary - Slate (Neutral)
  neutral: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
    950: '#020617',
  },

  // Accent - Cyan (CTA)
  accent: {
    50: '#ECFEFF',
    100: '#CFFAFE',
    200: '#A5F3FC',
    300: '#67E8F9',
    400: '#22D3EE',
    500: '#06B6D4',
    600: '#0891B2',
    700: '#0E7490',
    800: '#155E75',
    900: '#164E63',
  },

  // Success
  success: {
    50: '#F0FDF4',
    500: '#22C55E',
    600: '#16A34A',
  },

  // Warning
  warning: {
    50: '#FFFBEB',
    500: '#F59E0B',
    600: '#D97706',
  },

  // Error
  error: {
    50: '#FEF2F2',
    500: '#EF4444',
    600: '#DC2626',
  },
} as const;

export const typography = {
  fonts: {
    heading: "'Space Grotesk', system-ui, sans-serif",
    body: "'DM Sans', system-ui, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
  },

  fontSizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.75rem', // 60px
  },

  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  lineHeights: {
    tight: 1.1,
    snug: 1.25,
    normal: 1.5,
    relaxed: 1.625,
  },
} as const;

export const spacing = {
  0: '0',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  32: '8rem',
} as const;

export const borderRadius = {
  none: '0',
  sm: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
} as const;

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  glow: '0 0 20px -5px rgb(124 58 237 / 0.3)',
  'glow-lg': '0 0 40px -10px rgb(124 58 237 / 0.4)',
} as const;

export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  normal: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  spring: '300ms cubic-bezier(0.64, -0.09, 0.13, 1.15)',
} as const;

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// CSS variables for runtime theming
export const cssVariables = {
  light: {
    '--background': colors.neutral[50],
    '--foreground': colors.neutral[900],
    '--card': '#FFFFFF',
    '--card-foreground': colors.neutral[900],
    '--primary': colors.primary[700],
    '--primary-foreground': '#FFFFFF',
    '--secondary': colors.neutral[100],
    '--secondary-foreground': colors.neutral[900],
    '--muted': colors.neutral[100],
    '--muted-foreground': colors.neutral[500],
    '--accent': colors.accent[500],
    '--accent-foreground': '#FFFFFF',
    '--border': colors.neutral[200],
    '--ring': colors.primary[700],
  },
  dark: {
    '--background': colors.neutral[950],
    '--foreground': colors.neutral[50],
    '--card': colors.neutral[900],
    '--card-foreground': colors.neutral[50],
    '--primary': colors.primary[500],
    '--primary-foreground': '#FFFFFF',
    '--secondary': colors.neutral[800],
    '--secondary-foreground': colors.neutral[50],
    '--muted': colors.neutral[800],
    '--muted-foreground': colors.neutral[400],
    '--accent': colors.accent[400],
    '--accent-foreground': colors.neutral[950],
    '--border': colors.neutral[800],
    '--ring': colors.primary[500],
  },
} as const;