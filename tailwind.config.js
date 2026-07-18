/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'xoxo-dark-bg': '#0e0d0b',
        'xoxo-dark-card': '#161411',
        'xoxo-dark-border': '#24201b',
        'xoxo-gold': '#d4af37',
        'xoxo-gold-hover': '#e5c158',
        'xoxo-cream': '#f5f2eb',
      }
    },
  },
  plugins: [],
};