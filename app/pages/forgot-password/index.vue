<!-- components/account/LoginForm.vue -->
<template>
    <div class="min-h-screen bg-gray-50 py-12">
        <UCard class="max-w-md mx-auto">
            <template #header>
            <h1 class="text-xl font-bold">Reset Your Password</h1>
            </template>

            <UForm :schema="schema" :state="state" @submit="handleLogin">
            <!-- your existing fields -->
            <UFormGroup class="space-y-4">
                <UFormField label="Email" name="username" required>
                <UInput v-model="state.username" placeholder="you@example.com" />
                </UFormField>
            </UFormGroup>

            <UButton type="submit" block class="mt-6">Request Password Reset Link</UButton>
            </UForm>
        </UCard>
    </div>

</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'

import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

// Define Zod schema for the form
const schema = z.object({
    username: z
        .string()
        .nonempty('Email is required')
        .email('Invalid email address'),
})

// Infer the TypeScript type from the schema for better type safety
type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
    username: '',
})

const router = useRouter()
const toast = useToast()

async function handleLogin(event: FormSubmitEvent<Schema>) {
    const formData = event.data
    try {
        const form = new URLSearchParams()
        form.append('email', formData.username)

        const response = await $fetch('/api/v1/auth/forgot-password', {
            method: 'POST',
            body: { email: formData.username },                 // ← JSON object
            headers: { 'Content-Type': 'application/json' },    // ← JSON header
            baseURL: useRuntimeConfig().public.apiBase,
        })

        const toastDuration = 1500
        toast.add({
            title: 'Success',
            description: 'Password Reset Requested! Redirecting...',
            color: 'success',
            duration: toastDuration,
        })
        setTimeout(() => {
            router.push('/')
        }, toastDuration)
    } catch (error: any) {
        console.error('Password reset request failed:', error)
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
