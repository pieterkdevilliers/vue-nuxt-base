<!-- components/account/LoginForm.vue -->
<template>
    <UCard class="max-w-md mx-auto mt-10">
        <template #header>
            <h1 class="text-xl font-bold">Login</h1>
        </template>

        <UForm :state="state" @submit="handleLogin">
            <UFormGroup label="Username" name="username" class="mb-4">
                <UInput
                    v-model="state.username"
                    placeholder="you@example.com"
                />
            </UFormGroup>

            <UFormGroup label="Password" name="password" class="mb-4">
                <UInput
                    v-model="state.password"
                    type="password"
                    placeholder="••••••••"
                />
            </UFormGroup>

            <UButton type="submit" block> Login </UButton>
        </UForm>
    </UCard>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const state = ref({
  username: '',
  password: ''
})

const router = useRouter()

async function handleLogin() {
  try {
    const form = new URLSearchParams()
    form.append('username', state.value.username)
    form.append('password', state.value.password)

    const response = await $fetch('/api/v1/auth/login', {
      method: 'POST',
      body: form,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      baseURL: useRuntimeConfig().public.apiBase
    })

    localStorage.setItem('token', response.access_token)
    router.push('/')
  } catch (error: any) {
    console.error('Login failed:', error)
    if (error.response?._data?.detail) {
      alert(error.response._data.detail)
    }
  }
}
</script>
