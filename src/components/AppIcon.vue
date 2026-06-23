<script setup lang="ts">
import { computed } from 'vue'
import { getIcon } from '@/icons'

const props = withDefaults(defineProps<{
  name: string
  size?: number | string
  filled?: boolean
}>(), {
  size: 24,
  filled: false,
})

const icon = computed(() => getIcon(props.name))
const resolvedSize = computed(() => typeof props.size === 'number' ? `${props.size}px` : props.size)
</script>

<template>
  <svg
    v-if="icon"
    :width="resolvedSize"
    :height="resolvedSize"
    viewBox="0 0 24 24"
    :fill="filled ? 'currentColor' : 'none'"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    v-html="icon.svg"
  />
</template>
