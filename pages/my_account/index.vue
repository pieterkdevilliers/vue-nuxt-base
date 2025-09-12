<template>
    <h1 class="text-green-500 text-2xl">
        My Accounts Page - {{ accountOrganisation }}
    </h1>
    <small>{{ isLoggedIn ? 'Logged In' : 'Logged Out' }}</small>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const apiAuthorizationToken = authStore.access_token
const uniqueAccountId = authStore.uniqueAccountId
const accountOrganisation = authStore.accountOrganisation
const isLoggedIn = authStore.isLoggedIn

// Define a ref to store the accounts data
const accounts = ref<any[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
    console.log('Mounted accounts component')
    console.log('accountOrganisation:', accountOrganisation)
    console.log('uniqueAccountId:', uniqueAccountId)
    console.log('apiAuthorizationToken:', apiAuthorizationToken)
    if (!apiAuthorizationToken) {
        console.log('API Authorization Token is missing')
        error.value = 'Authorization token not found. Please log in.'
        loading.value = false
        return
    }

    try {
        const response = await $fetch(`/api/v1/accounts/${uniqueAccountId}`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${apiAuthorizationToken}`,
            },
            baseURL: useRuntimeConfig().public.apiBase,
        })
        console.log('apiAuthorizationToken:', apiAuthorizationToken)
        console.log('Response:', response)
    } catch (e: any) {
        console.error('Failed to fetch accounts:', e)
        error.value = e.message || 'An unknown error occurred.'
    } finally {
        loading.value = false
    }
})
</script>
