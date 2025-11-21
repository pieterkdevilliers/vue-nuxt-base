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
        account_ids: [] as string[],
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
        const newUser = await userStore.createUser(formData.value.user)

        formData.value = {
            user: { email: '', password: '', full_name: '', account_ids: [] },
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
