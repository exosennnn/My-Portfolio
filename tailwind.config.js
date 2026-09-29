/** @type {import('tailwindcss').Config} */
const jetbrains = ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'];

export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: jetbrains,
        mono: jetbrains,
      },
    },
  },
  plugins: [],
}
