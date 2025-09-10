<!-- pages/account/index.vue -->
<template>
    <h1 class="text-red-500 text-2xl">Account Page</h1>
    <UButton @click="handleLogout">Log Out</UButton>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useRouter } from 'vue-router'
const authStore = useAuthStore()
const router = useRouter()
const apiAuthorizationToken = authStore.access_token
const uniqueAccountId = authStore.uniqueAccountId
const accountOrganisation = ref('')

function handleLogout() {
    authStore.clearAuthToken()
    authStore.clearUniqueAccountId()
    authStore.clearAccountOrganisation()
    router.push('/')
}
</script>
