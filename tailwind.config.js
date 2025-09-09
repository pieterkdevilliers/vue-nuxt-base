/** @type {import('tailwindcss').Config} */
export default {
    mode: 'jit',
    content: [
        './components/**/*.{vue,js,ts}',
        './layouts/**/*.vue',
        './pages/**/*.vue',
        './app.vue',
        './nuxt.config.{js,ts}',
    ],
    theme: {
        extend: {
            colors: {
                accent: '#DB2777',
            },
            fontFamily: {
                sans: [
                    'Roboto',
                    ...require('tailwindcss/defaultTheme').fontFamily.sans,
                ],
                'roboto-condensed': [
                    'Roboto Condensed',
                    ...require('tailwindcss/defaultTheme').fontFamily.sans,
                ],
            },
        },
    },
    // plugins: [require('@designbycode/tailwindcss-text-shadow')],
}
