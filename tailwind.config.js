/** @type {import('tailwindcss').Config} */
export default {
  content: ["index.html", "./src/**/*.{js,jsx,ts,tsx,vue,html}"],
  theme: {
    extend: {
      colors: {
        "th-bg": "var(--theme-primary)",
        "th-text": "var(--theme-text-color)",
      },
    },
  },
  plugins: [],
};
