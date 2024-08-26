/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,vue}', // Adjust to your source directory
    './components/**/*.{js,ts,jsx,tsx,vue}',
    './app/**/*.{js,ts,jsx,tsx,vue}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
