/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        orange: { DEFAULT: '#F2871D', dark: '#C96A12', light: '#FCE3C5' },
        green:  { DEFAULT: '#8FB524', dark: '#5F7D18', light: '#E6EFC9' },
        accent: { DEFAULT: '#2E75B6', light: '#D9E8F5' },
        ink: '#26261F',
        paper: '#FBFAF6',
      },
      fontFamily: {
        display: ['"Baloo 2"', '"Noto Sans TC"', 'sans-serif'],
        sans: ['"Noto Sans TC"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 12px rgba(38,38,31,0.08)',
      },
      keyframes: {
        crossIn: {
          '0%': { transform: 'translate(-60px,-60px) rotate(-8deg)', opacity: 0 },
          '100%': { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
        },
        crossInRev: {
          '0%': { transform: 'translate(60px,-60px) rotate(8deg)', opacity: 0 },
          '100%': { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
        },
      },
      animation: {
        crossIn: 'crossIn .6s cubic-bezier(.16,1,.3,1) forwards',
        crossInRev: 'crossInRev .6s cubic-bezier(.16,1,.3,1) forwards',
      },
    },
  },
  plugins: [],
}
