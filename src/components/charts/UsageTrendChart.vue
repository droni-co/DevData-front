<template>
  <div class="chart-container">
    <h3>Tendencia de Uso por Tipo de Función</h3>
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
import type { Metric } from '../../types/copilot';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const props = defineProps<{
  metrics: Metric[]
}>();

const chartData = computed(() => {
  // Ordenar métricas por fecha
  const sortedMetrics = [...props.metrics].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  const dates = sortedMetrics.map(metric => {
    const date = new Date(metric.date);
    // Formato MM/DD
    return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
  });
  const ideChat = sortedMetrics.map(metric => metric.copilot_ide_chat.total_engaged_users);
  const dotcomChat = sortedMetrics.map(metric => metric.copilot_dotcom_chat.total_engaged_users);
  const pullRequests = sortedMetrics.map(metric => metric.copilot_dotcom_pull_requests.total_engaged_users);
  const codeCompletions = sortedMetrics.map(metric => metric.copilot_ide_code_completions.total_engaged_users);
  
  return {
    labels: dates,
    datasets: [
      {
        label: 'IDE Chat',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgb(54, 162, 235)',
        data: ideChat,
        tension: 0.4
      },
      {
        label: 'GitHub Chat',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgb(255, 99, 132)',
        data: dotcomChat,
        tension: 0.4
      },
      {
        label: 'Pull Requests',
        backgroundColor: 'rgba(255, 206, 86, 0.2)',
        borderColor: 'rgb(255, 206, 86)',
        data: pullRequests,
        tension: 0.4
      },
      {
        label: 'Code Completions',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgb(75, 192, 192)',
        data: codeCompletions,
        tension: 0.4
      }
    ]
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Tendencia de Usuarios Activos por Función'
    }
  },
  scales: {
    y: {
      beginAtZero: true
    }
  }
};
</script>

<style scoped>
.chart-container {
  height: 350px;
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}
</style>
