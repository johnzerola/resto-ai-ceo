
import { type Config } from "tailwindcss";

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // 🎨 Lucraí Brand Colors - Tokens Semânticos Completos
        'lucrai': {
          // Cores Base
          'blue': {
            50: 'hsl(var(--lucrai-gray-50))',
            100: 'hsl(var(--lucrai-gray-100))',
            200: 'hsl(var(--lucrai-gray-200))',
            300: 'hsl(var(--lucrai-gray-300))',
            400: 'hsl(var(--lucrai-gray-400))',
            500: 'hsl(var(--lucrai-gray-500))',
            600: 'hsl(var(--lucrai-gray-600))',
            700: 'hsl(var(--lucrai-gray-700))',
            800: 'hsl(var(--lucrai-gray-800))',
            900: 'hsl(var(--lucrai-gray-900))',
            'primary': 'hsl(var(--lucrai-blue-primary))',
            'secondary': 'hsl(var(--lucrai-blue-secondary))',
            'tech': 'hsl(var(--lucrai-blue-primary))', // Alias for brand consistency
          },
          'green': {
            'primary': 'hsl(var(--lucrai-green-primary))',
            'secondary': 'hsl(var(--lucrai-green-secondary))',
            'profit': 'hsl(var(--lucrai-green-primary))', // Alias for brand consistency
            'profit-dark': 'hsl(var(--lucrai-green-secondary))', // Darker variant
          },
          'yellow': {
            'primary': 'hsl(var(--lucrai-yellow-primary))',
            'secondary': 'hsl(var(--lucrai-yellow-secondary))',
          },
          'orange': {
            'alert': 'hsl(var(--lucrai-orange-alert))',
          },
          'gold': {
            'accent': 'hsl(var(--lucrai-yellow-primary))', // Alias for gold accent
          },
          'gray': {
            50: 'hsl(var(--lucrai-gray-50))',
            100: 'hsl(var(--lucrai-gray-100))',
            200: 'hsl(var(--lucrai-gray-200))',
            300: 'hsl(var(--lucrai-gray-300))',
            400: 'hsl(var(--lucrai-gray-400))',
            500: 'hsl(var(--lucrai-gray-500))',
            600: 'hsl(var(--lucrai-gray-600))',
            700: 'hsl(var(--lucrai-gray-700))',
            800: 'hsl(var(--lucrai-gray-800))',
            900: 'hsl(var(--lucrai-gray-900))',
            'neutral': 'hsl(var(--lucrai-gray-100))', // Alias for neutral background
            'text': 'hsl(var(--lucrai-gray-600))', // Alias for text color
          },
        },
        // Estados Semânticos
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        info: "hsl(var(--info))",
        // Compatibilidade com sistema antigo
        resto: {
          blue: {
            100: "hsl(var(--lucrai-gray-100))",
            400: "hsl(var(--lucrai-blue-secondary))",
            500: "hsl(var(--lucrai-blue-primary))",
            600: "hsl(var(--lucrai-blue-primary))",
            700: "hsl(var(--lucrai-blue-primary))",
          },
          green: {
            500: "hsl(var(--lucrai-green-primary))",
            600: "hsl(var(--lucrai-green-secondary))",
          },
          gray: {
            500: "hsl(var(--lucrai-gray-500))",
            neutral: "hsl(var(--lucrai-gray-100))",
          }
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        'lucrai': '0 4px 20px hsl(210 70% 26% / 0.15)',
        'lucrai-lg': '0 10px 40px hsl(210 70% 26% / 0.2)',
        'lucrai-success': '0 4px 20px hsl(174 100% 42% / 0.15)',
        'lucrai-warning': '0 4px 20px hsl(51 100% 50% / 0.15)',
      },
      fontFamily: {
        'dm-sans': ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],
        'inter': ['Inter', 'DM Sans', 'system-ui', 'sans-serif'],
        'satoshi': ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],
        // Alias para compatibilidade
        'sans': ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-slow": {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        "fade-in": {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)"
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)"
          }
        },
        "slide-up": {
          "0%": {
            opacity: "0",
            transform: "translateY(20px)"
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)"
          }
        },
        "scale-in": {
          "0%": {
            opacity: "0",
            transform: "scale(0.95)"
          },
          "100%": {
            opacity: "1",
            transform: "scale(1)"
          }
        },
        "shine": {
          "0%": {
            transform: "translateX(-100%)"
          },
          "100%": {
            transform: "translateX(100%)"
          }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "shine": "shine 3s ease-in-out infinite",
        "pulse-slow": "pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-up": "slide-up 0.4s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
