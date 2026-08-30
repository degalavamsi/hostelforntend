/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
            },
            colors: {
                app: 'rgb(var(--bg-app) / <alpha-value>)',
                surface: 'rgb(var(--bg-surface) / <alpha-value>)',
                border: 'rgb(var(--border-subtle) / <alpha-value>)',
                main: 'rgb(var(--text-main) / <alpha-value>)',
                muted: 'rgb(var(--text-muted) / <alpha-value>)',
                primary: 'rgb(var(--primary) / <alpha-value>)',
                success: 'rgb(var(--success) / <alpha-value>)',
                warning: 'rgb(var(--warning) / <alpha-value>)',
                danger: 'rgb(var(--danger) / <alpha-value>)',
                accent: 'rgb(var(--accent) / <alpha-value>)',
            },
            borderRadius: {
                'base': '0.75rem',
                'xl': '1rem',
                '2xl': '1.25rem',
                '3xl': '1.5rem',
            },
            boxShadow: {
                'card': '0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03), 0 16px 40px -8px rgba(0,0,0,0.04)',
                'floating': '0 8px 30px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.03)',
                'glow-blue': '0 0 20px rgba(59,130,246,0.15)',
                'glow-green': '0 0 20px rgba(16,185,129,0.15)',
                'inner-light': 'inset 0 1px 0 0 rgba(255,255,255,0.05)',
            },
            animation: {
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 8s ease-in-out infinite',
                'fade-in': 'fade-in 0.5s ease-out',
                'slide-up': 'slide-up 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
                'scale-in': 'scale-in 0.2s ease-out',
                'shimmer': 'shimmer 2s infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
                    '33%': { transform: 'translateY(-8px) rotate(1deg)' },
                    '66%': { transform: 'translateY(4px) rotate(-1deg)' },
                },
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                'slide-up': {
                    '0%': { opacity: '0', transform: 'translateY(12px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'scale-in': {
                    '0%': { opacity: '0', transform: 'scale(0.95)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
            },
        },
    },
    plugins: [],
}
