/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'cs-primary': '#7b39fc',
        'cs-accent': '#a78bfa',
        'cs-deep': '#2b2344',
        'cs-surface': 'rgba(255,255,255,0.05)',
        'cs-border': 'rgba(255,255,255,0.1)',
        'cs-text': '#f6f7f9',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        serif: ['Instrument Serif', 'serif'],
        manrope: ['Manrope', 'sans-serif'],
        cabin: ['Cabin', 'sans-serif'],
      },
      backdropBlur: {
        glass: '10px',
      },
    },
  },
  plugins: [],
};
