import { defineStore } from 'pinia'
import type { DefineStoreOptions } from 'pinia' // Important for defineStore generics
import type { PersistedStateOptions } from 'pinia-plugin-persistedstate' // Important for the 'persist' property

// Define a type for your state
interface AuthState {
    uniqueAccountId: string | null
    access_token: string | null
    account_organisation: string | null
}

// Define a type for your getters
interface AuthGetters {
    isLoggedIn(state: AuthState): boolean
    [key: string]: any // Index signature for Pinia's internal getter type compatibility
}

// Define a type for your actions
interface AuthActions {
    setUniqueAccountId(id: string): void
    clearUniqueAccountId(): void
    setAuthToken(access_token: string): void
    clearAuthToken(): void
    setAccountOrganisation(account_organisation: string): void
    clearAccountOrganisation(): void
}

// Define a type for the *options object* that you pass to defineStore
// This combines Pinia's default options with the `persist` option from the plugin.
type AuthStoreDefinitionOptions = DefineStoreOptions<
    'auth',
    AuthState,
    AuthGetters,
    AuthActions
> & {
    persist?: boolean | PersistedStateOptions // Make 'persist' an optional property
}

// Now use this combined type for the options object directly
export const useAuthStore = defineStore('auth', {
    state: (): AuthState => ({
        uniqueAccountId: null,
        access_token: null,
        account_organisation: null,
    }),
    getters: {
        isLoggedIn(state) {
            return !!state.access_token
        },
    },
    actions: {
        setUniqueAccountId(id) {
            this.uniqueAccountId = id
        },
        clearUniqueAccountId() {
            this.uniqueAccountId = null
        },
        setAuthToken(access_token) {
            this.access_token = access_token
        },
        clearAuthToken() {
            console.log('Clearing auth token')
            this.access_token = null
        },
        setAccountOrganisation(account_organisation) {
            this.account_organisation = account_organisation
        },
        clearAccountOrganisation() {
            this.account_organisation = null
        },
    },
    persist: true, // This property is now correctly typed thanks to AuthStoreDefinitionOptions
} as AuthStoreDefinitionOptions) // Cast the literal object to our defined options type
