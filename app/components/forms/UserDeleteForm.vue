<template>
    <UForm
        :state="formData"
        :rules="rules"
        @submit="handleSubmit"
        class="space-y-4"
    >
        <!-- <UFormField label="Confirm Email" name="email" required>
            <UInput v-model="formData.email" />
        </UFormField> -->
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
                    Are you sure you want to delete the user
                    <strong>{{ props.userToDelete.full_name }}</strong> with
                    email <strong>{{ props.userToDelete.email }}</strong
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
