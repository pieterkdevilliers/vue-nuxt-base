// nuxt.config.ts
export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: { enabled: true },
    modules: ['@nuxtjs/tailwindcss', '@nuxt/ui', '@pinia/nuxt'],
    css: ['~/assets/css/tailwind.css'],
})
