/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#ffffff',
          dim: '#a0a0a0',
        },
        surface: {
          DEFAULT: '#0a0a0a',
          card: '#111111',
          border: '#1f1f1f',
          hover: '#161616',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
