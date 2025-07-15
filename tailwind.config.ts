import type { Config } from "tailwindcss";
import { fontFamily } from 'tailwindcss/defaultTheme'

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
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
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', ...fontFamily.sans],
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
