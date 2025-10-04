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
    extend: {},
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
