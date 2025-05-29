<template>
  <div v-if="visible" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-lg w-[90vw] max-w-md p-6 flex flex-col items-center">
      <h2 class="text-lg font-bold mb-2">{{ title }}</h2>
      <div class="mb-2">{{ text }}</div>
      <div class="w-full bg-gray-200 rounded-full h-4 mb-2">
        <div
          class="bg-blue-500 h-4 rounded-full"
          :style="{ width: total ? (current / total * 100) + '%' : '0%' }"
        ></div>
      </div>
      <div>{{ current }} / {{ total }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

defineProps<{
  visible: boolean
  title?: string
  text?: string
  current: number
  total: number
}>()
</script>

<style scoped>
</style>
