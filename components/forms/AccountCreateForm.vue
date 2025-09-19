<!-- components/forms/AccountCreateForm.vue -->
<template>
    <UForm
        :state="formData"
        :rules="rules"
        @submit="handleSubmit"
        class="space-y-4"
    >
        <!-- Account Organisation Field -->
        <UFormField
            label="Account Organisation Name"
            name="account.account_organisation"
            required
        >
            <UInput v-model="formData.account.account_organisation" />
        </UFormField>

        <h3 class="py-4">User Details</h3>

        <!-- User Details Fields -->
        <div class="form-field-group flex gap-4">
            <UFormField label="Full Name" name="user.full_name" required>
                <UInput v-model="formData.user.full_name" />
            </UFormField>
            <UFormField label="Email" name="user.email" required>
                <UInput type="email" v-model="formData.user.email" />
            </UFormField>
            <UFormField label="Password" name="user.password" required>
                <UInput type="password" v-model="formData.user.password" />
            </UFormField>
        </div>

        <div class="flex justify-end space-x-2">
            <!-- Emit 'close' when cancel is clicked -->
            <UButton color="gray" variant="ghost" @click="emit('close')"
                >Cancel</UButton
            >
            <UButton type="submit" :loading="isLoading" icon="i-heroicons-plus"
                >Create Account</UButton
            >
        </div>
    </UForm>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAccountStore } from '~/stores/account'

const accountStore = useAccountStore()
const isLoading = ref(false)

const formData = ref({
    account: {
        account_organisation: '',
    },
    user: {
        email: '',
        password: '',
        full_name: '',
        account_ids: [],
    },
})

const rules = {
    'account.account_organisation': (value: string) =>
        value ? undefined : 'Account organisation name is required',
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
        const newAccount = await accountStore.createAccount(formData.value)

        formData.value = {
            account: { account_organisation: '' },
            user: { email: '', password: '', full_name: '', account_ids: [] },
        }

        // Emit 'submitted' with the new account data
        emit('submitted', newAccount)

        // Show a success notification
        useToast().add({
            title: 'Account created successfully!',
            icon: 'i-heroicons-check-circle',
        })
    } catch (error: any) {
        console.error('Error creating account:', error)
        useToast().add({
            title: 'Error creating account',
            description: error.message,
            color: 'red',
        })
    } finally {
        isLoading.value = false
    }
}

const emit = defineEmits(['close', 'submitted'])
</script>
