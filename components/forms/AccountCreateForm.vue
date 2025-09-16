<!-- components/forms/AccountCreateForm.vue -->
<template>
    <UForm
        :state="accountData"
        :rules="rules"
        @submit="handleSubmit"
        class="space-y-4"
    >
        <UFieldGroup gap="4">
            <UFormField label="Account Name" name="name" required>
                <UInput v-model="accountData.name" />
            </UFormField>
            <UFormField label="Email" name="email" required>
                <UInput type="email" v-model="accountData.email" />
            </UFormField>
            <UFormField label="Password" name="password" required>
                <UInput type="password" v-model="accountData.password" />
            </UFormField>
        </UFieldGroup>
        <div class="flex justify-end space-x-2">
            <UButton
                color="gray"
                variant="ghost"
                @click="modalStore.closeModal()"
                >Cancel</UButton
            >
            <UButton type="submit" :loading="isLoading" icon="i-heroicons-plus"
                >Create Account</UButton
            >
        </div>
    </UForm>
</template>
<script setup lang="ts">
import { useAccountStore } from '~/stores/account' // We'll create this next
const accountStore = useAccountStore() // Initialize your account store

const isLoading = ref(false)
const accountData = ref({ name: '', email: '', password: '' })

// Optional: Define validation rules if using UForm's built-in validation
const rules = {
    name: (value: string) => (value ? undefined : 'Name is required'),
    email: (value: string) =>
        value && /.+@.+\..+/.test(value) ? undefined : 'Invalid email',
    password: (value: string) =>
        value && value.length >= 6
            ? undefined
            : 'Password must be at least 6 characters',
}

async function handleSubmit() {
    isLoading.value = true
    try {
        // Call an action in your account store to create the account
        await accountStore.createAccount(accountData.value)

        // If successful, close the modal
        // modalStore.closeModal()

        // Optional: Show a success notification (e.g., using a toast store)
        // useToast().add({ title: 'Account created successfully!', icon: 'i-heroicons-check-circle' });
    } catch (error) {
        console.error('Error creating account:', error)
        // Optional: Show an error notification
        // useToast().add({ title: 'Error creating account', description: error.message, color: 'red' });
    } finally {
        isLoading.value = false
    }
}
</script>
