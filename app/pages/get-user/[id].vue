<!-- pages/get-user/[id].vue -->
<template>
    <UPageHeader
        class="mb-6 flex justify-between items-center upage-header"
        :ui="{
            links: 'gap-6',
        }"
    >
        <template #title>
            <h1>User Details</h1>
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

    <div v-if="error" class="mt-6">
        <UAlert
            icon="i-lucide-alert-circle"
            color="red"
            variant="solid"
            :title="error"
        />
    </div>

    <div v-else-if="loading" class="mt-6">
        <div class="flex justify-center items-center mt-12">
            <UIcon name="i-lucide-loader-2" class="animate-spin w-6 h-6" />
            <span class="ml-2">Loading user details...</span>
        </div>
    </div>

    <div v-else-if="user">
        <UPageGrid class="mt-4">
            <UPageCard
                :ui="{
                    header: 'flex flex-row justify-between items-center w-full',
                }"
            >
                <template #header>
                    <h2 class="text-lg font-semibold">User Information</h2>
                    <UButton
                        label="Edit User"
                        color="secondary"
                        variant="outline"
                        size="sm"
                        icon="i-lucide-edit"
                        @click.stop="openUpdateUserModal(user)"
                    />
                </template>
                <template #default>
                    <div class="space-y-4">
                        <div>
                            <strong>
                                {{ user.full_name }}
                            </strong>
                            <p class="text-gray-600">{{ user.email }}</p>
                        </div>

                        <div class="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span class="font-medium">User ID:</span>
                                <span class="ml-2">{{ user.id }}</span>
                            </div>
                            <div v-if="user.user_id">
                                <span class="font-medium">Internal ID:</span>
                                <span class="ml-2">{{ user.user_id }}</span>
                            </div>
                        </div>
                    </div>
                </template>
            </UPageCard>
        </UPageGrid>
    </div>

    <div v-else class="mt-6">
        <UAlert
            icon="i-lucide-info"
            title="User not found"
            description="The requested user could not be found."
        />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import { useUserStore } from '~/stores/user'
import { useRoute, useRouter } from 'vue-router'
import type { UserBasic } from '~/types/user'
import UserUpdateForm from '~/components/forms/UserUpdateForm.vue'
import GlobalModal from '~/components/GlobalModal.vue'

interface User {
    id: string
    email: string
    full_name: string
    user_id?: string
}

interface BreadcrumbItem {
    label: string
    icon: string
    to?: string
}

const authStore = useAuthStore()
const userStore = useUserStore()
const route = useRoute()
const router = useRouter()

const overlay = useOverlay()
const userModal = overlay.create(GlobalModal)

// Reactive refs from store
const { access_token, uniqueAccountId, accountOrganisation, isLoggedIn } =
    storeToRefs(authStore)
const { loading, error } = storeToRefs(userStore)

// Component state
const { selectedUser } = storeToRefs(userStore)
const user = selectedUser

// Get user ID from route params
const userId = computed<number | null>(() => {
    const id = route.params.id
    return Array.isArray(id) || !id ? null : Number(id)
})

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
        to: '/user-list',
    },
    {
        label: user.value?.full_name || `User ${userId.value}`,
        icon: 'i-lucide-user',
    },
])

const getUser = async () => {
    if (!userId.value) {
        error.value = 'No user selected'
        loading.value = false
        return
    }

    await userStore.getUser(userId.value)
}

onMounted(() => {
    console.log('User detail page mounted for user:', userId.value)
    getUser()
})

function handleLogout() {
    authStore.clearAll()
    router.push('/')
}

function openUpdateUserModal(user: UserBasic) {
    if (!authStore.isLoggedIn) {
        alert('You must be logged in to update a user.')
        return
    }
    userModal.open({
        title: user.full_name ? `Edit User: ${user.full_name}` : 'Edit User',
        component: markRaw(UserUpdateForm),
        componentProps: {
            userToUpdate: user,
        },
        onSubmitted: async (updatedUser) => {
            console.log('User updated successfully:', updatedUser)
            // await fetchUsers() // wrapper uses uniqueAccountId
            userModal.close()
        },
        onModalClose: () => {
            userModal.close()
        },
    })
}

// Set page meta
definePageMeta({
    name: 'get-user-id',
})
</script>
