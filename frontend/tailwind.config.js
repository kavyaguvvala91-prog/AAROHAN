/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          600: '#2563eb',
        },
      },
      boxShadow: {
        soft: '0 10px 30px rgba(37, 99, 235, 0.12)',
      },
    },
  },
  plugins: [],
};