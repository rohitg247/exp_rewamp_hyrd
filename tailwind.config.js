/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    extend: {
      // Custom breakpoint for dedicated 1920x1200 control touch panel hardware
      // Composite media query ensures activation ONLY when BOTH conditions are met:
      // - Minimum width: 1920px
      // - Minimum height: 1200px
      // This prevents activation on standard 1920x1080 desktop displays
      // Usage: touchPanel:p-6, touchPanel:text-lg, touchPanel:gap-4
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        'touchPanel': {
          'raw': '(min-width: 1910px) and (ipadmin-height: 1190px)'
        },
      },
      colors: {
        // Primary color scale
        primary: {
          DEFAULT: "var(--color-primary)",
          50: "var(--color-primary-50)",
          100: "var(--color-primary-100)",
          200: "var(--color-primary-200)",
          300: "var(--color-primary-300)",
          400: "var(--color-primary-400)",
          500: "var(--color-primary-500)",
          600: "var(--color-primary-600)",
          700: "var(--color-primary-700)",
          800: "var(--color-primary-800)",
          900: "var(--color-primary-900)",
          light: "var(--color-primary-light)", // 🔥 ADDED
          foreground: "var(--color-primary-foreground)",
        },
        // Danger color scale
        danger: {
          DEFAULT: "var(--color-accent)",
          50: "var(--color-danger-50)",
          100: "var(--color-danger-100)",
          200: "var(--color-danger-200)",
          300: "var(--color-danger-300)",
          400: "var(--color-danger-400)",
          500: "var(--color-danger-500)",
          600: "var(--color-danger-600)",
          700: "var(--color-danger-700)",
          800: "var(--color-danger-800)",
          900: "var(--color-danger-900)",
          foreground: "var(--color-danger-foreground)",
        },
        // Success color scale
        success: {
          DEFAULT: "var(--color-success)",
          50: "var(--color-success-50)",
          100: "var(--color-success-100)",
          200: "var(--color-success-200)",
          300: "var(--color-success-300)",
          400: "var(--color-success-400)",
          500: "var(--color-success-500)",
          600: "var(--color-success-600)",
          700: "var(--color-success-700)",
          800: "var(--color-success-800)",
          900: "var(--color-success-900)",
          foreground: "var(--color-success-foreground)",
        },
        // Warning color scale
        warning: {
          DEFAULT: "var(--color-warning)",
          50: "var(--color-warning-50)",
          100: "var(--color-warning-100)",
          200: "var(--color-warning-200)",
          300: "var(--color-warning-300)",
          400: "var(--color-warning-400)",
          500: "var(--color-warning-500)",
          600: "var(--color-warning-600)",
          700: "var(--color-warning-700)",
          800: "var(--color-warning-800)",
          900: "var(--color-warning-900)",
          foreground: "var(--color-warning-foreground)",
        },
        // Gray scale
        gray: {
          50: "var(--color-gray-50)",
          100: "var(--color-gray-100)",
          200: "var(--color-gray-200)",
          300: "var(--color-gray-300)",
          400: "var(--color-gray-400)",
          500: "var(--color-gray-500)",
          600: "var(--color-gray-600)",
          700: "var(--color-gray-700)",
          800: "var(--color-gray-800)",
          900: "var(--color-gray-900)",
        },
        // 🔥 NEW: Accent color
        accent: "var(--color-accent)",
        
        // Theme-aware semantic colors
        border: "var(--color-border)",
        background: "var(--color-bg)",
        foreground: "var(--color-text)",
        muted: {
          DEFAULT: "var(--color-bg-secondary)",
          foreground: "var(--color-text-light)",
        },
        secondary: {
          DEFAULT: "var(--color-bg-secondary)",
          foreground: "var(--color-text)",
        },
        // Semantic text colors for headings and buttons
        heading: {
          DEFAULT: "var(--color-heading)",
          foreground: "var(--color-heading-foreground)",
        },
        buttonText: {
          primary: "var(--color-button-primary-text)",
          secondary: "var(--color-button-secondary-text)",
        },
      },
      backgroundColor: {
        'theme-bg': 'var(--color-bg)',
        'theme-secondary': 'var(--color-bg-secondary)',
      },
      textColor: {
        'theme-text': 'var(--color-text)', // 🔥 ADDED
        'theme-text-light': 'var(--color-text-light)', // 🔥 ADDED
      },
      borderColor: {
        'theme-border': 'var(--color-border)', // 🔥 ADDED
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        'fluid-sm': 'clamp(0.875rem, 1.5vw, 1rem)',
        'fluid-base': 'clamp(1rem, 2vw, 1.125rem)',
        'fluid-lg': 'clamp(1.125rem, 2.5vw, 1.5rem)',
        'fluid-xl': 'clamp(1.25rem, 3vw, 1.875rem)',
      },
      spacing: {
        18: "4.5rem",
        72: "18rem",
        84: "21rem",
        96: "24rem",
        'card-padding': '1.75rem',      // 28px - New baseline for card vertical padding
        'card-padding-lg': '2.25rem',   // 36px - New baseline for touchPanel card vertical padding
      },
      boxShadow: {
        'navbar': '0 2px 8px 0 rgba(0, 0, 0, 0.12), 0 1px 3px 0 rgba(0, 0, 0, 0.08)',
        'navbar-elegant': '0 6px 16px -2px rgba(0, 0, 0, 0.18), 0 3px 8px -2px rgba(0, 0, 0, 0.12), 0 1px 0 0 rgba(255, 255, 255, 0.04) inset',
        'nav-button': '0 1px 2px rgba(0, 0, 0, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
        'theme': '0 4px 6px var(--color-shadow)', // 🔥 ADDED - Theme-aware shadow
        // 2026-08-03 revamp: elevation ramp. One depth story instead of each
        // card picking its own shadow-lg/xl/2xl. Values live in global.css.
        'rest': 'var(--elev-rest)',
        'raised': 'var(--elev-raised)',
        'pressed': 'var(--elev-pressed)',
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        progress: "progress 3s ease-in-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        progress: {
          "0%": { strokeDasharray: "0 251.2" },
          "100%": { strokeDasharray: "251.2 251.2" },
        },
      },
    },
  },
  plugins: [],
};
