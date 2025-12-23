/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cosmic: {
          purple: '#a855f7',
          blue: '#6366f1',
          pink: '#ec4899'
        }
      },
      animation: {
        'twinkle': 'twinkle 3s infinite',
      },
      keyframes: {
        twinkle: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '1' }
        }
      }
    },
  },
  plugins: [],
}
