/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        burgundy: {
          50: '#fdf2f4',
          100: '#fce7ea',
          200: '#f8d0d7',
          300: '#f2a8b5',
          400: '#e8788d',
          500: '#d94f6b',
          600: '#c03050',
          700: '#a12240',
          800: '#871e39',
          900: '#731c34',
          950: '#6b1730',
        },
        wine: '#5C1A2E',
        cream: '#FAFAF8',
        parchment: '#F5F3EE',
      },
      fontFamily: {
        sans: ['var(--font-pp-neue)', 'system-ui', 'sans-serif'],
        display: ['var(--font-canela)', 'Georgia', 'serif'],
      },
      animation: {
        'fade-up': 'fadeUp 0.7s ease forwards',
        'fade-in': 'fadeIn 0.5s ease forwards',
        'counter-pulse': 'counterPulse 2s ease-in-out infinite',
        'brew': 'brew 3s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        counterPulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        brew: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
}
