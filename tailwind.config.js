/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ai-dark': '#0f172a',
        'ai-card': '#1e293b',
        'ai-accent': '#3b82f6',
      }
    },
  },
  plugins: [],
}
