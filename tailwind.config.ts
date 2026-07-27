import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      /* ─── Colors (CSS variable references) ─── */
      colors: {
        canvas: {
          DEFAULT: "var(--color-canvas)",
          soft: "var(--color-canvas-soft)",
          "soft-2": "var(--color-canvas-soft-2)",
          elevated: "var(--color-canvas-elevated)",
        },
        ink: "var(--color-ink)",
        body: "var(--color-body)",
        mute: "var(--color-mute)",
        hairline: {
          DEFAULT: "var(--color-hairline)",
          strong: "var(--color-hairline-strong)",
        },
        primary: {
          DEFAULT: "var(--color-primary)",
          foreground: "var(--color-on-primary)",
        },
        link: {
          DEFAULT: "var(--color-link)",
          deep: "var(--color-link-deep)",
        },
        success: {
          DEFAULT: "var(--color-success)",
          soft: "var(--color-success-soft)",
        },
        error: {
          DEFAULT: "var(--color-error)",
          soft: "var(--color-error-soft)",
        },
        warning: {
          DEFAULT: "var(--color-warning)",
          soft: "var(--color-warning-soft)",
        },
      },

      /* ─── Font Families ─── */
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "monospace"],
      },

      /* ─── Font Size (with line-height + letter-spacing) ─── */
      fontSize: {
        "display-xl": ["48px", { lineHeight: "48px", letterSpacing: "-2.4px", fontWeight: "600" }],
        "display-lg": ["32px", { lineHeight: "40px", letterSpacing: "-1.28px", fontWeight: "600" }],
        "display-md": ["24px", { lineHeight: "32px", letterSpacing: "-0.96px", fontWeight: "600" }],
        "display-sm": ["20px", { lineHeight: "28px", letterSpacing: "-0.6px", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "28px", letterSpacing: "0px", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "24px", letterSpacing: "0px", fontWeight: "400" }],
        "body-sm": ["14px", { lineHeight: "20px", letterSpacing: "-0.28px", fontWeight: "400" }],
        caption: ["12px", { lineHeight: "16px", letterSpacing: "0px", fontWeight: "400" }],
        code: ["13px", { lineHeight: "20px", letterSpacing: "0px", fontWeight: "400" }],
      },

      /* ─── Spacing (4px base) ─── */
      spacing: {
        "4.5": "18px",
        "13": "52px",
        "15": "60px",
        "18": "72px",
        "22": "88px",
        "26": "104px",
        "30": "120px",
        "34": "136px",
        "38": "152px",
        "42": "168px",
        "48": "192px",
      },

      /* ─── Border Radius ─── */
      borderRadius: {
        xs: "4px",
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "pill-sm": "64px",
        pill: "100px",
      },

      /* ─── Box Shadow (stacked elevation) ─── */
      boxShadow: {
        "level-1": "var(--shadow-level-1)",
        "level-2": "var(--shadow-level-2)",
        "level-3": "var(--shadow-level-3)",
        "level-4": "var(--shadow-level-4)",
        "level-5": "var(--shadow-level-5)",
      },

      /* ─── Max Width ─── */
      maxWidth: {
        page: "1400px",
        "page-narrow": "1200px",
      },

      /* ─── Keyframes & Animations ─── */
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(16px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        spin: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out",
        "fade-up": "fade-up 0.5s ease-out",
        "slide-in-right": "slide-in-right 0.4s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        shimmer: "shimmer 2s linear infinite",
        spin: "spin 1s linear infinite",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
