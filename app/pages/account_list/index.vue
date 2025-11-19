<template>
    <UPageHeader
        title="Accounts"
        class="mb-6 flex justify-between items-center upage-header"
    >
        <template #links>
            <UButton v-if="authStore.isLoggedIn" @click="handleLogout"
                >Log Out</UButton
            >
        </template>
    </UPageHeader>

    <h2 class="text-xl font-semibold">Account List</h2>

    <UButton
        label="Add New Account"
        color="primary"
        variant="subtle"
        @click="openCreateAccountModal"
        class="mb-4"
        :disabled="!authStore.isLoggedIn"
    />
    <!-- Disable if not logged in -->

    <div v-if="accountStore.accounts.length">
        <UPageGrid>
            <UPageCard
                v-for="account in accountStore.accounts"
                :key="account.id"
                :title="account.account_organisation"
                @click="handleSelectAccount(account)"
                class="cursor-pointer"
                :ui="{
                    footer: 'flex justify-end items-center w-full border-t border-slate-200 py-2 mt-6 pb-0',
                }"
            >
                <template #description>
                    <p>ID: {{ account.id }}</p>
                    <p>Account Unique ID: {{ account.account_unique_id }}</p>
                </template>
                <template #footer>
                    <UButton
                        color="secondary"
                        variant="ghost"
                        @click.stop="openUpdateAccountModal(account)"
                        icon="i-lucide-edit"
                    />
                    <UButton
                        color="error"
                        variant="ghost"
                        @click.stop="openDeleteAccountModal(account)"
                        icon="i-lucide-trash"
                    />
                </template>
            </UPageCard>
        </UPageGrid>
    </div>
    <div v-else-if="accountStore.isLoading">
        <p>Loading accounts...</p>
    </div>
    <!-- Display message if not logged in, taking precedence over general error if relevant -->
    <div v-else-if="!authStore.isLoggedIn">
        <p class="text-gray-500">Please log in to view and manage accounts.</p>
    </div>
    <div v-else-if="accountStore.error">
        <p class="text-red-500">Error: {{ accountStore.error }}</p>
    </div>
    <div v-else>
        <!-- This `else` will now only hit if logged in, but no accounts are found -->
        <p>No accounts found.</p>
    </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useRouter } from 'vue-router'
import { markRaw, watch } from 'vue' // Import `watch`
import { useAccountStore } from '~/stores/account'
import AccountCreateForm from '~/components/forms/AccountCreateForm.vue'
import AccountUpdateForm from '~/components/forms/AccountUpdateForm.vue'
import AccountDeleteForm from '~/components/forms/AccountDeleteForm.vue'
import GlobalModal from '~/components/GlobalModal.vue'

const authStore = useAuthStore()
const router = useRouter()
const accountStore = useAccountStore()

const overlay = useOverlay()
const accountModal = overlay.create(GlobalModal)

definePageMeta({
    layout: 'logged-in',
    middleware: ['auth'], // Apply the auth middleware here
})

// --- MODIFIED DATA FETCHING LOGIC ---

// Replaced `useAsyncData` with a `watch` effect
// This ensures `fetchAccounts` only runs when `authStore.access_token` is present.
// It effectively delays the fetching until the token is available (either initially
// from a successful login or after rehydration from cookie on page reload).
watch(
    () => authStore.access_token,
    async (newAccessToken) => {
        if (newAccessToken) {
            console.log(
                'Access token detected/rehydrated, fetching accounts...'
            )
            await accountStore.fetchAccounts().catch((error) => {
                console.error('Error fetching accounts:', error)
                // Optionally, if the token is invalid (e.g., 401 error from API),
                // you might want to clear the token and redirect to login.
                // Example: if (error.statusCode === 401) { authStore.clearAll(); router.push('/'); }
            })
        } else {
            // If the token becomes null (e.g., due to logout or failed rehydration),
            // clear any existing accounts to reflect the logged-out state.
            accountStore.accounts = []
            console.log('No access token, accounts cleared.')
        }
    },
    { immediate: true }
) // `immediate: true` ensures this runs once right away after setup

// --- END MODIFIED DATA FETCHING LOGIC ---

// --- Modal functions (with added login checks) ---

function openCreateAccountModal() {
    if (!authStore.isLoggedIn) {
        alert('You must be logged in to create an account.')
        return
    }
    accountModal.open({
        title: 'Create New Account',
        component: markRaw(AccountCreateForm),
        componentProps: {},
        onSubmitted: async (newAccount) => {
            console.log('Account submitted successfully:', newAccount)
            await accountStore.fetchAccounts() // Re-fetch after creation
            accountModal.close()
        },
        onModalClose: () => {
            accountModal.close()
        },
    })
}

function openUpdateAccountModal(account) {
    if (!account || !authStore.isLoggedIn) {
        alert('You must be logged in to update an account.')
        return
    }
    accountModal.open({
        title: account.account_organisation
            ? `Update Account: ${account.account_organisation}`
            : 'Update Account',
        component: markRaw(AccountUpdateForm),
        componentProps: {
            accountToUpdate: account,
        },
        onSubmitted: async (updatedAccount) => {
            console.log('Account updated successfully:', updatedAccount)
            await accountStore.fetchAccounts() // Re-fetch after update
            accountModal.close()
        },
        onModalClose: () => {
            accountModal.close()
        },
    })
}

function openDeleteAccountModal(account) {
    if (!account || !authStore.isLoggedIn) {
        alert('You must be logged in to delete an account.')
        return
    }
    accountModal.open({
        title: account.account_organisation
            ? `Delete Account: ${account.account_organisation}`
            : 'Delete Account',
        component: markRaw(AccountDeleteForm),
        componentProps: {
            accountToDelete: account,
        },
        onSubmitted: async (deleted) => {
            console.log('Account deleted successfully:', deleted)
            await accountStore.fetchAccounts() // Re-fetch after deletion
            accountModal.close()
        },
        onModalClose: () => {
            accountModal.close()
        },
    })
}

function handleLogout() {
    authStore.clearAll() // Use the new clearAll action
    router.push('/')
}

function handleSelectAccount(account: any) {
    authStore.setUniqueAccountId(account.account_unique_id)
    authStore.setAccountOrganisation(account.account_organisation)
    router.push('/my_account')
}
</script>
