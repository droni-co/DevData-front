<template>
  <div class="container mx-auto">
    <h1 class="text-2xl font-bold mb-4">Repositorios</h1>
    <div class="flex flex-wrap gap-2 mb-4 items-center">
      <input v-model="search" type="text" placeholder="Buscar por nombre..." class="border rounded px-2 py-1" />
      <select v-model="selectedProject" class="border rounded px-2 py-1">
        <option value="">Todos los proyectos</option>
        <option v-for="project in projectOptions" :key="project" :value="project">{{ project }}</option>
      </select>
    </div>
    <div v-if="loading" class="py-8 text-center text-gray-500">Cargando repositorios...</div>
    <div v-else-if="error" class="py-8 text-center text-red-500">Error: {{ error }}</div>
    <div v-else>
      <DuiTable :columns="columns" :rows="tableRows" :loading="loading" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { DuiTable } from '@dronico/droni-kit';
import type { Repository } from '../../types/devops';

const repos = ref<Repository[]>([]);
const loading = ref(true);
const error = ref('');

const fetchRepos = async () => {
  loading.value = true;
  error.value = '';
  try {
    const apiURL = import.meta.env.VITE_API_URL;
    const endpoint = apiURL + '/repos';
    const response = await axios.get(endpoint);
    repos.value = response.data;
  } catch (err: any) {
    error.value = err.message || 'Error al cargar los repositorios';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchRepos);

const search = ref('');
const selectedProject = ref('');

const projectOptions = computed(() => {
  const projects = repos.value.map(r => r.projectName).filter(Boolean);
  return Array.from(new Set(projects));
});

const filteredRepos = computed(() => {
  let result = repos.value;
  if (selectedProject.value) {
    result = result.filter(r => r.projectName === selectedProject.value);
  }
  if (search.value) {
    result = result.filter(r => r.name.toLowerCase().includes(search.value.toLowerCase()));
  }
  return result;
});

const columns = [
  { name: 'name', label: 'Nombre' },
  { name: 'projectName', label: 'Proyecto' },
  { name: 'defaultBranch', label: 'Branch Principal' },
  { name: 'size', label: 'Tamaño' },
  { name: 'createdAt', label: 'Creado' },
  { name: 'updatedAt', label: 'Actualizado' },
  { name: 'url', label: 'Enlace' },
];

const tableRows = computed(() =>
  filteredRepos.value.map(repo => ({
    ...repo,
    size: repo.size ? `${(repo.size / 1024 / 1024).toFixed(2)} MB` : '-',
    createdAt: repo.createdAt ? new Date(repo.createdAt).toLocaleDateString() : '-',
    updatedAt: repo.updatedAt ? new Date(repo.updatedAt).toLocaleDateString() : '-',
  }))
);
</script>

<style scoped>
.repos-list {
  padding: 24px 0;
}
</style>
