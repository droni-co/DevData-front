<template>
  <div class="chart-container">
    <h3>Eventos de Interacción con Chat</h3>
    <DoughnutChart :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Doughnut as DoughnutChart } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import type { Metric } from '../../types/copilot';

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps<{
  metrics: Metric[]
}>();

const chartData = computed(() => {
  let totalChatEvents = 0;
  let totalCopyEvents = 0;
  let totalInsertionEvents = 0;
  
  props.metrics.forEach(metric => {
    if (metric.copilot_ide_chat.editors) {
      metric.copilot_ide_chat.editors.forEach(editor => {
        editor.models.forEach(model => {
          totalChatEvents += model.total_chats;
          totalCopyEvents += model.total_chat_copy_events;
          totalInsertionEvents += model.total_chat_insertion_events;
        });
      });
    }
  });
  
  return {
    labels: ['Chat Messages', 'Copy Events', 'Insertion Events'],
    datasets: [
      {
        data: [totalChatEvents, totalCopyEvents, totalInsertionEvents],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
        ],
        hoverOffset: 4
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
      text: 'Distribución de Eventos de Chat'
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
