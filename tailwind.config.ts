/** @format */

import type { Config } from "tailwindcss";

const PRIMARY_COLOR = "#135292";

const generateColorShades = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return {
    50: `rgb(${Math.round(r + (255 - r) * 0.95)} ${Math.round(g + (255 - g) * 0.95)} ${Math.round(b + (255 - b) * 0.95)} / 1)`,
    100: `rgb(${Math.round(r + (255 - r) * 0.9)} ${Math.round(g + (255 - g) * 0.9)} ${Math.round(b + (255 - b) * 0.9)} / 1)`,
    200: `rgb(${Math.round(r + (255 - r) * 0.8)} ${Math.round(g + (255 - g) * 0.8)} ${Math.round(b + (255 - b) * 0.8)} / 1)`,
    300: `rgb(${Math.round(r + (255 - r) * 0.6)} ${Math.round(g + (255 - g) * 0.6)} ${Math.round(b + (255 - b) * 0.6)} / 1)`,
    500: hex,
    600: `rgb(${Math.round(r * 0.9)} ${Math.round(g * 0.9)} ${Math.round(b * 0.9)} / 1)`,
    700: `rgb(${Math.round(r * 0.8)} ${Math.round(g * 0.8)} ${Math.round(b * 0.8)} / 1)`,
  };
};

const config: Config = {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: generateColorShades(PRIMARY_COLOR),
      },
    },
  },
  plugins: [],
};

export default config;
export { PRIMARY_COLOR };
