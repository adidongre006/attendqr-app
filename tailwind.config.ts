import type { Config } from 'tailwindcss';

// Design tokens for AttendQR.
// Palette is a deep navy/charcoal "ledger" base (evokes an attendance
// register at night) with a warm amber accent used only for the "verified /
// present" moments (QR glow, present badges, primary actions) and a cool
// teal used sparingly for secondary/live indicators.
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0A0D16', // page background
          900: '#10141F', // section background
          800: '#171C2C', // card surface
          700: '#232A3D', // card border / hover surface
          600: '#3A4258',
        },
        amber: {
          400: '#F0C265',
          500: '#E8B24D', // primary accent — "verified" gold
          600: '#C9942F',
        },
        teal: {
          400: '#5FE0D0',
          500: '#3FCBB9', // live / rotating indicator
        },
        slate: {
          200: '#E7E9F1',
          400: '#9096AC',
          500: '#6E7590',
        },
      },
      fontFamily: {
        sans: ['var(--font-jakarta)', 'ui-sans-serif', 'system-ui'],
        mono: ['var(--font-fira)', 'ui-monospace', 'SFMono-Regular'],
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(232,178,77,0.25), 0 20px 60px -20px rgba(232,178,77,0.35)',
      },
      keyframes: {
        pulseRing: {
          '0%': { transform: 'scale(0.9)', opacity: '0.6' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
      },
      animation: {
        pulseRing: 'pulseRing 1.8s ease-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
