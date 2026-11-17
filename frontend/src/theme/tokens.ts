// Premium Red-Yellow-Green Design System Theme
// Inspired by Gmail's color harmony but with original branding

export const designTokens = {
  // Primary Brand Colors
  colors: {
    brand: {
      red: {
        50: '#FEF2F2',
        100: '#FEE2E2',
        500: '#EA4335', // Premium Red - Primary brand
        600: '#DC2626',
        700: '#B91C1C',
      },
      yellow: {
        50: '#FFFBEB',
        100: '#FEF3C7',
        500: '#FBBC04', // Golden Yellow - Highlights & pending
        600: '#D97706',
        700: '#B45309',
      },
      green: {
        50: '#F0FDF4',
        100: '#DCFCE7',
        500: '#34A853', // Professional Green - Success & complete
        600: '#16A34A',
        700: '#15803D',
      },
    },

    // Neutral System Colors
    neutral: {
      // Light theme
      light: {
        bg: '#F8FAFC',
        surface: '#FFFFFF',
        border: '#E5E7EB',
        text: {
          primary: '#202124',
          secondary: '#70757A',
          disabled: '#9CA3AF',
        },
      },
      // Dark theme
      dark: {
        bg: '#111318',
        surface: '#1B1F27',
        border: '#374151',
        text: {
          primary: '#F1F3F4',
          secondary: '#9CA3AF',
          disabled: '#6B7280',
        },
      },
    },

    // Semantic Colors
    semantic: {
      error: '#EF4444',
      warning: '#F59E0B',
      info: '#3B82F6',
      success: '#10B981',
    },
  },

  // Typography
  typography: {
    fontFamily: {
      sans: 'Inter, system-ui, -apple-system, sans-serif',
      mono: 'JetBrains Mono, Consolas, monospace',
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  // Spacing
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
  },

  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.25rem',   // 4px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    full: '9999px',
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },

  // Z-index
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
    chatbot: 1080,
  },
};

export type DesignTokens = typeof designTokens;