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
        // Kalyan-style brand red is the primary/action colour (mapped onto the
        // former "maroon" token so every existing usage flips automatically).
        maroon: {
          DEFAULT: '#D81E28',
          dark: '#AF141C',
          light: '#E94A52',
        },
        gold: {
          DEFAULT: '#C6A15B',
          light: '#EBD9AE',
          pale: '#F6EFDD',
          deep: '#9C7526',
        },
        // Page background is now white; "cream.dark" is a soft off-white section fill.
        cream: {
          DEFAULT: '#FFFFFF',
          dark: '#F7F4EF',
        },
        blush: '#e8b4b8',
        ink: '#1A1A1A',
        'ink-soft': '#565656',
        charcoal: '#1A1A1A',
        line: 'rgba(0,0,0,0.12)',
        success: '#2e7d46',
      },
      fontFamily: {
        head: ['Montserrat', 'Poppins', 'sans-serif'],
        body: ['Poppins', 'sans-serif'],
        mono: ['Montserrat', 'Poppins', 'sans-serif'],
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