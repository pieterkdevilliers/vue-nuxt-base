<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <UCard class="max-w-md mx-auto">
      <template #header>
        <h1 class="text-xl font-bold">Set New Password</h1>
      </template>

      <!-- Loading state -->
      <div v-if="loading" class="text-center py-8">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin text-4xl" />
        <p>Validating reset link...</p>
      </div>

      <!-- Invalid token -->
      <div v-else-if="invalidToken" class="text-center py-8 text-red-600">
        <p class="font-semibold">Invalid or expired reset link</p>
        <NuxtLink to="/forgot-password" class="text-primary underline">
          Request a new one
        </NuxtLink>
      </div>

      <!-- Valid token → show form -->
      <UForm v-else :schema="schema" :state="state" @submit="handleSubmit">
        <UFormGroup class="space-y-4">
            <UFormField label="Password" name="new_password" required>
                <UInput
                    v-model="state.new_password"
                    type="password"
                    placeholder="••••••••"
                />
            </UFormField>
            
            <UFormField label="Confirm Password" name="confirm_password" required>
                <UInput
                    v-model="state.confirm_password"
                    type="password"
                    placeholder="••••••••"
                />
            </UFormField>
        </UFormGroup>

        <UButton type="submit" block class="mt-6" :loading="submitting">
          Reset Password
        </UButton>
      </UForm>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const toast = useToast()

const token = route.query.token as string

const loading = ref(true)
const invalidToken = ref(false)
const submitting = ref(false)
import { z } from 'zod'

const state = reactive({
  new_password: '',
  confirm_password: '',
})

const schema = z.object({
  new_password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string(),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ['confirm_password'],
})

onMounted(async () => {
  if (!token) {
    invalidToken.value = true
    loading.value = false
    return
  }

  try {
    await $fetch('/api/v1/auth/validate-token', {
      method: 'POST',
      body: { token },
      baseURL: useRuntimeConfig().public.apiBase,
    })
    // Token is valid → show form
  } catch (error: any) {
    console.error('Token validation failed:', error)
    invalidToken.value = true
  } finally {
    loading.value = false
  }
})

async function handleSubmit() {
  submitting.value = true
  try {
    await $fetch('/api/v1/auth/reset-password', {
      method: 'POST',
      body: {
        token,
        new_password: state.new_password,
      },
      baseURL: useRuntimeConfig().public.apiBase,
    })

    toast.add({
      title: 'Success',
      description: 'Your password has been reset!',
      color: 'success',
    })

    setTimeout(() => router.push('/'), 1500)
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.response?._data?.detail || 'Failed to reset password',
      color: 'error',
    })
  } finally {
    submitting.value = false
  }
}
</script>