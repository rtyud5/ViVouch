import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        "on-tertiary": "#ffffff",
        "on-secondary-fixed": "#410002",
        "tertiary-container": "#9b6b00",
        surface: "#f9f9fc",
        "on-primary-fixed-variant": "#00513a",
        "on-tertiary-fixed": "#281900",
        "outline-variant": "#bccac1",
        "surface-container-lowest": "#ffffff",
        "on-secondary": "#ffffff",
        "surface-container-highest": "#e2e2e5",
        "primary-container": "#008560",
        "on-background": "#1a1c1e",
        "on-primary": "#ffffff",
        "surface-bright": "#f9f9fc",
        "on-surface-variant": "#3d4943",
        "on-tertiary-fixed-variant": "#604100",
        "on-tertiary-container": "#fffbff",
        "on-primary-fixed": "#002115",
        "surface-container-low": "#f3f3f6",
        "surface-container-high": "#e8e8ea",
        "secondary-fixed-dim": "#ffb4ac",
        outline: "#6d7a73",
        "inverse-on-surface": "#f0f0f3",
        "on-surface": "#1a1c1e",
        "inverse-surface": "#2f3133",
        tertiary: "#7b5500",
        "on-primary-container": "#f5fff7",
        "error-container": "#ffdad6",
        "primary-fixed": "#86f8c9",
        "primary-fixed-dim": "#68dbae",
        "tertiary-fixed": "#ffdeac",
        "secondary-fixed": "#ffdad6",
        "on-secondary-fixed-variant": "#93000d",
        secondary: "#b7131a",
        "secondary-container": "#db322f",
        "on-error": "#ffffff",
        primary: "#00694c",
        "surface-tint": "#006c4e",
        "on-error-container": "#93000a",
        "surface-variant": "#e2e2e5",
        "surface-dim": "#dadadc",
        "tertiary-fixed-dim": "#ffba38",
        "on-secondary-container": "#fffbff",
        error: "#ba1a1a",
        background: "#f9f9fc",
        "surface-container": "#eeeef0",
        "inverse-primary": "#68dbae"
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px"
      },
      spacing: {
        base: "8px",
        "section-gap": "32px",
        gutter: "12px",
        "container-margin": "16px"
      },
      fontFamily: {
        "headline-lg": ["Be Vietnam Pro", "sans-serif"],
        "body-lg": ["Be Vietnam Pro", "sans-serif"],
        "label-md": ["Be Vietnam Pro", "sans-serif"],
        "price-display": ["Be Vietnam Pro", "sans-serif"],
        "headline-lg-mobile": ["Be Vietnam Pro", "sans-serif"],
        "body-md": ["Be Vietnam Pro", "sans-serif"],
        "display-lg": ["Be Vietnam Pro", "sans-serif"],
        "headline-md": ["Be Vietnam Pro", "sans-serif"]
      },
      fontSize: {
        "headline-lg": ["32px", { lineHeight: "40px", letterSpacing: "-0.01em", fontWeight: "700" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "label-md": ["14px", { lineHeight: "20px", fontWeight: "600" }],
        "price-display": ["20px", { lineHeight: "24px", fontWeight: "700" }],
        "headline-lg-mobile": ["24px", { lineHeight: "32px", fontWeight: "700" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "display-lg": ["40px", { lineHeight: "48px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-md": ["24px", { lineHeight: "32px", fontWeight: "600" }]
      }
    }
  },
  plugins: [daisyui],
  daisyui: {
    themes: ["light"]
  }
};
