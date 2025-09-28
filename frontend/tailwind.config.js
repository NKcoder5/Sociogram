/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'instagram-blue': '#1877f2',
        'instagram-gray': '#8e8e8e',
        'instagram-light-gray': '#fafafa',
        'instagram-border': '#dbdbdb',
      },
      fontFamily: {
        'instagram': ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      },
    },
  },
  plugins: [],
}
