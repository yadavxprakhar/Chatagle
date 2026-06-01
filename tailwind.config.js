/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bgBase: '#0A0A0F',
        bgSecondary: '#12121A',
        bgInput: '#1A1A2E',
        accentPrimary: '#7C3AED',
        accentSecondary: '#A855F7',
        accentHot: '#EC4899',
        onlineGreen: '#10B981',
        dangerRed: '#EF4444',
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
