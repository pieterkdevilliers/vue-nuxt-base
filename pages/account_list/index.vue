<!-- pages/account/index.vue -->
<template>
    <h1 class="font-semibold text-2xl">Account Page</h1>
    <div v-if="authStore.isLoggedIn">
        <UButton @click="handleLogout">Log Out</UButton>
    </div>

    <h2 class="text-xl font-semibold">Account List</h2>
    <!-- Bind the UModal to the isOpen ref -->
    <UModal
        v-model="isCreateAccountModalOpen"
        title="Create New Account"
        :close="{
            color: 'neutral',
            variant: 'ghost',
        }"
        :data-id="'create-account-modal'"
    >
        <!-- Button to open the modal -->
        <UButton
            label="Add New Account"
            color="primary"
            variant="subtle"
            @click="isCreateAccountModalOpen = true"
        />

        <template #body>
            <!-- AccountCreateForm will now only emit 'submitted', not 'close' directly to the modal -->
            <AccountCreateForm
                @submitted="handleAccountSubmitted"
                @close="isCreateAccountModalOpen = false"
            />
        </template>
    </UModal>
    <div v-if="accountStore.accounts.length">
        <UPageGrid>
            <UPageCard
                v-for="account in accountStore.accounts"
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
    <div v-else-if="accountStore.isLoading">
        <p>Loading accounts...</p>
    </div>
    <div v-else-if="accountStore.error">
        <p class="text-red-500">Error: {{ accountStore.error }}</p>
    </div>
    <div v-else>
        <p>No accounts found.</p>
    </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import { useAccountStore } from '~/stores/account'
import AccountCreateForm from '~/components/forms/AccountCreateForm.vue'

const authStore = useAuthStore()
const router = useRouter()
const accountStore = useAccountStore()

// This ref will control the UModal's visibility
const isCreateAccountModalOpen = ref(false)

definePageMeta({
    layout: 'logged-in',
})

onMounted(async () => {
    await accountStore.fetchAccounts()
})

async function handleAccountSubmitted(newAccount: any) {
    console.log('Account submitted successfully:', newAccount)
    // 1. Close the modal
    isCreateAccountModalOpen.value = false
    const modalCloseButton = document.querySelector(
        '[role="dialog"][data-state="open"] button[aria-label="Close"]'
    ) as HTMLElement
    if (modalCloseButton) {
        modalCloseButton.click()
    }
    // 2. Display a toast with a success message (already handled in form)
    // 3. Refresh the account list
    await accountStore.fetchAccounts()
}

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
