<template>
    <UForm
        :state="formData"
        :rules="rules"
        @submit="handleSubmit"
        class="space-y-4"
    >
        <UFormField
            label="Account Organisation Name"
            name="account_organisation"
            required
        >
            <UInput v-model="formData.account_organisation" />
        </UFormField>

        <div class="flex justify-end space-x-2">
            <UButton color="gray" variant="ghost" @click="emit('close')"
                >Cancel</UButton
            >
            <UButton type="submit" :loading="isLoading" icon="i-heroicons-check"
                >Update Account</UButton
            >
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
    accountToUpdate: Account
}>()

const accountStore = useAccountStore()
const isLoading = ref(false)

const formData = ref({
    account_organisation: props.accountToUpdate.account_organisation,
})

watch(
    () => props.accountToUpdate,
    (newVal) => {
        formData.value.account_organisation = newVal.account_organisation
    }
)

const rules = {
    account_organisation: (value: string) =>
        value ? undefined : 'Account organisation name is required',
}

async function handleSubmit() {
    isLoading.value = true
    try {
        if (!props.accountToUpdate.account_unique_id) {
            console.error('Account unique ID is missing for update.')
            useToast().add({
                title: 'Error',
                description: 'Account ID is missing, cannot update.',
                color: 'red',
            })
            return // Stop execution if ID is missing
        }

        const updatePayload = {
            account_organisation: formData.value.account_organisation,
        }

        const updatedAccount = await accountStore.updateAccount(
            props.accountToUpdate.account_unique_id,
            updatePayload
        )

        emit('submitted', updatedAccount)

        useToast().add({
            title: 'Account updated successfully!',
            icon: 'i-heroicons-check-circle',
        })
    } catch (error: any) {
        console.error('Error updating account:', error)
        useToast().add({
            title: 'Error updating account',
            description: error.message,
            color: 'red',
        })
    } finally {
        isLoading.value = false
    }
}

const emit = defineEmits(['close', 'submitted'])
</script>
