import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1.25rem", lg: "2rem" },
      screens: { "2xl": "1280px" },
    },
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        latin: ["var(--font-latin)", "serif"],
      },
      colors: {
        // ذهبي الشمبانيا — لون البراند الأساسي
        gold: {
          50: "#FAF6EF",
          100: "#F3E8D3",
          200: "#E8D2AC",
          300: "#DBB97F",
          400: "#CDA15A",
          500: "#C08D45",
          600: "#A4762F",
          700: "#835E26",
          800: "#634724",
          900: "#4A3720",
        },
        // وردي العروسة
        blush: {
          50: "#FCF5F4",
          100: "#F8E8E6",
          200: "#F1D2CF",
          300: "#E6B3AE",
          400: "#D8908A",
          500: "#C77169",
          600: "#B0564E",
          700: "#8F423B",
        },
        // كريمي / عاجي للخلفيات
        cream: {
          50: "#FEFCF8",
          100: "#FBF7F0",
          200: "#F6EFE3",
          300: "#EFE3D0",
          400: "#E4D3B8",
        },
        // بني داكن للنصوص
        espresso: {
          600: "#5C4A3C",
          700: "#4A3B30",
          800: "#3A2E26",
          900: "#2A211B",
        },
        pearl: "#FFFDFA",
      },
      boxShadow: {
        soft: "0 10px 40px -12px rgba(74, 55, 32, 0.18)",
        glow: "0 0 0 1px rgba(192, 141, 69, 0.18), 0 18px 50px -18px rgba(192, 141, 69, 0.45)",
        card: "0 14px 50px -22px rgba(74, 55, 32, 0.28)",
      },
      backgroundImage: {
        "gold-shine":
          "linear-gradient(110deg, #C08D45 0%, #E8D2AC 30%, #C08D45 55%, #835E26 100%)",
        "cream-radial":
          "radial-gradient(1200px 600px at 50% -10%, #FBF7F0 0%, #F6EFE3 45%, #EFE3D0 100%)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.22,1,0.36,1) both",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 6s linear infinite",
        "spin-slow": "spin-slow 22s linear infinite",
        marquee: "marquee 38s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
