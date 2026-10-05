/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          500: '#fb923c',
          600: '#fc8019',
          700: '#e66b10',
          800: '#c2410c',
        },
        secondary: {
          500: '#fbbf24',
          600: '#f59e0b',
        },
        gray: {
          50: '#F0F0F5',
          100: '#E9E9EB',
          200: '#D4D5D9',
          300: '#93959F',
          400: '#7E808C',
          500: '#686B78',
          600: '#535665',
          700: '#3D4152',
          800: '#282C3F',
          900: '#171A29',
        }
      },
      fontFamily: {
        sans: ['Lora', 'serif'],
        heading: ['Nunito', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
