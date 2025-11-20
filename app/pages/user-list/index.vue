<!-- pages/user-list/index.vue -->
<template>
    <UPageHeader class="mb-6 flex justify-between items-center upage-header">
        <template #title>
            <h1>Users</h1>
            <ClientOnly>
                <UBreadcrumb
                    separator-icon="i-lucide-arrow-right"
                    :items="items"
                />
            </ClientOnly>
        </template>
        <template #links>
            <div v-if="authStore.isLoggedIn">
                <UButton @click="handleLogout">Log Out</UButton>
            </div>
        </template>
    </UPageHeader>

    <div v-if="error" class="mt-6">
        <UAlert
            icon="i-lucide-alert-circle"
            color="red"
            variant="solid"
            :title="error"
        />
    </div>

    <div v-else-if="users.length">
        <UModal
            title="Add New User"
            :close="{
                color: 'neutral',
                variant: 'ghost',
            }"
        >
            <UButton label="Add New User" color="primary" variant="subtle" />

            <template #body>
                <UserCreateForm @submitted="handleAccountSubmitted" />
            </template>
        </UModal>
        <UPageGrid class="mt-6">
            <UPageCard
                v-for="user in users"
                :key="user.id"
                :title="user.full_name"
                @click="handleSelectUser(user)"
            >
                <template #description>
                    <p>ID: {{ user.id }}</p>
                    <p>Email: {{ user.email }}</p>
                </template>
            </UPageCard>
        </UPageGrid>
    </div>
    <div v-else-if="loading">
        <div class="flex justify-center items-center mt-12">
            <UIcon name="i-lucide-loader-2" class="animate-spin w-6 h-6" />
            <span class="ml-2">Loading users...</span>
        </div>
    </div>
    <div v-else>
        <UAlert
            icon="i-lucide-info"
            title="No users found"
            description="There are currently no users available."
        />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import { useRouter } from 'vue-router'
import { userCreateForm } from '~/components/forms/UserCreateForm.vue'

interface User {
    id: string
    email: string
    full_name: string
    user_id: string
}

interface BreadcrumbItem {
    label: string
    icon: string
    to?: string
}

const authStore = useAuthStore()
const router = useRouter()

// Reactive refs from store
const { accountOrganisation, isLoggedIn, access_token, uniqueAccountId } =
    storeToRefs(authStore)

// Component state
const users = ref<User[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

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
    },
])

const fetchUsers = async () => {
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

    if (!uniqueAccountId.value) {
        error.value = 'Account ID not found. Please select an account first.'
        loading.value = false
        return
    }

    try {
        const data = await $fetch(`/api/v1/users/${uniqueAccountId.value}`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${access_token.value}`,
            },
            baseURL: useRuntimeConfig().public.apiBase,
        })

        console.log('Fetched users data:', data)

        // Ensure data is an array
        if (Array.isArray(data)) {
            users.value = data
        } else {
            console.warn('Expected array but got:', typeof data, data)
            users.value = []
            error.value = 'Invalid data format received from server.'
        }
    } catch (e: any) {
        console.error('Failed to fetch users:', e)

        // Handle different types of errors
        if (e.status === 401) {
            error.value = 'Session expired. Please log in again.'
            handleLogout()
        } else if (e.status === 403) {
            error.value =
                'Access denied. You do not have permission to view users.'
        } else if (e.status === 404) {
            error.value = 'Users not found for this account.'
        } else {
            error.value = e.message || 'Failed to load users. Please try again.'
        }
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    console.log('User list component mounted')
    fetchUsers()
})

function handleLogout() {
    authStore.clearAll() // Use the new clearAll method
    router.push('/')
}

function handleSelectUser(user: User) {
    try {
        console.log('Selecting user:', user)

        // Use the new store methods
        authStore.setSelectedUser(user)

        // Navigate to user detail page
        const userIdToUse = user.user_id || user.id
        router.push(`/get-user/${userIdToUse}`)
    } catch (e) {
        console.error('Error selecting user:', e)
        error.value = 'Failed to select user. Please try again.'
    }
}

// Optional: Add a refresh method
const refreshUsers = () => {
    loading.value = true
    error.value = null
    users.value = []
    fetchUsers()
}

// Expose refresh method for potential use in template
defineExpose({
    refreshUsers,
})
</script>
