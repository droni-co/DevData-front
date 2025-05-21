
<template>
  <nav class="flex">
    <RouterLink
      v-for="item in menu"
      :key="item.name"
      :to="item.path"
      >
      <DuiAction variant="ghost" color="secondary">
        <i :class="item.icon"></i>
        {{ item.name }}
      </DuiAction>
    </RouterLink>
  </nav>
</template>
<script setup lang="ts">
import { DuiAction } from '@dronico/droni-kit';

const menu = [
  {
    name: 'Repositorios',
    icon: 'mdi mdi-source-repository-multiple',
    path: '/repos',
  },
  {
    name: 'Commits',
    icon: 'mdi mdi-source-commit',
    path: '/repos/commits',
  },
  {
    name: 'Pull Requests',
    icon: 'mdi mdi-source-pull',
    path: '/repos/pullrequests',
  },
  {
    name: 'Sonar',
    icon: 'mdi mdi-bug',
    path: '/repos/sonars',
  }
]

</script>
