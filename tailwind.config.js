/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'erco': {
          primary: 'rgb(36 170 0)',
          secondary: 'rgb(228 221 0)',
          tertiary: 'rgb(145 205 0)',
        }
      },
      backdropBlur: {
        'xs': '2px',
      },
      backgroundColor: {
        'glass': 'rgba(255, 255, 255, 0.1)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
} 