<template>
    <div class="flex justify-between">
        <div class="flex flex-col gap-4">
            <h1 class="text-green-500 text-2xl">My Account</h1>
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
                <h3>{{ accountOrganisation }}</h3>
                <p>Account ID: {{ uniqueAccountId }}</p>
            </template>
        </UCard>
    </div>
    <UPageGrid>
        <UPageCard
            @click="$router.push('/user_list')"
            class="mt-6 cursor-pointer"
        >
            <template #header>Account Users</template>
            <p>Number of Users: {{ users.length }}</p>
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
