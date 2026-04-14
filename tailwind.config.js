/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "atrium-primary": "#006a65",
                "atrium-primary-container": "#4ecdc4",
                "atrium-surface": "#f2fcf8",
                "atrium-surface-low": "#ecf6f2",
                "atrium-surface-lowest": "#ffffff",
                "atrium-on-surface": "#141d1b",
                "atrium-on-variant": "#3d4948",
                "primary": "#4ecdc4",
                "primary-dark": "#2cb3aa",
                "secondary": "#ffbe76",
                "secondary-dark": "#e09345",
                "background-light": "#fcfdfd",
                "background-dark": "#101614",
                "mint-soft": "#e0f7f5",
                "peach-soft": "#fff0e0",
                cyan: {
                    50: '#f0fdfc', 100: '#ccfbf8', 200: '#99f6f0', 300: '#5eead6', 400: '#2dd4c2', 500: '#14b8a6', 600: '#0d9488', 700: '#0f766e', 800: '#115e59', 900: '#134e4a',
                },
                surface: '#f3f7f7',
            },
            fontFamily: {
                "display": ['"Plus Jakarta Sans"', 'sans-serif'],
                "sans": ['"Inter"', 'sans-serif'],
                "old-display": ["Nunito", "Inter", "sans-serif"]
            },
            boxShadow: {
                'ambient': '0 12px 60px rgba(20, 29, 27, 0.06)',
                'glass': '0 8px 32px 0 rgba(13, 148, 136, 0.08)',
                'float': '0 20px 40px -10px rgba(0, 0, 0, 0.08)',
                'heavy-float': '0 30px 60px -15px rgba(13, 148, 136, 0.15)',
            },
            borderRadius: { "DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "2xl": "1rem", "3xl": "1.5rem", "full": "9999px" },
        },
    },
    plugins: [],
}
