<template>
  <div class="chart-container">
    <h3>Usuarios Activos vs Usuarios Comprometidos</h3>
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
  const dates = props.metrics.map(metric => {
    const date = new Date(metric.date);
    // Formato MM/DD
    return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
  });
  const activeUsers = props.metrics.map(metric => metric.total_active_users);
  const engagedUsers = props.metrics.map(metric => metric.total_engaged_users);
  
  return {
    labels: dates,
    datasets: [
      {
        label: 'Usuarios Activos',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgb(54, 162, 235)',
        data: activeUsers,
        fill: true
      },
      {
        label: 'Usuarios Comprometidos',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgb(255, 99, 132)',
        data: engagedUsers,
        fill: true
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
      text: 'Evolución de usuarios activos y comprometidos'
    }
  }
};
</script>

<style scoped>
.chart-container {
  height: 300px;
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  page-break-inside: avoid;
  break-inside: avoid;
}

@media print {
  .chart-container {
    box-shadow: none;
    border: 1px solid #e2e8f0;
    height: auto;
  }
}
</style>
