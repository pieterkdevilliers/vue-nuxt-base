<!-- components/account/LoginForm.vue -->
<template>
    <UCard class="max-w-md mx-auto mt-10">
        <template #header>
            <h1 class="text-xl font-bold">Login</h1>
        </template>

        <UForm :schema="schema" :state="state" @submit="handleLogin">
            <UFormField label="Email" name="username" class="mb-4">
                <UInput
                    v-model="state.username"
                    placeholder="you@example.com"
                />
            </UFormField>

            <UFormField label="Password" name="password" class="mb-4">
                <UInput
                    v-model="state.password"
                    type="password"
                    placeholder="••••••••"
                />
            </UFormField>

            <UButton type="submit" block> Login </UButton>
        </UForm>
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
        const toastDuration = 3000
        toast.add({
            title: 'Success',
            description: 'Login successful! Redirecting...',
            color: 'success',
            duration: toastDuration,
        })
        setTimeout(() => {
            router.push('/account')
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
