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
        maroon: {
          DEFAULT: '#8B1D2C',
          dark: '#671420',
          light: '#A3283A',
        },
        gold: {
          DEFAULT: '#C89B3C',
          light: '#F4E4B8',
          pale: '#FBEFCE',
          deep: '#9C7526',
        },
        cream: {
          DEFAULT: '#FFFCF4',
          dark: '#FBF3DF',
        },
        blush: '#e8b4b8',
        ink: '#2B2118',
        'ink-soft': '#5A4A3A',
        charcoal: '#3A2F22',
        line: 'rgba(200,155,60,0.35)',
        success: '#3f7d4f',
      },
      fontFamily: {
        head: ['Bebas Neue', 'Georgia', 'sans-serif'],
        body: ['Poppins', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      borderRadius: {
        'xl': '10px',
      },
      boxShadow: {
        'custom': '0 10px 30px rgba(88, 21, 42, 0.10)',
        'custom-sm': '0 4px 14px rgba(88, 21, 42, 0.08)',
      },
      animation: {
        'fade-up': 'fadeUp 0.8s ease forwards',
        'float-y': 'floatY 6s ease-in-out infinite',
        'shine-sweep': 'shineSweep 5s ease-in-out infinite',
        'heart-pop': 'heartPop 0.45s ease',
        'btn-pulse': 'btnPulse 0.4s ease',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        floatY: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        shineSweep: {
          '0%': { left: '-60%' },
          '35%': { left: '130%' },
          '100%': { left: '130%' },
        },
        heartPop: {
          '0%': { transform: 'scale(1)' },
          '35%': { transform: 'scale(1.4)' },
          '60%': { transform: 'scale(0.92)' },
          '100%': { transform: 'scale(1)' },
        },
        btnPulse: {
          '0%': { transform: 'scale(1)' },
          '45%': { transform: 'scale(0.94)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};