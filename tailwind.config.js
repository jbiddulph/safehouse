/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue", 
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
    "./app/**/*.{js,vue,ts}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#caf0f8',
          100: '#caf0f8',
          200: '#90e0ef',
          300: '#90e0ef',
          400: '#00b4d8',
          500: '#00b4d8',
          600: '#0077b6',
          700: '#0077b6',
          800: '#03045e',
          900: '#03045e',
          DEFAULT: '#0077b6',
          dark: '#03045e',
          light: '#00b4d8',
          lighter: '#90e0ef',
          lightest: '#caf0f8',
        },
      },
    },
  },
  plugins: [],
  // Safelist patterns that might be dynamically generated
  safelist: [
    // Add any dynamically generated class names here if needed
  ],
  // Ensure Tailwind doesn't try to parse JavaScript expressions as CSS
  corePlugins: {
    // Keep all core plugins enabled
  },
  // Add experimental features to handle Vue templates better
  experimental: {
    optimizeUniversalDefaults: true
  }
}
