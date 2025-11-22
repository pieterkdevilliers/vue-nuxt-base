<template>
    <UPageHeader
        class="mb-6 flex justify-between items-center upage-header"
        :ui="{
            links: 'gap-6',
        }"
    >
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
                :loading="isLoading"
                :error="error"
                :ui="{
                    container: 'p-0 lg:p-3',
                    title: 'text-sm font-medium',
                    description: 'text-xs',
                }"
                class="border-none shadow-none bg-transparent p-0 m-0 text-sm"
            />
            <UButton
                v-if="authStore.isLoggedIn"
                @click="handleLogout"
                color="primary"
                variant="outline"
                size="sm"
                icon="i-lucide-log-out"
                >Log Out</UButton
            >
        </template>
    </UPageHeader>

    <UPageGrid>
        <UPageCard
            @click="$router.push('/user-list')"
            class="mt-6 cursor-pointer group"
            :ui="{
                header: 'flex flex-row justify-between items-center w-full group-hover:text-blue-500',
            }"
        >
            <template #header>
                <h2 class="text-lg font-semibold">Account Users</h2>
                <UIcon name="i-lucide-info" class="w-6 h-6" />
            </template>

            <p>Number of Users: {{ users.length }}</p>
            <p>Account Unique ID: {{ uniqueAccountId }}</p>
        </UPageCard>
    </UPageGrid>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import { useUserStore } from '~/stores/user'
import { useRouter } from 'vue-router'
import type { BreadcrumbItem } from '@nuxt/ui'

const authStore = useAuthStore()
const userStore = useUserStore()

const {
    access_token: apiAuthorizationToken,
    uniqueAccountId,
    accountOrganisation,
    isLoggedIn,
} = storeToRefs(authStore)

const { users, isLoading, error } = storeToRefs(userStore)
const router = useRouter()

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
        isLoading.value = false
        return
    }

    if (!uniqueAccountId.value) {
        error.value = 'No account selected'
        isLoading.value = false
        return
    }

    try {
        await userStore.fetchUsers(uniqueAccountId.value!)
        console.log('Fetched users via store:', userStore.users)
    } catch (e: any) {
        console.error('Error fetching users via store:', e)
        error.value = 'Failed to load users'
    } finally {
        isLoading.value = false
    }
})

function handleLogout() {
    authStore.clearAll()
    router.push('/')
}
</script>
