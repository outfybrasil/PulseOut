/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}", // Procura em todos os arquivos .ts(x) e .js(x)
  ],
  theme: {
    extend: {
      colors: {
        pulse: {
          base: '#0f172a', // Anchor Blue - Slate 900
          dark: '#020617', // Darker Anchor
          light: '#1e293b', // Lighter Anchor - Slate 800
          vitality: '#facc15', // Vitality Yellow - Yellow 400
          vitalityHover: '#eab308', // Darker Yellow
          accent: '#38bdf8', // Light Blue for subtle highlights
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}