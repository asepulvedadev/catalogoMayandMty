/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#110363',
      },
      screens: {
        'sm': '640px',    // Móvil grande
        'md': '768px',    // Tablet
        'lg': '1024px',   // Desktop
        'xl': '1280px',   // Desktop grande
        '2xl': '1536px',  // Desktop extra grande
      },
    },
  },
  plugins: [],
}