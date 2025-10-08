<template>
    <UModal :close="{ onClick: () => emit('close', false) }" :title="title">
        <template #body>
            <component
                :is="component"
                v-bind="componentProps"
                @submitted="handleSubmitted"
                @close="handleCloseFromComponent"
            />
        </template>

        <!-- Conditionally render the footer slot or component -->
        <template #footer>
            <div v-if="footerComponent" class="flex gap-2">
                <!-- Render the dynamic footer component -->
                <component
                    :is="footerComponent"
                    v-bind="footerComponentProps"
                />
            </div>
            <!-- If no footerComponent is provided, the footer will be empty as UModal's slot logic handles empty slots gracefully -->
        </template>
    </UModal>
</template>

<script setup lang="ts">
import { type Component } from 'vue'

const emit = defineEmits<{
    close: [boolean]
    submitted: [any]
}>()

interface Props {
    title?: string
    component?: Component
    componentProps?: Record<string, any>
    onModalClose?: () => void
    onSubmitted?: (payload: any) => void
    // NEW: Footer component and its props
    footerComponent?: Component // Component for the footer
    footerComponentProps?: Record<string, any> // Props for the footer component
}
const props = defineProps<Props>()

const handleSubmitted = (payload: any) => {
    if (props.onSubmitted) {
        props.onSubmitted(payload)
    }
    emit('submitted', payload)
}

const handleCloseFromComponent = () => {
    if (props.onModalClose) {
        props.onModalClose()
    }
    emit('close', false)
}
</script>
