<!-- pages/account/index.vue -->
<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <ClientOnly>
        <UCard class="max-w-md mx-auto">

        <!-- LOGIN FORM – shown by default or after successful registration -->
        <AccountLoginForm
            v-if="showLogin"
            @register="showLogin = false"
            class="animate-fade-in"
        />

        <!-- REGISTER FORM – shown only when user clicks "Create one here" -->
        <AccountFirstAccountCreateForm
            v-else
            @submitted="handleRegistrationSuccess"
            @close="showLogin = true"
            class="animate-fade-in"
        />
        </UCard>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'

// Clear any old session when landing on this page
const authStore = useAuthStore()
authStore.clearAuthToken()
authStore.clearUniqueAccountId()

// This controls which form is visible
const showLogin = ref(true)

// When registration succeeds → go back to login form
function handleRegistrationSuccess() {
  showLogin.value = true
}
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>