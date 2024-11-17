/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
        fontFamily: {
            dune: ["'dune-rise'"],
            sans: ["'Helvetica'", "'Arial'", "'sans-serif'"],
            mono: ["'ui-monospace'", "'SFMono-Regular'", "'Menlo'", "'Monaco'", "'Consolas'", "'Liberation Mono'", "'Courier New'", "'monospace'"],
        },
        extend: {},
    },
}

