/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Headings aur Buttons ke liye (Professional & Bold)
        'primary': ['Montserrat', 'sans-serif'],
        // Serif touch ke liye (Luxury vibe)
        'accent': ['Playfair Display', 'serif'],
        // Logo style agar text use kar rahe ho
        'logo': ['League Spartan', 'sans-serif'],
      },
      letterSpacing: {
        'ultra-wide': '0.5em',
        'tighter-extra': '-0.05em',
      }
    },
  },
  plugins: [],
};