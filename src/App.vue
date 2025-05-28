<template>
  <div class="h-screen app-container">
    <nav class="flex bg-zinc-700 shadow-lg dark p-0 m-0 print-hidden" v-if="isAuthenticated">
      <RouterLink v-for="item in menu" :key="item.name" :to="item.path" class="inline-block m-0">
        <DuiAction
          :block="true"
          rounded="none"
          :title="item.name"
          variant="ghost"
          color="primary">
          <i :class="item.icon"></i>
          <span class="hidden md:inline ms-2">{{ item.name }}</span>
        </DuiAction>
      </RouterLink>
    </nav>
    <main class="bg-zinc-50 print-content">
      <RouterView></RouterView>
    </main>
  </div>
</template>
<script setup lang="ts">
import { DuiAction } from '@dronico/droni-kit';
import { useAuth } from './middleware/auth';

const { isAuthenticated } = useAuth()

const menu = [
  {
    name: 'Home',
    icon: 'mdi mdi-home',
    path: '/',
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
  },
  {
    name: 'Repos',
    icon: 'mdi mdi-source-repository',
    path: '/repos',
  },
  {
    name: 'Reportes',
    icon: 'mdi mdi-file-chart',
    path: '/reports/sonar',
  },
]
</script>

<style>
/* Estilos para impresión */
@media print {
  .print-hidden {
    display: none !important;
  }
  
  .app-container {
    display: block !important;
    height: auto !important;
  }
  
  .print-content {
    overflow: visible !important;
    height: auto !important;
    width: 100% !important;
    display: block !important;
    page-break-inside: avoid;
  }
  
  .container {
    max-width: 100% !important;
    width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
  }
  
  /* Asegurar que los gráficos se impriman correctamente */
  .chart-container {
    page-break-inside: avoid;
    break-inside: avoid;
    margin-bottom: 15px !important;
    height: auto !important;
    max-height: none !important;
  }
  
  /* Ajustar filas de gráficos para impresión */
  .charts-row {
    display: block !important;
    page-break-inside: avoid;
  }
}
</style>
