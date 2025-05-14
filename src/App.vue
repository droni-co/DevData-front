
<template>
  <div class="h-screen flex">
    <nav class="bg-zinc-800">
      <RouterLink v-for="item in menu" :key="item.name" :to="item.path" class="block m-0">
        <DuiAction rounded="none" size="lg" :title="item.name" block variant="ghost" color="secondary">
          <i :class="item.icon"></i>
        </DuiAction>
      </RouterLink>
    </nav>
    <main class="bg-zinc-50 grow h-screen overflow-auto">
      <div class="container mx-auto">
        <RouterView></RouterView>
      </div>
    </main>
  </div>
</template>
<script setup lang="ts">
import { DuiAction } from '@dronico/droni-kit';

const menu = [
  {
    name: 'Home',
    icon: 'mdi mdi-home',
    path: '/',
  },
  {
    name: 'About',
    icon: 'mdi mdi-information',
    path: '/about',
  },
  {
    name: 'Secrets',
    icon: 'mdi mdi-key',
    path: '/secrets',
  },
  {
    name: 'Copilot',
    icon: 'mdi mdi-robot',
    path: '/copilot',
  }
]
</script>
