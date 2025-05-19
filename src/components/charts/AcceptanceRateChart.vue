<template>
  <div class="chart-container">
    <h3>Tasa de Aceptación por Lenguaje</h3>
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import type { Metric } from '../../types/copilot';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const props = defineProps<{
  metrics: Metric[]
}>();

const chartData = computed(() => {
  // Agregar datos de aceptación por lenguaje
  const languageData: Record<string, { acceptances: number, suggestions: number }> = {};
  
  props.metrics.forEach(metric => {
    metric.copilot_ide_code_completions.editors.forEach(editor => {
      editor.models.forEach(model => {
        model.languages.forEach(lang => {
          if (!languageData[lang.name]) {
            languageData[lang.name] = { 
              acceptances: 0,
              suggestions: 0
            };
          }
          languageData[lang.name].acceptances += lang.total_code_acceptances;
          languageData[lang.name].suggestions += lang.total_code_suggestions;
        });
      });
    });
  });
  
  // Calcular tasa de aceptación (acceptances / suggestions * 100)
  const acceptanceRates = Object.entries(languageData)
    .map(([name, data]) => ({
      name,
      rate: data.suggestions > 0 ? (data.acceptances / data.suggestions * 100) : 0
    }))
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 10); // Top 10 por tasa de aceptación
  
  return {
    labels: acceptanceRates.map(item => item.name),
    datasets: [
      {
        label: 'Tasa de Aceptación (%)',
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        data: acceptanceRates.map(item => Math.round(item.rate * 100) / 100), // Redondear a 2 decimales
        borderWidth: 1,
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
      text: 'Top 10 Lenguajes por Tasa de Aceptación'
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 100,
      title: {
        display: true,
        text: 'Tasa de Aceptación (%)'
      }
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
