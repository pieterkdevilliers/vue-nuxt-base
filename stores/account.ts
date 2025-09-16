// stores/account.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

interface Account {
    id: number
    name: string
    email: string
    // ... other account properties
}

interface AccountPayload {
    name: string
    email: string
    password?: string // Password might only be needed for create, not edit
}

export const useAccountStore = defineStore('account', () => {
    const accounts = ref<Account[]>([])
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    async function fetchAccounts() {
        isLoading.value = true
        error.value = null
        try {
            // Simulate API call to fetch accounts
            await new Promise((resolve) => setTimeout(resolve, 500))
            accounts.value = [
                { id: 1, name: 'John Doe', email: 'john@example.com' },
                { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
            ]
        } catch (err: any) {
            error.value = err.message || 'Failed to fetch accounts.'
            throw err // Re-throw to allow component to catch
        } finally {
            isLoading.value = false
        }
    }

    async function createAccount(payload: AccountPayload) {
        isLoading.value = true
        error.value = null
        try {
            // Simulate API call to create an account
            await new Promise((resolve) => setTimeout(resolve, 1000))
            const newAccount: Account = {
                id: Date.now(), // Generate a mock ID
                name: payload.name,
                email: payload.email,
            }
            accounts.value.push(newAccount) // Add to local state
            console.log('Account created in store:', newAccount)
            return newAccount
        } catch (err: any) {
            error.value = err.message || 'Failed to create account.'
            throw err // Re-throw to allow component to catch
        } finally {
            isLoading.value = false
        }
    }

    // Add more actions like updateAccount, deleteAccount, etc. as needed
    async function updateAccount(id: number, payload: Partial<AccountPayload>) {
        isLoading.value = true
        error.value = null
        try {
            // Simulate API call to update an account
            await new Promise((resolve) => setTimeout(resolve, 1000))
            const index = accounts.value.findIndex((acc) => acc.id === id)
            if (index !== -1) {
                accounts.value[index] = { ...accounts.value[index], ...payload }
            }
            console.log('Account updated in store:', accounts.value[index])
        } catch (err: any) {
            error.value = err.message || 'Failed to update account.'
            throw err
        } finally {
            isLoading.value = false
        }
    }

    return {
        accounts,
        isLoading,
        error,
        fetchAccounts,
        createAccount,
        updateAccount,
    }
})
