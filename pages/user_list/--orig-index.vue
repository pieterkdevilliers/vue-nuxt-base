<!-- pages/user_list/index.vue -->
<template>
    <div class="flex justify-between">
        <div class="flex flex-col gap-4">
            <h1 class="text-red-500 text-2xl">Users</h1>
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

    <div v-if="users.length">
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
        <p>Loading users...</p>
    </div>
    <div v-else>
        <p>No users found or an error occurred.</p>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import { useRouter } from 'vue-router'
import { card } from '#build/ui'
const authStore = useAuthStore()
const router = useRouter()
const apiAuthorizationToken = authStore.access_token
const uniqueAccountId = authStore.uniqueAccountId

const { accountOrganisation, isLoggedIn } = storeToRefs(authStore)

// Define a ref to store the accounts data
const users = ref<any[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const items = computed<BreadcrumbItem[]>(() => [
    {
        label: 'My Accounts',
        icon: 'i-lucide-list',
        to: '/account_list',
    },
    {
        label: accountOrganisation.value || 'Loading...',
        icon: 'i-lucide-building',
        to: '/my_account',
    },
    {
        label: 'Users',
        icon: 'i-lucide-link',
    },
])

onMounted(async () => {
    console.log('Mounted accounts component')
    console.log('apiAuthorizationToken:', apiAuthorizationToken)
    if (!apiAuthorizationToken) {
        console.log('API Authorization Token is missing')
        error.value = 'Authorization token not found. Please log in.'
        loading.value = false
        return
    }
    if (!authStore.isLoggedIn) {
        console.log('User is not logged in. Skipping account fetch.')
        loading.value = false
        error.value = 'Please log in to view account information.'
        return
    }

    try {
        const data = await $fetch(`/api/v1/users/${uniqueAccountId}`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${apiAuthorizationToken}`,
            },
            baseURL: useRuntimeConfig().public.apiBase,
        })

        console.log('apiAuthorizationToken:', apiAuthorizationToken)
        console.log('Fetched data:', data)
        users.value = data
    } catch (e: any) {
        console.error('Failed to fetch users:', e)
        error.value = e.message || 'An unknown error occurred.'
    } finally {
        loading.value = false
    }
})

function handleLogout() {
    authStore.clearAuthToken()
    authStore.clearUniqueAccountId()
    authStore.clearAccountOrganisation()
    router.push('/')
}
function handleSelectUser(user: any) {
    authStore.setUserId(user.id)
    authStore.setUserEmail(user.email)
    router.push(`/get-user/${user.user_id}`)
}
</script>
