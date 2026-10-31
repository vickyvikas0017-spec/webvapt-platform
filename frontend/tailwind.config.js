/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  '#f0f4ff',
          100: '#e0eaff',
          200: '#c0d0ff',
          300: '#91adff',
          400: '#5b7fff',
          500: '#3b5bff',
          600: '#1e3fff',
          700: '#1432d4',
          800: '#1228a8',
          900: '#0f1f7c',
          950: '#0a1254',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
