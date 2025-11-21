<!-- pages/get-user/[id].vue -->
<template>
    <div class="flex justify-between">
        <div class="flex flex-col gap-4">
            <h1 class="text-green-500 text-2xl">User Details</h1>
            <ClientOnly>
                <UBreadcrumb
                    separator-icon="i-lucide-arrow-right"
                    :items="items"
                />
            </ClientOnly>
        </div>
        <div v-if="authStore.isLoggedIn">
            <UButton @click="handleLogout">Log Out</UButton>
        </div>
    </div>

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

    <div v-else-if="user" class="mt-6">
        <UPageGrid>
            <UPageCard :title="`User ID: ${route.params.id}`">
                <template #header>
                    <h2 class="text-lg font-semibold">User Information</h2>
                    <UModal
                        title="Edit User: {{ user.full_name }}"
                        :close="{
                            color: 'neutral',
                            variant: 'ghost',
                        }"
                    >
                        <UButton
                            label="Edit User"
                            color="primary"
                            variant="subtle"
                        />

                    </UModal>
                </template>
                <template #default>
                    <div class="space-y-4">
                        <div>
                            <h3 class="text-xl font-semibold">
                                {{ user.full_name }}
                            </h3>
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

// Set page meta
definePageMeta({
    name: 'get-user-id',
})
</script>
