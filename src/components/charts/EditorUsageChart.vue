<template>
  <div class="chart-container">
    <h3>Uso de Copilot IDE Chat por Editor</h3>
    <Pie :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Pie } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import type { Metric } from '../../types/copilot';

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps<{
  metrics: Metric[]
}>();

const chartData = computed(() => {
  // Agregamos todos los usuarios por editor
  const editorData: Record<string, number> = {};
  
  props.metrics.forEach(metric => {
    const editors = metric.copilot_ide_chat.editors || [];
    editors.forEach(editor => {
      if (editorData[editor.name]) {
        editorData[editor.name] += editor.total_engaged_users;
      } else {
        editorData[editor.name] = editor.total_engaged_users;
      }
    });
  });
  
  return {
    labels: Object.keys(editorData),
    datasets: [
      {
        data: Object.values(editorData),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
        ],
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
      text: 'Usuarios por Editor'
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
}
</style>
