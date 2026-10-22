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
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
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
        sans: ['"Google Sans"', '"Open Sans"', 'sans-serif'],
        heading: ['"Google Sans"', '"Open Sans"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
