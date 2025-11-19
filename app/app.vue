<template>
    <UApp :toaster="toaster">
        <NuxtLayout class="px-6">
            <NuxtPage />
        </NuxtLayout>
    </UApp>
</template>
<script setup lang="ts">
const toaster = { position: 'top-right' } as const
</script>
