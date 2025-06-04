import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        bd: {
          green: '#99EA48',
          darkgreen: '#8bca4c'
        }
      },
      fontSize: {
        '2xs': ['.55rem', {
            lineHeight: '1rem',
        }],
    },
    },
  },
  plugins: [],
} satisfies Config;
