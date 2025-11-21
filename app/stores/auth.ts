// stores/auth.ts
import { defineStore } from 'pinia'
// The useCookie composable is globally available in Nuxt 3.
// You don't need to import `createNuxtPersistedState` here directly for this approach.

interface User {
    id: string
    email: string
    full_name?: string
    user_id?: string
}

interface AuthState {
    access_token: string | null
    uniqueAccountId: string | ''
    accountOrganisation: string | null
    userId: string | null
    userEmail: string | null
    selectedUser: User | null
    activeAccountId?: number | null
}

export const useAuthStore = defineStore('auth', {
    state: (): AuthState => ({
        access_token: null,
        uniqueAccountId: '',
        accountOrganisation: null,
        userId: null,
        userEmail: null,
        selectedUser: null,
        activeAccountId: null,
    }),

    getters: {
        isLoggedIn(): boolean {
            // Ensure this getter is always safe, it simply checks the token existence.
            return !!this.access_token
        },
    },

    actions: {
        setAuthToken(token: string) {
            this.access_token = token
        },

        clearAuthToken() {
            this.access_token = null
        },

        setUniqueAccountId(id: string) {
            this.uniqueAccountId = id
        },

        clearUniqueAccountId() {
            this.uniqueAccountId = ''
        },

        setAccountOrganisation(org: string) {
            this.accountOrganisation = org
        },

        clearAccountOrganisation() {
            this.accountOrganisation = null
        },

        setUserId(id: string) {
            this.userId = id
        },

        clearUserId() {
            this.userId = null
        },

        setUserEmail(email: string) {
            this.userEmail = email
        },

        clearUserEmail() {
            this.userEmail = null
        },

        setSelectedUser(user: User) {
            this.selectedUser = user
            this.userId = user.id
            this.userEmail = user.email
        },

        clearSelectedUser() {
            this.selectedUser = null
            this.userId = null
            this.userEmail = null
        },

        setActiveAccountId(accountId: number) {
            this.activeAccountId = accountId
        },

        clearActiveAccountId() {
            this.activeAccountId = null
        },

        // New action to clear ALL auth-related state and persisted items
        clearAll() {
            this.access_token = null
            this.uniqueAccountId = ''
            this.accountOrganisation = null
            this.userId = null
            this.userEmail = null
            this.selectedUser = null
            this.activeAccountId = null
            // IMPORTANT: If you want to explicitly clear cookies/localStorage for persisted state
            // during logout, you might need to use the `paths` option or a specific action
            // provided by the persisted state plugin. For now, setting to null
            // will trigger the persistence to save null, effectively clearing it.
        },
    },

    // This is the most robust way to configure persistence for Nuxt 3 with SSR.
    // It explicitly uses Nuxt's `useCookie` composable, which is SSR-safe.
    persist: {
        key: 'auth-store', // The name of the cookie/local storage item
        storage: {
            getItem: (key) => {
                // Ensure useCookie is called where it's safe (during execution)
                // Default maxAge of 0 means session cookie, you might want to set a longer one.
                const cookie = useCookie(key, { maxAge: 60 * 60 * 24 * 30 }) // Example: 30 days
                return cookie.value || null
            },
            setItem: (key, value) => {
                const cookie = useCookie(key, { maxAge: 60 * 60 * 24 * 30 }) // Example: 30 days
                cookie.value = value
            },
            removeItem: (key) => {
                const cookie = useCookie(key)
                cookie.value = null // Setting to null removes the cookie
            },
        },
        // Specify exactly which state properties to persist
        paths: ['access_token', 'uniqueAccountId', 'accountOrganisation'],
    },
})
