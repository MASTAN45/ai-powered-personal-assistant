/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand Colors - Red, Yellow, Green
        brand: {
          red: {
            50: '#FEF2F2',
            100: '#FEE2E2',
            500: '#EA4335',
            600: '#DC2626',
            700: '#B91C1C',
          },
          yellow: {
            50: '#FFFBEB',
            100: '#FEF3C7',
            500: '#FBBC04',
            600: '#D97706',
            700: '#B45309',
          },
          green: {
            50: '#F0FDF4',
            100: '#DCFCE7',
            500: '#34A853',
            600: '#16A34A',
            700: '#15803D',
          },
        },
        // Light theme
        light: {
          bg: '#F8FAFC',
          surface: '#FFFFFF',
          border: '#E5E7EB',
          text: '#202124',
          'text-secondary': '#70757A',
        },
        // Dark theme
        dark: {
          bg: '#111318',
          surface: '#1B1F27',
          border: '#374151',
          text: '#F1F3F4',
          'text-secondary': '#9CA3AF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'premium': '0 4px 6px -1px rgba(234, 67, 53, 0.1), 0 2px 4px -1px rgba(251, 188, 4, 0.06)',
        'premium-lg': '0 10px 15px -3px rgba(234, 67, 53, 0.1), 0 4px 6px -2px rgba(251, 188, 4, 0.05)',
      },
    },
  },
  plugins: [],
};