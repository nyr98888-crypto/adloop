import type { Config } from "tailwindcss";
import rtl from "tailwindcss-rtl";

/**
 * One Loop Social — vibrant sky-blue brand (cloud emblem)
 * Primary #0077F6 · Deep #005AC2 · Light #4DACFF · Soft #BAE6FD
 */
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./types/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#0077F6",
          vivid: "#0284FE",
          deep: "#005AC2",
          deeper: "#0048A0",
          accent: "#0052CC",
          light: "#4DACFF",
          soft: "#BAE6FD",
          canvas: "#F8FAFC",
          surface: "#FFFFFF",
          ok: "#10B981",
          warn: "#F59E0B",
        },
        sky: {
          DEFAULT: "#0077F6",
          vivid: "#0284FE",
          deep: "#005AC2",
          light: "#4DACFF",
          soft: "#BAE6FD",
        },
      },
      backgroundImage: {
        "brand-sidebar":
          "linear-gradient(to bottom, #0077F6 0%, #0052CC 100%)",
        "brand-header":
          "linear-gradient(to left, #0284FE 0%, #005AC2 100%)",
      },
    },
  },
  plugins: [rtl],
};

export default config;
