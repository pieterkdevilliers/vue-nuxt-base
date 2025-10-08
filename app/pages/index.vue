<!-- pages/account/index.vue -->
<template>
    <h1 class="text-accent">Home Page</h1>
    <ClientOnly>
        <AccountLoginForm />
    </ClientOnly>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
const authStore = useAuthStore()

authStore.clearUniqueAccountId()
authStore.clearAuthToken()
</script>
