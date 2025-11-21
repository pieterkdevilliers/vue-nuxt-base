<template>
    <UForm
        :state="formData"
        :rules="rules"
        @submit="handleSubmit"
        class="space-y-4"
    >
        <UFormField label="Confirm Email" name="email" required>
            <UInput v-model="formData.email" />
        </UFormField>

        <div class="flex justify-end space-x-2">
            <UButton color="gray" variant="ghost" @click="emit('close')"
                >Cancel</UButton
            >
            <UButton
                color="danger"
                type="submit"
                :loading="isLoading"
                icon="i-heroicons-skull"
            >
                Delete Account
            </UButton>
        </div>
    </UForm>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useUserStore } from '~/stores/user'
import type { UserBasic } from '~/types/user'

const emit = defineEmits(['close', 'submitted'])

const props = defineProps<{
    userToDelete: UserBasic
}>()

const userStore = useUserStore()
const isLoading = ref(false)

const formData = ref({
    id: props.userToDelete.user_id,
})

watch(
    () => props.userToDelete,
    (newVal) => {
        formData.value.id = newVal.user_id
    }
)

const rules = {
    id: (value: number) => {
        if (!value) return 'ID is required'
        if (value !== props.userToDelete.user_id) return 'ID does not match'
        return undefined
    },
}

async function handleSubmit() {
    isLoading.value = true
    try {
        if (!props.userToDelete?.id && props.userToDelete?.id !== 0) {
            useToast().add({
                title: 'Error',
                description: 'User ID is missing, cannot delete.',
                color: 'red',
            })
            return
        }

        await userStore.deleteUser(props.userToDelete.id)

        useToast().add({
            title: 'User deleted successfully!',
            icon: 'i-heroicons-check-circle',
        })

        emit('submitted', { id: props.userToDelete.id })
    } catch (error: any) {
        console.error('Error deleting user:', error)
        useToast().add({
            title: 'Error deleting user',
            description: error?.message || 'Unknown error',
            color: 'red',
        })
    } finally {
        isLoading.value = false
    }
}
</script>
