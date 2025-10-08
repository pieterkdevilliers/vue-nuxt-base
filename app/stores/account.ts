// stores/account.ts
import { defineStore } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import { ref } from 'vue'

interface Account {
    // These fields should match what FastAPI returns after creation,
    // which might include more than just account_organisation.
    // Example: ID, unique ID, etc.
    id: string // Assuming FastAPI returns an ID for the account
    account_organisation: string
    account_unique_id?: string // If FastAPI generates this
    // Add other fields from your actual AccountInDB model if any
}

// Interface for the 'account' part of the payload
interface AccountCreatePayload {
    account_organisation: string
}

// Interface for the 'user' part of the payload
interface UserCreatePayload {
    email: string
    password: string
    full_name: string
    account_ids: string[] // FastApi expects a list of strings (UUIDs)
}

// The combined interface that matches FastAPI's expected request body
interface CombinedAccountUserCreatePayload {
    account: AccountCreatePayload
    user: UserCreatePayload
}

export const useAccountStore = defineStore('account', () => {
    const accounts = ref<Account[]>([])
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    const getAuthorizationToken = () => {
        const authStore = useAuthStore()
        return authStore.access_token
    }

    async function fetchAccounts() {
        isLoading.value = true
        error.value = null
        try {
            const apiAuthorizationToken = getAuthorizationToken()
            if (!apiAuthorizationToken) {
                throw new Error(
                    'Authorization token is missing. Please log in.'
                )
            }

            const data = await $fetch<Account[]>(`/api/v1/accounts/`, {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${apiAuthorizationToken}`,
                },
                baseURL: useRuntimeConfig().public.apiBase,
            })
            accounts.value = data
        } catch (err: any) {
            console.error('Failed to fetch accounts:', err)
            error.value = err.message || 'Failed to fetch accounts.'
            throw err
        } finally {
            isLoading.value = false
        }
    }

    // This function now accepts the combined payload
    async function createAccount(
        combinedPayload: CombinedAccountUserCreatePayload
    ) {
        isLoading.value = true
        error.value = null
        try {
            // Basic client-side validation
            if (
                !combinedPayload.account.account_organisation ||
                !combinedPayload.user.email ||
                !combinedPayload.user.password ||
                !combinedPayload.user.full_name
            ) {
                throw new Error('All account and user fields are required.')
            }

            const apiAuthorizationToken = getAuthorizationToken()
            if (!apiAuthorizationToken) {
                throw new Error(
                    'Authorization token is missing. Please log in.'
                )
            }

            const newAccountResponse = await $fetch<Account>( // Expecting an Account back
                `/api/v1/accounts/`,
                {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${apiAuthorizationToken}`,
                    },
                    baseURL: useRuntimeConfig().public.apiBase,
                    body: JSON.stringify(combinedPayload), // Send the combined payload
                }
            )

            accounts.value.push(newAccountResponse)
            console.log(
                'Account created on backend and added to store:',
                newAccountResponse
            )
            return newAccountResponse
        } catch (err: any) {
            console.error('Error creating account:', err)
            error.value = err.message || 'Failed to create account.'
            throw err
        } finally {
            isLoading.value = false
        }
    }

    async function updateAccount(
        id: string,
        payload: Partial<CombinedAccountUserCreatePayload>
    ) {
        // Updated payload type
        isLoading.value = true
        error.value = null
        try {
            const apiAuthorizationToken = getAuthorizationToken()
            if (!apiAuthorizationToken) {
                throw new Error(
                    'Authorization token is missing. Please log in.'
                )
            }

            const updatedAccountResponse = await $fetch<Account>(
                `${useRuntimeConfig().public.apiBase}/api/v1/accounts/${id}`,
                {
                    method: 'PUT',
                    body: JSON.stringify(payload), // Make sure payload matches partial structure
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${apiAuthorizationToken}`,
                    },
                }
            )

            const index = accounts.value.findIndex((acc) => acc.id === id)
            if (index !== -1 && updatedAccountResponse) {
                accounts.value[index] = updatedAccountResponse
            }
            console.log(
                'Account updated on backend and in store:',
                accounts.value[index]
            )
            return updatedAccountResponse
        } catch (err: any) {
            console.error('Error updating account:', err)
            error.value = err.message || 'Failed to update account.'
            throw err
        } finally {
            isLoading.value = false
        }
    }

    async function deleteAccount(
        id: string,
        payload: { account_unique_id: string }
    ) {
        isLoading.value = true
        error.value = null
        try {
            const apiAuthorizationToken = getAuthorizationToken()
            if (!apiAuthorizationToken) {
                throw new Error(
                    'Authorization token is missing. Please log in.'
                )
            }

            await $fetch<void>(
                `${useRuntimeConfig().public.apiBase}/api/v1/accounts/${id}`,
                {
                    method: 'DELETE',
                    body: JSON.stringify(payload), // Sending the payload if needed
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${apiAuthorizationToken}`,
                    },
                }
            )

            accounts.value = accounts.value.filter((acc) => acc.id !== id)
            console.log(
                'Account deleted on backend and removed from store:',
                id
            )
        } catch (err: any) {
            console.error('Error deleting account:', err)
            error.value = err.message || 'Failed to delete account.'
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
        deleteAccount,
    }
})
