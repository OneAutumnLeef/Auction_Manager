/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ipl-blue': {
          50: '#e6f2ff',
          100: '#b3d9ff',
          200: '#80c0ff',
          300: '#4da6ff',
          400: '#268dff',
          500: '#0073ff',
          600: '#0061d6',
          700: '#004fad',
          800: '#003c85',
          900: '#002a5c',
        },
        'ipl-purple': {
          50: '#f2e6ff',
          100: '#d9b3ff',
          200: '#c080ff',
          300: '#a64dff',
          400: '#8c1aff',
          500: '#7300e6',
          600: '#5c00b8',
          700: '#45008a',
          800: '#2e005c',
          900: '#17002e',
        },
        'ipl-gold': {
          50: '#fff8e6',
          100: '#ffeab3',
          200: '#ffdc80',
          300: '#ffce4d',
          400: '#ffc01a',
          500: '#e6aa00',
          600: '#b88a00',
          700: '#8a6600',
          800: '#5c4400',
          900: '#2e2200',
        },
      },
      backgroundImage: {
        'cricket-pattern': "url('https://img.freepik.com/free-vector/cricket-background-with-stadium-ball_1017-32462.jpg')",
        'ipl-gradient': 'linear-gradient(135deg, #004ba0 0%, #0073e6 40%, #5c00b8 100%)',
        'card-gradient': 'linear-gradient(to right bottom, #0c4a6e, #0f172a)',
        'gold-gradient': 'linear-gradient(135deg, #975a16 0%, #ca8a04 40%, #fbbf24 90%, #fef3c7 100%)',
      },
      fontFamily: {
        'cricket': ['Montserrat', 'sans-serif'],
      },
      boxShadow: {
        'player-card': '0 15px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
        'neon': '0 0 15px rgba(0, 115, 255, 0.7), 0 0 30px rgba(0, 115, 255, 0.4)',
        'gold': '0 0 15px rgba(255, 190, 0, 0.7), 0 0 30px rgba(255, 190, 0, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}