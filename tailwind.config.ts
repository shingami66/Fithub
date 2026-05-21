import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './config/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        neonAccent: '#deff9a',
        neon: {
          50: '#f5ffe6',
          100: '#e8ffc4',
          200: '#deff9a',
          300: '#c8f060',
          400: '#b0d83a',
          500: '#92b820',
          600: '#729314',
          700: '#566f10',
          800: '#455812',
          900: '#3b4b14',
          950: '#1e2906',
        },
        surface: {
          DEFAULT: '#0a0a0a',
          50: '#141414',
          100: '#1a1a1a',
          200: '#222222',
          300: '#2a2a2a',
          400: '#333333',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        glow: '0 0 20px rgba(222, 255, 154, 0.15)',
        'glow-sm': '0 0 10px rgba(222, 255, 154, 0.1)',
        'glow-lg': '0 0 40px rgba(222, 255, 154, 0.2)',
        card: '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-neon': 'pulseNeon 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseNeon: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(222, 255, 154, 0.1)' },
          '50%': { boxShadow: '0 0 25px rgba(222, 255, 154, 0.25)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
