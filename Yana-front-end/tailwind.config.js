/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.html",  
  ],
  theme: {
    extend: {
      fontFamily: {
        barlow: ['Barlow', 'sans-serif']},
        colors: {
          'main': '#d61125',
          'custom-blue': '#0E6D99',
          'custom-blue-dark': '#084d80',
          'customer-red':'#D61125',
          'three': '#e00256',
          'black': '#212121',
          'white': '#ffffff',
          'custom-gray': '#808080e2',
        },
    },
  },
  plugins: [],
}