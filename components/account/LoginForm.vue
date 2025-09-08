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

<script setup>
import { reactive } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

// REMOVE THIS LINE - LET NU-XT AUTO-IMPORT THEM
// import { UCard, UForm, UFormGroup, UInput, UButton } from '#components'

const router = useRouter()
const state = reactive({
    username: '',
    password: '',
})

async function handleLogin() {
    try {
        const response = await axios.post('http://localhost:8000/token', {
            username: state.username,
            password: state.password,
        })
        localStorage.setItem('token', response.data.access_token)
        router.push('/account')
    } catch (error) {
        console.error('Login failed:', error)
    }
}
</script>
