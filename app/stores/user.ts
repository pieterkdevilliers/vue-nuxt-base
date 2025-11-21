// stores/user.ts
import { defineStore } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import { ref } from 'vue'

interface User {
    id: string
    email: string
    full_name: string
}

interface UserCreatePayload {
    email: string
    password: string
    full_name: string
    account_ids: string[]
}

type CreateUserInput = UserCreatePayload | { user: UserCreatePayload }

export const useUserStore = defineStore('user', () => {
    const users = ref<User[]>([])
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    const getAuthorizationToken = () => {
        const authStore = useAuthStore()
        return authStore.access_token
    }

    async function fetchUsers() {
        isLoading.value = true
        error.value = null
        try {
            const apiAuthorizationToken = getAuthorizationToken()
            if (!apiAuthorizationToken) {
                throw new Error(
                    'Authorization token is missing. Please log in.'
                )
            }

            const data = await $fetch<User[]>('/api/v1/users/', {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${apiAuthorizationToken}`,
                },
                baseURL: useRuntimeConfig().public.apiBase,
            })
            users.value = data
        } catch (err: any) {
            console.error('Failed to fetch users:', err)
            error.value = err.message || 'Failed to fetch users.'
            throw err
        } finally {
            isLoading.value = false
        }
    }

    async function createUser(userInput: CreateUserInput) {
        isLoading.value = true
        error.value = null
        try {
            const payload: UserCreatePayload =
                (userInput as any)?.user ?? (userInput as UserCreatePayload)

            if (!payload?.email || !payload?.password || !payload?.full_name) {
                throw new Error(
                    'All user fields are required. User payload: ' +
                        JSON.stringify(userInput)
                )
            }

            const apiAuthorizationToken = getAuthorizationToken()
            if (!apiAuthorizationToken) {
                throw new Error(
                    'Authorization token is missing. Please log in.'
                )
            }

            // const newUserResponse = await $fetch<User>('/api/v1/users/', {
            const newUserResponse = await $fetch<User>(
                'https://webhook.site/dfe82329-6128-4fe3-8fd3-8d3c08673772',
                {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${apiAuthorizationToken}`,
                    },
                    // baseURL: useRuntimeConfig().public.apiBase,
                    baseURL: '',
                    body: payload,
                }
            )

            users.value.push(newUserResponse)
            return newUserResponse
        } catch (err: any) {
            console.error('Error creating user:', err)
            error.value = err.message || 'Failed to create user.'
            throw err
        } finally {
            isLoading.value = false
        }
    }

    async function updateUser(id: string, payload: Partial<UserCreatePayload>) {
        isLoading.value = true
        error.value = null
        try {
            const apiAuthorizationToken = getAuthorizationToken()
            if (!apiAuthorizationToken) {
                throw new Error(
                    'Authorization token is missing. Please log in.'
                )
            }

            const updatedUserResponse = await $fetch<User>(
                `/api/v1/users/${id}`,
                {
                    method: 'PUT',
                    body: payload,
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${apiAuthorizationToken}`,
                    },
                    baseURL: useRuntimeConfig().public.apiBase,
                }
            )

            const index = users.value.findIndex((user) => user.id === id)
            if (index !== -1 && updatedUserResponse) {
                users.value[index] = updatedUserResponse
            }
            return updatedUserResponse
        } catch (err: any) {
            console.error('Error updating user:', err)
            error.value = err.message || 'Failed to update user.'
            throw err
        } finally {
            isLoading.value = false
        }
    }

    async function deleteUser(
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

            await $fetch<void>(`/api/v1/users/${id}`, {
                method: 'DELETE',
                body: payload,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiAuthorizationToken}`,
                },
                baseURL: useRuntimeConfig().public.apiBase,
            })

            users.value = users.value.filter((user) => user.id !== id)
        } catch (err: any) {
            console.error('Error deleting user:', err)
            error.value = err.message || 'Failed to delete user.'
            throw err
        } finally {
            isLoading.value = false
        }
    }

    return {
        users,
        isLoading,
        error,
        fetchUsers,
        createUser,
        updateUser,
        deleteUser,
    }
})
