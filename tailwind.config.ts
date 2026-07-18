import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest:  "#2E4D38",
        beige:   "#f8e9de",
        rose:    "#DDAA9A",
        teal:    "#165A63",
        dark:    "#1C1C1A",
        darkbg:  "#242420",
        darksurface: "#252520",
      },
      fontFamily: {
        serif:  ["Cormorant", "Georgia", "serif"],
        sans:   ["DM Sans", "Inter", "system-ui", "sans-serif"],
        script: ["Dancing Script", "cursive"],
      },
      letterSpacing: { widest: "0.2em" },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
