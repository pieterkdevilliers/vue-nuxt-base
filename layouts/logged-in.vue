// layouts/logged-in.vue
<template>
    <UApp :toaster="toaster">
        <div>
            <NuxtPage />
        </div>
    </UApp>
</template>

<script setup lang="ts">
const toaster = { position: 'top-right' }
</script>
