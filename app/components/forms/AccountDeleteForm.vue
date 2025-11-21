<template>
    <UForm
        :state="formData"
        :rules="rules"
        @submit="handleSubmit"
        class="space-y-4"
    >
        <!-- <UFormField label="Account Unique ID" name="account_unique_id" required>
            <UInput v-model="formData.account_unique_id" />
        </UFormField>

        <div class="flex justify-end space-x-2">
            <UButton color="gray" variant="ghost" @click="emit('close')"
                >Cancel</UButton
            >
            <UButton
                color="danger"
                type="submit"
                :loading="isLoading"
                icon="i-heroicons-check"
                >Delete Account</UButton
            >
        </div> -->
        <UAlert color="error" class="mb-4 font-bold">
            <template #title class="alert__title text-center">
                <UIcon
                    name="lucide-alert-triangle"
                    class="w-8 h-8 block mx-auto"
                />
                <strong class="block mx-auto text-center my-1 text-xl"
                    >Warning</strong
                >
            </template>
            <template #description class="alert__description">
                <p class="text-center">
                    Are you sure you want to delete the account
                    <strong>{{
                        props.accountToDelete.account_organisation
                    }}</strong>
                    with ID
                    <strong>{{
                        props.accountToDelete.account_unique_id
                    }}</strong
                    >?
                </p>
                <p class="mt-2 text-center">This action cannot be undone.</p>
            </template>
        </UAlert>

        <div class="flex justify-between mt-6">
            <UButton
                color="neutral"
                variant="outline"
                @click="emit('close')"
                icon="lucide-x"
            >
                Cancel
            </UButton>
            <UButton
                color="error"
                variant="solid"
                type="submit"
                :loading="isLoading"
                icon="lucide-trash"
            >
                Delete User
            </UButton>
        </div>
    </UForm>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAccountStore } from '~/stores/account'

interface Account {
    id: string
    account_organisation: string
    account_unique_id?: string
}

const props = defineProps<{
    accountToDelete: Account
}>()

const accountStore = useAccountStore()
const isLoading = ref(false)

const formData = ref({
    account_unique_id: props.accountToDelete.account_unique_id,
})

watch(
    () => props.accountToDelete,
    (newVal) => {
        formData.value.account_unique_id = newVal.account_unique_id
    }
)

const rules = {
    account_unique_id: (value: string) =>
        value ? undefined : 'Account unique ID is required',
}

async function handleSubmit() {
    isLoading.value = true
    try {
        if (!props.accountToDelete.account_unique_id) {
            console.error('Account unique ID is missing for delete.')
            useToast().add({
                title: 'Error',
                description: 'Account ID is missing, cannot delete.',
                color: 'red',
            })
            return // Stop execution if ID is missing
        }

        const deletePayload = {
            account_unique_id: formData.value.account_unique_id,
        }

        const deletedAccount = await accountStore.deleteAccount(
            props.accountToDelete.account_unique_id,
            deletePayload
        )

        emit('submitted', deletedAccount)

        useToast().add({
            title: 'Account deleted successfully!',
            icon: 'i-heroicons-check-circle',
        })
    } catch (error: any) {
        console.error('Error deleting account:', error)
        useToast().add({
            title: 'Error deleting account',
            description: error.message,
            color: 'red',
        })
    } finally {
        isLoading.value = false
    }
}

const emit = defineEmits(['close', 'submitted'])
</script>
