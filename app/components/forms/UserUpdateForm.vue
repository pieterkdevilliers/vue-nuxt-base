<template>
    <UForm
        :state="formData"
        :rules="rules"
        @submit="handleSubmit"
        class="space-y-4"
    >
        <UFormField label="Full Name" name="full_name" required>
            <UInput v-model="formData.full_name" />
        </UFormField>
        <UFormField label="Email" name="email" required>
            <UInput v-model="formData.email" />
        </UFormField>

        <div class="flex justify-end space-x-2">
            <UButton color="gray" variant="ghost" @click="emit('close')"
                >Cancel</UButton
            >
            <UButton type="submit" :loading="isLoading" icon="i-heroicons-check"
                >Update User</UButton
            >
        </div>
    </UForm>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useUserStore } from '~/stores/user'

// interface Account {
//     id: string
//     account_organisation: string
//     account_unique_id?: string
// }

const props = defineProps<{
    userToUpdate: UserBasic
}>()

const userStore = useUserStore()
const isLoading = ref(false)

const formData = ref({
    full_name: props.userToUpdate.full_name,
    email: props.userToUpdate.email,
})

watch(
    () => props.userToUpdate,
    (newVal) => {
        formData.value.full_name = newVal.full_name
        formData.value.email = newVal.email
    }
)

const rules = {
    full_name: (value: string) => (value ? undefined : 'Full name is required'),
    email: (value: string) => (value ? undefined : 'Email is required'),
}

async function handleSubmit() {
    isLoading.value = true
    try {
        if (!props.userToUpdate.id) {
            console.error('User ID is missing for update.')
            useToast().add({
                title: 'Error',
                description: 'User ID is missing, cannot update.',
                color: 'red',
            })
            return // Stop execution if ID is missing
        }

        const updatePayload = {
            email: formData.value.email,
            full_name: formData.value.full_name,
        }

        const updatedUser = await userStore.updateUser(
            props.userToUpdate.id,
            updatePayload
        )

        emit('submitted', updatedUser)

        useToast().add({
            title: 'User updated successfully!',
            icon: 'i-heroicons-check-circle',
        })
    } catch (error: any) {
        console.error('Error updating user:', error)
        useToast().add({
            title: 'Error updating user',
            description: error.message,
            color: 'red',
        })
    } finally {
        isLoading.value = false
    }
}

const emit = defineEmits(['close', 'submitted'])
</script>
