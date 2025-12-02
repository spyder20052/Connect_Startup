/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                theme: {
                    DEFAULT: '#1E40AF', // Bleu profond principal
                    hover: '#1E3A8A',
                    light: '#DBEAFE',
                    dark: '#1E3A8A'
                },
                brand: {
                    pink: '#EC4899', // Rose vibrant
                    purple: '#8B5CF6', // Violet
                    blue: '#0EA5E9', // Bleu ciel
                    deepBlue: '#1E40AF', // Bleu profond
                    red: '#DC2626' // Rouge accent
                }
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-in-out',
                'slide-in': 'slideIn 0.3s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideIn: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(0)' },
                }
            }
        },
    },
    plugins: [],
}
