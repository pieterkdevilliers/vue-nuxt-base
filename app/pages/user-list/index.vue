<!-- pages/user-list/index.vue -->
<template>
    <UPageHeader class="mb-6 flex justify-between items-center upage-header">
        <template #title>
            <h1>Users</h1>
            <ClientOnly>
                <UBreadcrumb
                    separator-icon="i-lucide-arrow-right"
                    :items="items"
                />
            </ClientOnly>
        </template>
        <template #links>
            <div v-if="authStore.isLoggedIn">
                <UButton @click="handleLogout">Log Out</UButton>
            </div>
        </template>
    </UPageHeader>
    <UButton
        label="Add New User"
        color="primary"
        variant="subtle"
        @click="openCreateUserModal"
        class="mb-4"
    />

    <div v-if="error" class="mt-6">
        <UAlert
            icon="i-lucide-alert-circle"
            color="red"
            variant="solid"
            :title="error"
        />
    </div>

    <div v-else-if="users.length">
        <UPageGrid class="mt-6">
            <UPageCard
                v-for="user in users"
                :key="user.id"
                :title="user.full_name"
                @click="handleSelectUser(user)"
            >
                <template #description>
                    <p>ID: {{ user.id }}</p>
                    <p>Email: {{ user.email }}</p>
                </template>
            </UPageCard>
        </UPageGrid>
    </div>
    <div v-else-if="loading">
        <div class="flex justify-center items-center mt-12">
            <UIcon name="i-lucide-loader-2" class="animate-spin w-6 h-6" />
            <span class="ml-2">Loading users...</span>
        </div>
    </div>
    <div v-else>
        <UAlert
            icon="i-lucide-info"
            title="No users found"
            description="There are currently no users available."
        />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import { useRouter } from 'vue-router'
import { useUserStore } from '~/stores/user'
import UserCreateForm from '~/components/forms/UserCreateForm.vue'
import GlobalModal from '~/components/GlobalModal.vue'

interface User {
    id: number
    email: string
    full_name: string
    user_id: number
}

interface BreadcrumbItem {
    label: string
    icon: string
    to?: string
}

const authStore = useAuthStore()
const router = useRouter()
const userStore = useUserStore()

const overlay = useOverlay()
const userModal = overlay.create(GlobalModal)

// Reactive refs from store
const { accountOrganisation, isLoggedIn, access_token, uniqueAccountId } =
    storeToRefs(authStore)
const { users, loading, error } = storeToRefs(userStore)

const items = computed<BreadcrumbItem[]>(() => [
    {
        label: 'My Accounts',
        icon: 'i-lucide-list',
        to: '/account-list',
    },
    {
        label: accountOrganisation.value || 'Loading...',
        icon: 'i-lucide-building',
        to: '/my-account',
    },
    {
        label: 'Users',
        icon: 'i-lucide-users',
    },
])

const fetchUsers = async () => {
  if (!uniqueAccountId.value) {
    error.value = 'No account selected'
    loading.value = false
    return
  }

  await userStore.fetchUsers(uniqueAccountId.value!)
}

onMounted(() => {
    console.log('User list component mounted')
    fetchUsers()
})

function handleLogout() {
    authStore.clearAll() // Use the new clearAll method
    router.push('/')
}

function handleSelectUser(user: User) {
    try {
        console.log('Selecting user:', user)

        // Use the new store methods
        authStore.setSelectedUser(user)

        // Navigate to user detail page
        const userIdToUse = user.user_id || user.id
        router.push(`/get-user/${userIdToUse}`)
    } catch (e) {
        console.error('Error selecting user:', e)
        error.value = 'Failed to select user. Please try again.'
    }
}

// Optional: Add a refresh method
const refreshUsers = () => {
    loading.value = true
    error.value = null
    users.value = []
    fetchUsers()
}

// Expose refresh method for potential use in template
defineExpose({
    refreshUsers,
})

// --- Modal functions (with added login checks) ---

function openCreateUserModal() {
    if (!authStore.isLoggedIn) {
        alert('You must be logged in to create a user.')
        return
    }
    userModal.open({
        title: 'Create New User',
        component: markRaw(UserCreateForm),
        componentProps: {},
        onSubmitted: async (newUser: any) => {
            console.log('User created:', newUser)

            // Instant optimistic update (feels magical)
            users.value.unshift({
                id: newUser.id,
                email: newUser.email,
                full_name: newUser.full_name || newUser.email.split('@')[0],
                user_id: newUser.id,
            })

            // Now safely refresh using the string uniqueAccountId
            if (uniqueAccountId.value) {
                await fetchUsers()  // ← This re-uses your existing function!
            }

            useToast().add({
                title: 'User created!',
                description: 'Added to the account.',
                icon: 'i-heroicons-check-circle',
            })

            userModal.close()
        },

    })
}
</script>
