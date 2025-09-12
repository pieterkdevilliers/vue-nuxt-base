<template>
    <div class="flex justify-between">
        <div class="flex flex-col gap-4">
            <h1 class="text-green-500 text-2xl">My Accounts</h1>
            <!-- <small>{{ isLoggedIn ? 'Logged In' : 'Logged Out' }}</small> -->
            <ClientOnly>
                <UBreadcrumb
                    separator-icon="i-lucide-arrow-right"
                    :items="items"
                />
            </ClientOnly>
        </div>
        <UCard
            :title="`Account: ${accountOrganisation}`"
            :loading="loading"
            :error="error"
        >
            <template #default>
                <p>{{ accountOrganisation }}</p>
                <p>Account ID: {{ uniqueAccountId }}</p>
            </template>
        </UCard>
    </div>
    <UCard>
        <template #header>Account Users</template>
    </UCard>
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

// Make breadcrumb items reactive
const items = computed<BreadcrumbItem[]>(() => [
    {
        label: 'My Accounts',
        icon: 'i-lucide-list',
        to: '/account_list',
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
        const response = await $fetch(
            `/api/v1/accounts/${uniqueAccountId.value}`,
            {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${apiAuthorizationToken.value}`,
                },
                baseURL: useRuntimeConfig().public.apiBase,
            }
        )
        console.log('API Response:', response)
    } catch (e: any) {
        console.error('Failed to fetch accounts:', e)
        error.value = e.message || 'An unknown error occurred.'
    } finally {
        loading.value = false
    }
})
</script>
