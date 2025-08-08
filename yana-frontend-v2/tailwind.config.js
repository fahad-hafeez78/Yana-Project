/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.html",
  ],
  theme: {
    extend: {
      fontFamily: {
        barlow: ['Barlow', 'sans-serif']
      },
      colors: {
        primary: {
          light: '#6D862B',
          DEFAULT: '#38580C',
          dark: '#302916',
        },
        secondary: {
          light: '#95A961',
          DEFAULT: '#7C9F37',
          dark: '#38580C',
        },
        beige: {
          light: '#faf6e0ff',
          DEFAULT: '#DFDAB0',
          dark: '#C7C18D',
        },
        gray: {
          light: '#d1d5db',
          DEFAULT: '#9ca3af',
          dark: '#6b7280',
        },
        red: {
          light: '#FEE2E2',
          DEFAULT: '#D61125',
          dark: '#991B1B',
        },
        blue: {
          light: '#B3E0FF',
          DEFAULT: '#0E6D99',
          dark: '#084d80',
        },
        green: {
          light: '#86EFAC',
          DEFAULT: '#16A34A',
          dark: '#15803D',
        },
        'black': '#212121',
        'white': '#ffffff',
      },
    },
  },
  plugins: [],
}