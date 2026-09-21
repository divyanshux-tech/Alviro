/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class', // Enable class-based dark mode
    theme: {
        extend: {
            colors: {
                primary: "#D4AF37", // Rich Gold
                secondary: "#111111", // Dark Charcoal / Black
                accent: "#FFFFFF", // White
                muted: "#888888", // Gray text
                cream: "#F4F1DE", // Keeping cream as a utility just in case
            },
            fontFamily: {
                serif: ["'Italiana'", "serif"],
                sans: ["'Montserrat'", "sans-serif"],
                display: ["'Cormorant Garamond'", "serif"],
            },
        },
    },
    plugins: [],
}
