/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Segoe UI', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['Courier New', 'monospace'],
      },
      colors: {
        fleet: {
          bg: '#050a18',
          card: '#0f172a',
          surface: '#1e293b',
          border: '#334155',
          text: '#e2e8f0',
          muted: '#94a3b8',
          dim: '#64748b',
          accent: '#3b82f6',
          'accent-light': '#60a5fa',
          purple: '#6366f1',
          success: '#22c55e',
          warning: '#f59e0b',
          danger: '#ef4444',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'spin-fast': 'spin 0.6s linear infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        }
      },
    },
  },
  plugins: [],
}
