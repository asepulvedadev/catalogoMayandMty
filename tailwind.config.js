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
          DEFAULT: '#110363',
          50: '#eceaff',
          100: '#d8d5ff',
          200: '#b1abff',
          300: '#8a81ff',
          400: '#6357ff',
          500: '#3c2dff',
          600: '#1503ff',
          700: '#1102cc',
          800: '#0d0299',
          900: '#090166',
          950: '#050133'
        }
      },
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      boxShadow: {
        'inner-lg': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.10)',
      },
      maxHeight: {
        '128': '32rem',
      },
      scale: {
        '102': '1.02',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms')
  ],
}