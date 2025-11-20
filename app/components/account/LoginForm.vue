<!-- components/account/LoginForm.vue -->
<template>
  <UCard class="max-w-md mx-auto">
    <template #header>
      <h1 class="text-xl font-bold">Login</h1>
    </template>

    <UForm :schema="schema" :state="state" @submit="handleLogin">
      <!-- your existing fields -->
      <UFormGroup class="space-y-4">
        <UFormField label="Email" name="username" required>
          <UInput v-model="state.username" placeholder="you@example.com" />
        </UFormField>
        <UFormField label="Password" name="password" required>
          <UInput v-model="state.password" type="password" placeholder="••••••••" />
        </UFormField>
      </UFormGroup>

      <UButton type="submit" block class="mt-6">Login</UButton>
    </UForm>

    <div class="mt-4 text-center">
        <UButton
            to="/forgot-password"
            variant="link"
            color="gray"
            class="p-0 h-auto font-normal text-sm text-red-600 hover:text-red-500"
            >
            Forgot Password?
        </UButton>

    </div>

    <p class="mt-6 text-center text-sm text-gray-600">
      Don't have an account?
      <button
        type="button"
        class="font-medium text-primary-600 hover:text-primary-500 focus:outline-none"
        @click="$emit('register')"
      >
        Create one here
      </button>
    </p>
  </UCard>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'

import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import auth from '~/middleware/auth'

const authStore = useAuthStore()
const apiAuthorizationToken = authStore.access_token

// Define Zod schema for the form
const schema = z.object({
    username: z
        .string()
        .nonempty('Email is required')
        .email('Invalid email address'),
    password: z
        .string()
        .nonempty('Password is required')
        .min(6, 'Must be at least 6 characters'),
})

// Infer the TypeScript type from the schema for better type safety
type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
    username: '',
    password: '',
})

const router = useRouter()
const toast = useToast()
defineEmits(['register'])

async function handleLogin(event: FormSubmitEvent<Schema>) {
    const formData = event.data
    try {
        const form = new URLSearchParams()
        form.append('username', formData.username)
        form.append('password', formData.password)

        const response = await $fetch('/api/v1/auth/login', {
            method: 'POST',
            body: form,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            baseURL: useRuntimeConfig().public.apiBase,
        })

        // localStorage.setItem('token', response.access_token)
        authStore.setAuthToken(response.access_token)
        authStore.setUniqueAccountId(response.account_unique_id)
        authStore.setAccountOrganisation(response.account_organisation)
        authStore.setUserEmail(formData.username)
        console.log('apiAuthorizationToken:', apiAuthorizationToken)
        const toastDuration = 1500
        toast.add({
            title: 'Success',
            description: 'Login successful! Redirecting...',
            color: 'success',
            duration: toastDuration,
        })
        setTimeout(() => {
            router.push('/account-list')
        }, toastDuration)
    } catch (error: any) {
        console.error('Login failed:', error)
        if (error.response?._data?.detail) {
            toast.add({
                title: 'Failed',
                description: 'Please try again',
                color: 'error',
            })
        }
    }
}
</script>
