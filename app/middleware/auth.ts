// middleware/auth.ts
import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to, from) => {
    // This middleware runs on both server and client.
    // Pinia stores are rehydrated before middleware runs on the client.
    const authStore = useAuthStore()

    if (!authStore.isLoggedIn) {
        console.log(
            `Auth middleware: Not logged in. Redirecting from ${to.fullPath} to /`
        )
        // Abort navigation to the protected route and redirect to the login page
        return navigateTo('/')
    }
    console.log(
        `Auth middleware: User is logged in. Allowing access to ${to.fullPath}`
    )
})
