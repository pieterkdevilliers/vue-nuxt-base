// stores/auth.ts
import { defineStore } from 'pinia'

interface User {
    id: string
    email: string
    full_name?: string
    user_id?: string
}

interface AuthState {
    access_token: string | null
    uniqueAccountId: string | null
    accountOrganisation: string | null
    userId: string | null
    userEmail: string | null
    selectedUser: User | null
}

export const useAuthStore = defineStore('auth', {
    state: (): AuthState => ({
        access_token: null,
        uniqueAccountId: null,
        accountOrganisation: null,
        userId: null,
        userEmail: null,
        selectedUser: null,
    }),

    getters: {
        isLoggedIn(): boolean {
            return !!this.access_token
        },
    },

    actions: {
        // Existing methods (keep your current implementations)
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
            this.uniqueAccountId = null
        },

        setAccountOrganisation(org: string) {
            this.accountOrganisation = org
        },

        clearAccountOrganisation() {
            this.accountOrganisation = null
        },

        // Missing methods that need to be added
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

        // Optional: method to set complete user data
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

        // Clear all auth data
        clearAll() {
            this.access_token = null
            this.uniqueAccountId = null
            this.accountOrganisation = null
            this.userId = null
            this.userEmail = null
            this.selectedUser = null
        },
    },

    // Optional: Add persistence
    persist: {
        key: 'auth-store',
        storage: persistedState.localStorage,
        // Only persist essential auth data, not temporary user selections
        pick: ['access_token', 'uniqueAccountId', 'accountOrganisation'],
    },
})
