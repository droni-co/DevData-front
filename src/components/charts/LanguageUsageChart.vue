<template>
  <div class="chart-container">
    <h3>Lenguajes de Programación más Usados</h3>
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
  // Agregamos todos los usuarios por lenguaje
  const languageData: Record<string, { users: number, acceptances: number, suggestions: number }> = {};
  
  props.metrics.forEach(metric => {
    const languages = metric.copilot_ide_code_completions.languages || [];
    languages.forEach(lang => {
      if (!languageData[lang.name]) {
        languageData[lang.name] = { 
          users: 0,
          acceptances: 0,
          suggestions: 0
        };
      }
      languageData[lang.name].users += lang.total_engaged_users;
    });
    
    // Obtener datos detallados de aceptaciones y sugerencias desde los modelos
    metric.copilot_ide_code_completions.editors.forEach(editor => {
      editor.models.forEach(model => {
        model.languages.forEach(lang => {
          if (languageData[lang.name]) {
            languageData[lang.name].acceptances += lang.total_code_acceptances;
            languageData[lang.name].suggestions += lang.total_code_suggestions;
          }
        });
      });
    });
  });
  
  // Ordenar por número de usuarios para mostrar los más populares
  const sortedLanguages = Object.keys(languageData)
    .sort((a, b) => languageData[b].users - languageData[a].users)
    .slice(0, 10); // Mostrar los 10 lenguajes más usados
  
  return {
    labels: sortedLanguages,
    datasets: [
      {
        label: 'Usuarios',
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        data: sortedLanguages.map(lang => languageData[lang].users),
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
      text: 'Top 10 Lenguajes por Usuarios'
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
