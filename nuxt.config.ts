// nuxt.config.ts
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: { enabled: true },
    modules: ['@pinia/nuxt', '@nuxt/ui', '@nuxtjs/color-mode'],
    css: ['~/assets/css/main.css'],
    build: {},
    runtimeConfig: {
        public: {
            apiBase: 'http://localhost:8000',
        },
    },
    vite: {
        build: {
            sourcemap: true,
        },
    },
})
