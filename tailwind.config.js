/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        }
      },
      // 🆕 ANIMATIONS RESPONSIVE
      animation: {
        'ping': 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce': 'bounce 1s infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      // 🆕 FONTS Inter (déjà dans globals.css)
      fontFamily: {
        'sans': ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      // 🆕 SPACING pour glassmorphism
      backdropBlur: {
        xs: '2px',
      },
      // 🆕 SHADOWS glassmorphism
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-lg': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'glow': '0 0 20px rgba(6, 182, 212, 0.5)',
        'glow-emerald': '0 0 20px rgba(6, 182, 212, 0.3)',
      },
      // 🆕 GRADIENTS
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass-bg': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      },
      // 🆕 BORDER RADIUS
      borderRadius: {
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [
    // 🆕 Plugin pour glassmorphism utilities
    function({ addUtilities }) {
      addUtilities({
        '.glass-card': {
          'backdrop-filter': 'blur(20px)',
          'background': 'rgba(255, 255, 255, 0.1)',
          'border': '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.glass-card-hover': {
          '&:hover': {
            'backdrop-filter': 'blur(25px)',
            'background': 'rgba(255, 255, 255, 0.15)',
            'border': '1px solid rgba(255, 255, 255, 0.3)',
            'transform': 'translateY(-2px)',
          }
        }
      })
    }
  ],
}