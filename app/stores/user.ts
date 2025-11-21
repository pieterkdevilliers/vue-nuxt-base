// stores/user.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'

interface Account {
    id: number | string
    account_organisation: string
    account_unique_id?: string
}

interface User {
    id: number
    email: string
    full_name?: string
    accounts?: Account[]
}

interface UserBasic {
    id: number
    email: string
    full_name?: string
}

interface UserCreatePayload {
    email: string
    password: string
    full_name: string
    account_ids: number[]
}

interface UserUpdatePayload {
    email?: string
    full_name?: string
}

interface UserToAccountPayload {
    email: string
    password?: string
    full_name?: string
}

interface MessageResponse {
    message: string
}

export const useUserStore = defineStore('user', () => {
    const users = ref<UserBasic[]>([])
    const selectedUser = ref<User | null>(null)
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    const getAuthorizationToken = () => {
        const authStore = useAuthStore()
        return authStore.access_token
    }

    function upsertUserInList(userData: UserBasic | User) {
        const idx = users.value.findIndex((u) => u.id === userData.id)
        const basic: UserBasic = {
            id: userData.id,
            email: userData.email,
            full_name: userData.full_name,
        }
        if (idx !== -1) {
            users.value[idx] = basic
        } else {
            users.value.push(basic)
        }
    }

    async function fetchUsers(account_unique_id: string) {
        isLoading.value = true
        error.value = null
        try {
            const apiAuthorizationToken = getAuthorizationToken()
            if (!apiAuthorizationToken) {
                throw new Error(
                    'Authorization token is missing. Please log in.'
                )
            }

            const data = await $fetch<UserBasic[]>(
                `/api/v1/users/${encodeURIComponent(account_unique_id)}`,
                {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                        Authorization: `Bearer ${apiAuthorizationToken}`,
                    },
                    baseURL: useRuntimeConfig().public.apiBase,
                }
            )
            users.value = data ?? []
            return users.value
        } catch (err: any) {
            console.error('Failed to fetch users:', err)
            error.value =
                err?.data?.detail || err.message || 'Failed to fetch users.'
            throw err
        } finally {
            isLoading.value = false
        }
    }

    async function getUser(user_id: number) {
        isLoading.value = true
        error.value = null
        try {
            const apiAuthorizationToken = getAuthorizationToken()
            if (!apiAuthorizationToken) {
                throw new Error(
                    'Authorization token is missing. Please log in.'
                )
            }

            const data = await $fetch<User>(
                `/api/v1/users/get-user/${encodeURIComponent(String(user_id))}`,
                {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                        Authorization: `Bearer ${apiAuthorizationToken}`,
                    },
                    baseURL: useRuntimeConfig().public.apiBase,
                }
            )
            selectedUser.value = data
            upsertUserInList(data)
            return data
        } catch (err: any) {
            console.error('Failed to get user:', err)
            error.value =
                err?.data?.detail || err.message || 'Failed to get user.'
            throw err
        } finally {
            isLoading.value = false
        }
    }

    async function createUser(payload: UserCreatePayload) {
        isLoading.value = true
        error.value = null
        try {
            if (!payload.email || !payload.password || !payload.full_name) {
                throw new Error('Email, password, and full name are required.')
            }

            const apiAuthorizationToken = getAuthorizationToken()
            if (!apiAuthorizationToken) {
                throw new Error(
                    'Authorization token is missing. Please log in.'
                )
            }
            console.log('active account id:', useAuthStore().activeAccountId)
            console.log('Creating user with payload:', payload)
            const newUser = await $fetch<User>(`/api/v1/users/`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiAuthorizationToken}`,
                },
                baseURL: useRuntimeConfig().public.apiBase,
                body: JSON.stringify(payload),
            })

            upsertUserInList(newUser)
            return newUser
        } catch (err: any) {
            console.error('Error creating user:', err)
            error.value =
                err?.data?.detail || err.message || 'Failed to create user.'
            throw err
        } finally {
            isLoading.value = false
        }
    }

    async function updateUser(user_id: number, payload: UserUpdatePayload) {
        isLoading.value = true
        error.value = null
        try {
            const apiAuthorizationToken = getAuthorizationToken()
            if (!apiAuthorizationToken) {
                throw new Error(
                    'Authorization token is missing. Please log in.'
                )
            }

            const updatedUser = await $fetch<User>(
                `${useRuntimeConfig().public.apiBase}/api/v1/users/${encodeURIComponent(String(user_id))}`,
                {
                    method: 'PUT',
                    body: JSON.stringify(payload),
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${apiAuthorizationToken}`,
                    },
                }
            )

            upsertUserInList(updatedUser)
            if (selectedUser.value?.id === updatedUser.id) {
                selectedUser.value = updatedUser
            }
            return updatedUser
        } catch (err: any) {
            console.error('Error updating user:', err)
            error.value =
                err?.data?.detail || err.message || 'Failed to update user.'
            throw err
        } finally {
            isLoading.value = false
        }
    }

    async function addUserToAccount(
        accountIds: number[],
        userPayload: UserToAccountPayload
    ) {
        isLoading.value = true
        error.value = null
        try {
            if (!Array.isArray(accountIds) || accountIds.length === 0) {
                throw new Error('At least one account ID is required.')
            }
            if (!userPayload?.email) {
                throw new Error('User email is required.')
            }

            const apiAuthorizationToken = getAuthorizationToken()
            if (!apiAuthorizationToken) {
                throw new Error(
                    'Authorization token is missing. Please log in.'
                )
            }

            const updatedUser = await $fetch<User>(
                `/api/v1/users/add-user-to-account/`,
                {
                    method: 'PUT',
                    query: {
                        account_id: accountIds,
                    },
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${apiAuthorizationToken}`,
                    },
                    baseURL: useRuntimeConfig().public.apiBase,
                    body: JSON.stringify(userPayload),
                }
            )

            upsertUserInList(updatedUser)
            if (selectedUser.value?.id === updatedUser.id) {
                selectedUser.value = updatedUser
            }
            return updatedUser
        } catch (err: any) {
            console.error('Error adding user to account:', err)
            error.value =
                err?.data?.detail ||
                err.message ||
                'Failed to add user to account.'
            throw err
        } finally {
            isLoading.value = false
        }
    }

    async function removeUserFromAccount(user_id: number, account_id: number) {
        isLoading.value = true
        error.value = null
        try {
            const apiAuthorizationToken = getAuthorizationToken()
            if (!apiAuthorizationToken) {
                throw new Error(
                    'Authorization token is missing. Please log in.'
                )
            }

            const res = await $fetch<MessageResponse>(
                `/api/v1/users/remove-user-from-account/`,
                {
                    method: 'PUT',
                    query: { user_id, account_id },
                    headers: {
                        Accept: 'application/json',
                        Authorization: `Bearer ${apiAuthorizationToken}`,
                    },
                    baseURL: useRuntimeConfig().public.apiBase,
                }
            )

            // Optionally refresh selected user data if currently selected
            if (selectedUser.value?.id === user_id) {
                await getUser(user_id)
            }
            return res
        } catch (err: any) {
            console.error('Error removing user from account:', err)
            error.value =
                err?.data?.detail ||
                err.message ||
                'Failed to remove user from account.'
            throw err
        } finally {
            isLoading.value = false
        }
    }

    async function deleteUser(user_id: number) {
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
                `${useRuntimeConfig().public.apiBase}/api/v1/users/${encodeURIComponent(String(user_id))}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${apiAuthorizationToken}`,
                    },
                }
            )

            users.value = users.value.filter((u) => u.id !== user_id)
            if (selectedUser.value?.id === user_id) {
                selectedUser.value = null
            }
        } catch (err: any) {
            console.error('Error deleting user:', err)
            error.value =
                err?.data?.detail || err.message || 'Failed to delete user.'
            throw err
        } finally {
            isLoading.value = false
        }
    }

    function reset() {
        users.value = []
        selectedUser.value = null
        isLoading.value = false
        error.value = null
    }

    return {
        users,
        selectedUser,
        isLoading,
        error,
        fetchUsers,
        getUser,
        createUser,
        updateUser,
        addUserToAccount,
        removeUserFromAccount,
        deleteUser,
        reset,
    }
})
