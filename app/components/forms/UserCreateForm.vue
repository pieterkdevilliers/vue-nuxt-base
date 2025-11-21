<!-- components/forms/UserCreateForm.vue -->
<template>
    <UForm
        :state="formData"
        :rules="rules"
        @submit="handleSubmit"
        class="space-y-4"
    >
        <UFormField label="User Full Name" name="user.full_name" required>
            <UInput v-model="formData.user.full_name" />
        </UFormField>

        <UFormField label="User Email" name="user.email" required>
            <UInput v-model="formData.user.email" />
        </UFormField>

        <UFormField label="User Password" name="user.password" required>
            <UInput v-model="formData.user.password" type="password" />
        </UFormField>

        <div class="flex justify-end space-x-2">
            <UButton color="gray" variant="ghost" @click="emit('close')"
                >Cancel</UButton
            >
            <UButton type="submit" :loading="isLoading" icon="i-heroicons-plus"
                >Create User</UButton
            >
        </div>
    </UForm>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '~/stores/user'
import { useAuthStore } from '~/stores/auth'

const emit = defineEmits(['close', 'submitted'])
const userStore = useUserStore()
const isLoading = ref(false)

const authStore = useAuthStore()
const userEmail = authStore.userEmail || ''

const formData = ref({
    user: {
        email: userEmail,
        password: '',
        full_name: '',
        account_ids: [] as number[],
    },
})

const rules = {
    'user.full_name': (value: string) =>
        value ? undefined : 'Full name is required',
    'user.email': (value: string) =>
        value && /.+@.+\..+/.test(value) ? undefined : 'Invalid email',
    'user.password': (value: string) =>
        value && value.length >= 6
            ? undefined
            : 'Password must be at least 6 characters',
}

async function handleSubmit() {
    isLoading.value = true
    try {
        // Create the payload with the active account pre-filled
        const payload = {
            email: formData.value.user.email.trim(),
            password: formData.value.user.password || '',
            full_name: formData.value.user.full_name.trim() || '',
            // This is now guaranteed to be number[]
            account_ids: authStore.activeAccountId
                ? [authStore.activeAccountId]  // ← number
                : [] as number[],
        }

        const newUser = await userStore.createUser(payload)

        formData.value = {
            user: { email: '', password: '', full_name: '', account_ids: [] as number[] },
        }

        emit('submitted', newUser)

        useToast().add({
            title: 'User created successfully!',
            icon: 'i-heroicons-check-circle',
        })
    } catch (error: any) {
        console.error('Error creating user:', error)
        useToast().add({
            title: 'Error creating user',
            description: error.message,
            color: 'red',
        })
    } finally {
        isLoading.value = false
    }
}
</script>
