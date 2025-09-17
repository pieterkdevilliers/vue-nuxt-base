<!-- pages/account/index.vue -->
<template>
    <h1 class="font-semibold text-2xl">Account Page</h1>
    <div v-if="authStore.isLoggedIn">
        <UButton @click="handleLogout">Log Out</UButton>
    </div>

    <h2 class="text-xl font-semibold">Account List</h2>
    <UModal
        title="Create New Account"
        :close="{
            color: 'neutral',
            variant: 'ghost',
        }"
    >
        <UButton label="Add New Account" color="primary" variant="subtle" />

        <template #body>
            <AccountCreateForm @submitted="handleAccountSubmitted" />
        </template>
    </UModal>
    <div v-if="accounts.length">
        <UPageGrid>
            <UPageCard
                v-for="account in accounts"
                :key="account.id"
                :title="account.account_organisation"
                @click="handleSelectAccount(account)"
            >
                <template #description>
                    <p>ID: {{ account.id }}</p>
                    <p>Account Unique ID: {{ account.account_unique_id }}</p>
                </template>
            </UPageCard>
        </UPageGrid>
    </div>
    <div v-else-if="loading">
        <p>Loading accounts...</p>
    </div>
    <div v-else>
        <p>No accounts found or an error occurred.</p>
    </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import { card } from '#build/ui'
import { useAccountStore } from '~/stores/account'
import AccountCreateForm from '~/components/forms/AccountCreateForm.vue'
// import AccountEditForm from '~/components/forms/AccountUpdateForm.vue'
const authStore = useAuthStore()
const router = useRouter()
const apiAuthorizationToken = authStore.access_token
const uniqueAccountId = authStore.uniqueAccountId
const accountOrganisation = ref('')

const isLoggedIn = authStore.isLoggedIn

// Define a ref to store the accounts data
const accounts = ref<any[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const modalStore = useModalStore()
const accountStore = useAccountStore()

function handleAccountSubmitted(account: any) {
    console.log('Account submitted successfully:', account)
    // Re-fetch data, show a toast notification, etc.
}

definePageMeta({
    layout: 'logged-in',
})

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
        const data = await $fetch('/api/v1/accounts/', {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${apiAuthorizationToken}`,
            },
            baseURL: useRuntimeConfig().public.apiBase,
        })

        console.log('apiAuthorizationToken:', apiAuthorizationToken)
        console.log('Fetched data:', data)
        accounts.value = data
    } catch (e: any) {
        console.error('Failed to fetch accounts:', e)
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
function handleSelectAccount(account: any) {
    authStore.setUniqueAccountId(account.account_unique_id)
    authStore.setAccountOrganisation(account.account_organisation)
    router.push('/my_account')
}
</script>
