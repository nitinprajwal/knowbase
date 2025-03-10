/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf8f1',
          100: '#f9eee0',
          200: '#f3dfc1',
          300: '#eee2d2', // Main brand color
          400: '#eeb76b',
          500: '#e9a84c',
          600: '#d98e35',
          700: '#b3702a',
          800: '#8f5a28',
          900: '#744b25',
          950: '#412a14',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.gray.700'),
            a: {
              color: theme('colors.primary.500'),
              '&:hover': {
                color: theme('colors.primary.600'),
              },
            },
            h1: {
              color: theme('colors.gray.900'),
            },
            h2: {
              color: theme('colors.gray.900'),
            },
            h3: {
              color: theme('colors.gray.900'),
            },
          },
        },
      }),
    },
  },
  plugins: [],
};