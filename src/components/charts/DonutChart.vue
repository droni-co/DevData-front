<template>
  <Doughnut :key="chartKey" :data="liveChartData" :options="chartOptions" class="max-h-[500px]" />
</template>
<script setup lang="ts">
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, type ChartData } from 'chart.js'
import { computed } from 'vue';
ChartJS.register(ArcElement, Tooltip, Legend);

const props = defineProps<{
  name: string
  chartData: ChartData<"doughnut", number[], unknown>
}>();

const liveChartData = computed((): ChartData<"doughnut", number[], unknown> => {
  return props.chartData;
});
// Clave reactiva para forzar re-render
const chartKey = computed(() => JSON.stringify(props.chartData));



// Opciones del gráfico con escala ajustada
const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'right' as const },
    title: { display: true, text: props.name }
  }
}));
</script>
