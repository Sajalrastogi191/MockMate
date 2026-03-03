/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                violet: {
                    400: '#a78bfa',
                    500: '#8b5cf6',
                    600: '#7c3aed',
                    700: '#6d28d9',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
            },
            animation: {
                'fade-in': 'fadeIn 0.4s ease-out',
                'slide-up': 'slideUp 0.4s ease-out',
                'glow': 'glow 3s ease-in-out infinite',
                'spin-slow': 'spin 3s linear infinite',
            },
            keyframes: {
                fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
                slideUp: {
                    from: { opacity: 0, transform: 'translateY(20px)' },
                    to: { opacity: 1, transform: 'translateY(0)' },
                },
                glow: {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(139,92,246,0.3)' },
                    '50%': { boxShadow: '0 0 40px rgba(139,92,246,0.6)' },
                },
            },
        },
    },
    plugins: [],
};
