<template>
    <UPageHeader class="mb-6 flex justify-between items-center upage-header">
        <template #title>
            <h1>My Account</h1>
            <ClientOnly>
                <UBreadcrumb
                    separator-icon="i-lucide-arrow-right"
                    :items="items"
                    class="mt-3"
                />
            </ClientOnly>
        </template>
        <template #links>
            <UPageCard
                :title="`Account: ${accountOrganisation}`"
                :description="`Account ID: ${uniqueAccountId}`"
                :loading="loading"
                :error="error"
                class="border-none shadow-none bg-transparent p-0 m-0"
            >
            </UPageCard>
        </template>
    </UPageHeader>
    <UPageGrid>
        <UPageCard
            @click="$router.push('/user-list')"
            class="mt-6 cursor-pointer"
        >
            <template #header>Account Users</template>
            <p>Number of Users: {{ users.length }}</p>
            <p>Account Unique ID: {{ uniqueAccountId }}</p>
        </UPageCard>
    </UPageGrid>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import type { BreadcrumbItem } from '@nuxt/ui'

const authStore = useAuthStore()

// Use storeToRefs to make store values reactive
const {
    access_token: apiAuthorizationToken,
    uniqueAccountId,
    accountOrganisation,
    isLoggedIn,
} = storeToRefs(authStore)

// Define a ref to store the accounts data
const loading = ref(true)
const error = ref<string | null>(null)
const users = ref<any[]>([])

// Make breadcrumb items reactive
const items = computed<BreadcrumbItem[]>(() => [
    {
        label: 'My Accounts',
        icon: 'i-lucide-list',
        to: '/account-list',
    },
    {
        label: accountOrganisation.value || 'Loading...',
        icon: 'i-lucide-link',
    },
])

onMounted(async () => {
    if (!apiAuthorizationToken.value) {
        console.log('API Authorization Token is missing')
        error.value = 'Authorization token not found. Please log in.'
        loading.value = false
        return
    }

    try {
        const data = await $fetch(`/api/v1/users/${uniqueAccountId.value}`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${apiAuthorizationToken.value}`,
            },
            baseURL: useRuntimeConfig().public.apiBase,
        })
        users.value = data
        console.log('Fetched users:', users)
    } catch (e: any) {
        console.error('Error during onMounted:', e)
    }
})
</script>
