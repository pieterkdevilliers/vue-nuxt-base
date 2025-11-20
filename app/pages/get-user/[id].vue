<!-- pages/get-user/[id].vue -->
<template>
    <div class="flex justify-between">
        <div class="flex flex-col gap-4">
            <h1 class="text-green-500 text-2xl">User Details</h1>
            <ClientOnly>
                <UBreadcrumb
                    separator-icon="i-lucide-arrow-right"
                    :items="items"
                />
            </ClientOnly>
        </div>
        <div v-if="authStore.isLoggedIn">
            <UButton @click="handleLogout">Log Out</UButton>
        </div>
    </div>

    <div v-if="error" class="mt-6">
        <UAlert
            icon="i-lucide-alert-circle"
            color="red"
            variant="solid"
            :title="error"
        />
    </div>

    <div v-else-if="loading" class="mt-6">
        <div class="flex justify-center items-center mt-12">
            <UIcon name="i-lucide-loader-2" class="animate-spin w-6 h-6" />
            <span class="ml-2">Loading user details...</span>
        </div>
    </div>

    <div v-else-if="user" class="mt-6">
        <UPageGrid>
            <UPageCard :title="`User ID: ${route.params.id}`">
                <template #header>
                    <h2 class="text-lg font-semibold">User Information</h2>
                    <UModal
                        title="Edit User: {{ user.full_name }}"
                        :close="{
                            color: 'neutral',
                            variant: 'ghost',
                        }"
                    >
                        <UButton
                            label="Edit User"
                            color="primary"
                            variant="subtle"
                        />

                        <template #body>
                            <AccountCreateForm
                                @submitted="handleAccountSubmitted"
                            />
                        </template>
                    </UModal>
                </template>
                <template #default>
                    <div class="space-y-4">
                        <div>
                            <h3 class="text-xl font-semibold">
                                {{ user.full_name }}
                            </h3>
                            <p class="text-gray-600">{{ user.email }}</p>
                        </div>

                        <div class="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span class="font-medium">User ID:</span>
                                <span class="ml-2">{{ user.id }}</span>
                            </div>
                            <div v-if="user.user_id">
                                <span class="font-medium">Internal ID:</span>
                                <span class="ml-2">{{ user.user_id }}</span>
                            </div>
                        </div>
                    </div>
                </template>
            </UPageCard>
        </UPageGrid>
    </div>

    <div v-else class="mt-6">
        <UAlert
            icon="i-lucide-info"
            title="User not found"
            description="The requested user could not be found."
        />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import { useRoute, useRouter } from 'vue-router'

interface User {
    id: string
    email: string
    full_name: string
    user_id?: string
}

interface BreadcrumbItem {
    label: string
    icon: string
    to?: string
}

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

// Reactive refs from store
const { access_token, uniqueAccountId, accountOrganisation, isLoggedIn } =
    storeToRefs(authStore)

// Component state
const user = ref<User | null>(null)
const allUsers = ref<User[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

// Get user ID from route params
const userId = computed(() => route.params.id as string)

const items = computed<BreadcrumbItem[]>(() => [
    {
        label: 'My Accounts',
        icon: 'i-lucide-list',
        to: '/account-list',
    },
    {
        label: accountOrganisation.value || 'Loading...',
        icon: 'i-lucide-building',
        to: '/my-account',
    },
    {
        label: 'Users',
        icon: 'i-lucide-users',
        to: '/user-list',
    },
    {
        label: user.value?.full_name || `User ${userId.value}`,
        icon: 'i-lucide-user',
    },
])

const fetchUser = async () => {
    if (!access_token.value) {
        error.value = 'Authorization token not found. Please log in.'
        loading.value = false
        return
    }

    if (!isLoggedIn.value) {
        error.value = 'Please log in to view user information.'
        loading.value = false
        return
    }

    if (!userId.value) {
        error.value = 'User ID is required.'
        loading.value = false
        return
    }

    try {
        const data = await $fetch(`/api/v1/users/get-user/${userId.value}`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${access_token.value}`,
            },
            baseURL: useRuntimeConfig().public.apiBase,
        })

        console.log('Fetched user data:', data)

        // Handle different possible response formats
        if (data && typeof data === 'object') {
            if (Array.isArray(data) && data.length > 0) {
                user.value = data[0]
            } else if (!Array.isArray(data)) {
                user.value = data as User
            } else {
                error.value = 'User not found.'
            }
        } else {
            error.value = 'Invalid response format.'
        }
    } catch (e: any) {
        console.error('Failed to fetch user:', e)

        if (e.status === 401) {
            error.value = 'Session expired. Please log in again.'
            handleLogout()
        } else if (e.status === 403) {
            error.value =
                'Access denied. You do not have permission to view this user.'
        } else if (e.status === 404) {
            error.value = 'User not found.'
        } else {
            error.value = e.message || 'Failed to load user. Please try again.'
        }
    } finally {
        loading.value = false
    }
}

// Optional: Fetch all users for context (if needed)
const fetchAllUsers = async () => {
    if (!uniqueAccountId.value) return

    try {
        const data = await $fetch(`/api/v1/users/${uniqueAccountId.value}`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${access_token.value}`,
            },
            baseURL: useRuntimeConfig().public.apiBase,
        })

        if (Array.isArray(data)) {
            allUsers.value = data
        }
    } catch (e) {
        console.warn('Could not fetch all users:', e)
    }
}

onMounted(() => {
    console.log('User detail page mounted for user:', userId.value)
    fetchUser()
    fetchAllUsers()
})

function handleLogout() {
    authStore.clearAll()
    router.push('/')
}

// Set page meta
definePageMeta({
    name: 'get-user-id',
})
</script>
