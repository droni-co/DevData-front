<template>
  <div class="container mx-auto py-5">
    <h1 class="text-2xl font-bold mb-4">Dashboard de SonarQube</h1>
    <div class="mb-6 flex flex-wrap gap-4 items-center">
      <DuiSelect v-model="selectedProject" :options="projectOptions" placeholder="Filtrar por proyecto..." />
      <DuiButton color="primary" @click="fetchReports">Actualizar</DuiButton>
    </div>
    <div v-if="loading" class="py-8 text-center text-gray-500">Cargando reportes...</div>
    <div v-else-if="error" class="py-8 text-center text-red-500">Error: {{ error }}</div>
    <div v-else>
      <div class="mb-8">
        <h2 class="text-lg font-semibold mb-2">Issues a lo largo del tiempo</h2>
        <Line :data="chartData" :options="chartOptions" style="min-height: 300px;" />
      </div>
      <!-- Aquí puedes agregar más widgets o reportes -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import axios from 'axios';
import { DuiButton, DuiSelect } from '@dronico/droni-kit';
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
} from 'chart.js';

import type { IssuesOverTime } from '../../types/reports';

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale);

const projectOptions = ref([{ label: 'Todos los proyectos', value: '' }]);
const selectedProject = ref('');
const loading = ref(false);
const error = ref('');
const issuesOverTime = ref<IssuesOverTime>([]);

const chartData = computed(() => ({
  labels: issuesOverTime.value.map(d => d.date),
  datasets: [
    {
      label: 'Issues',
      data: issuesOverTime.value.map(d => d.total),
      borderColor: '#2563eb',
      backgroundColor: 'rgba(37,99,235,0.1)',
      fill: true,
      tension: 0.3,
      pointRadius: 3,
      pointBackgroundColor: '#2563eb',
    }
  ]
}));

const chartOptions = {
  responsive: true,
  plugins: {
    legend: { display: false },
    title: { display: false }
  },
  scales: {
    x: { title: { display: true, text: 'Fecha' }, ticks: { autoSkip: true, maxTicksLimit: 10 } },
    y: { title: { display: true, text: 'Total Issues' }, beginAtZero: true, ticks: { stepSize: 1 } }
  }
};

const fetchProjects = async () => {
  try {
    const apiURL = import.meta.env.VITE_API_URL;
    const resp = await axios.get(apiURL + '/sonars/filters');
    projectOptions.value = [
      { label: 'Todos los proyectos', value: '' },
      ...resp.data.project.map((p: string) => ({ label: p, value: p }))
    ];
  } catch {
    // fallback: solo opción por defecto
  }
};

const fetchReports = async () => {
  loading.value = true;
  error.value = '';
  try {
    const apiURL = import.meta.env.VITE_API_URL;
    const params: any = {};
    if (selectedProject.value) params.project = selectedProject.value;
    const resp = await axios.get(apiURL + '/reports/sonar/issues-over-time', { params });
    issuesOverTime.value = resp.data as IssuesOverTime;
  } catch (err: any) {
    error.value = err.message || 'Error al cargar los reportes';
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await fetchProjects();
  await fetchReports();
});

watch(selectedProject, fetchReports);
</script>
