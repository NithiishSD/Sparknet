/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "tertiary-fixed": "#ffdcc6",
        "outline-variant": "#424754",
        "primary": "#adc6ff",
        "secondary-fixed-dim": "#b1c6f9",
        "on-background": "#dae2fd",
        "on-error": "#690005",
        "inverse-primary": "#005ac2",
        "secondary-fixed": "#d8e2ff",
        "tertiary": "#ffb786",
        "on-primary-fixed-variant": "#004395",
        "inverse-on-surface": "#283044",
        "surface-container-lowest": "#060e20",
        "error": "#ffb4ab",
        "surface-container-low": "#131b2e",
        "on-secondary-fixed-variant": "#304671",
        "background": "#0b1326",
        "secondary": "#b1c6f9",
        "outline": "#8c909f",
        "surface-dim": "#0b1326",
        "surface-container-high": "#222a3d",
        "surface-container": "#171f33",
        "tertiary-container": "#df7412",
        "surface-bright": "#31394d",
        "on-tertiary": "#502400",
        "tertiary-fixed-dim": "#ffb786",
        "surface-tint": "#adc6ff",
        "on-primary-fixed": "#001a42",
        "primary-container": "#4d8eff",
        "surface-container-highest": "#2d3449",
        "on-primary-container": "#00285d",
        "on-tertiary-container": "#461f00",
        "on-tertiary-fixed": "#311400",
        "on-error-container": "#ffdad6",
        "on-secondary-fixed": "#001a42",
        "surface-variant": "#2d3449",
        "primary-fixed-dim": "#adc6ff",
        "on-tertiary-fixed-variant": "#723600",
        "on-primary": "#002e6a",
        "on-surface": "#dae2fd",
        "error-container": "#93000a",
        "on-secondary-container": "#9fb5e7",
        "secondary-container": "#304671",
        "on-secondary": "#182f59",
        "surface": "#0b1326",
        "primary-fixed": "#d8e2ff",
        "on-surface-variant": "#c2c6d6",
        "inverse-surface": "#dae2fd"
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem"
      },
      fontFamily: {
        "headline": ["Space Grotesk", "sans-serif"],
        "body": ["Inter", "sans-serif"],
        "label": ["Inter", "sans-serif"]
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease forwards',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(18px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        pulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        }
      }
    },
  },
  plugins: [],
}