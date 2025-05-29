<template>
  <Bar :key="chartKey" :data="liveChartData" :options="chartOptions" class="max-h-[400px]" />
</template>
<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, type ChartData } from 'chart.js'
import { computed } from 'vue';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);



const props = defineProps<{
  chartData: ChartData<"bar">
}>();

const liveChartData = computed(() => {
  return props.chartData as ChartData<"bar">;
});
// Clave reactiva para forzar re-render
const chartKey = computed(() => JSON.stringify(props.chartData));

// Sugerir un máximo en la escala y el valor por encima de los datos
const suggestedMax = computed(() => {
  const allValues = props.chartData.datasets.flatMap(ds => ds.data);
  const numericValues = allValues.filter((v): v is number => typeof v === 'number' && !isNaN(v));
  const maxVal = numericValues.length ? Math.max(...numericValues) : 0;
  return Math.ceil(maxVal * 1.2);
});

// Opciones del gráfico con escala ajustada
const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top' as const },
    title: { display: true, text: 'Tendencia de Usuarios Activos por Función' }
  },
  scales: {
    y: {
      beginAtZero: true,
      suggestedMax: suggestedMax.value
    }
  }
}));
</script>
