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
                "primary": "#4ecdc4",
                "primary-dark": "#2cb3aa",
                "secondary": "#ffbe76",
                "secondary-dark": "#e09345",
                "background-light": "#fcfdfd",
                "background-dark": "#101614",
                "mint-soft": "#e0f7f5",
                "peach-soft": "#fff0e0",
            },
            fontFamily: {
                "display": ["Nunito", "Inter", "sans-serif"]
            },
            borderRadius: { "DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "2xl": "1rem", "3xl": "1.5rem", "full": "9999px" },
        },
    },
    plugins: [],
}
