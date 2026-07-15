import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        city: {
          bg: "#0a0e1a",
          panel: "#12172b",
          panelBorder: "#1f2542",
        },
        building: {
          about: "#3b5aa8",
          skills: "#5a4fcf",
          ios: "#3ea36b",
          projects: "#d98a2b",
          github: "#7b3fa0",
          blog: "#c9a227",
          contact: "#3d8bc9",
          resume: "#c94b4b",
        },
        window: {
          lit: "#ffd76a",
          unlit: "#0d1120",
        },
        accent: {
          pin: "#ff5c4d",
        },
      },
      keyframes: {
        twinkle: {
          '0%, 100%': { opacity: '0.2' },
          '50%': { opacity: '1' },
        }
      },
      animation: {
        twinkle: 'twinkle 4s ease-in-out infinite',
      }
    },
  },
  plugins: [],
};
export default config;
