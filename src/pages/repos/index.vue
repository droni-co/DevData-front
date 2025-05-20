<template>
  <div class="container mx-auto py-5">
    <h1 class="text-2xl font-bold mb-4">Repositorios</h1>
    <div class="flex flex-wrap gap-2 mb-4 items-center">
      <DuiInput v-model="search" type="text" placeholder="Buscar por nombre..." />
      <DuiInput v-model="selectedProject" type="text" placeholder="Filtrar por proyecto..." />
      <DuiInput v-model="qJson" type="text" placeholder="Buscar por JSON..." />
      <DuiSelect v-model="perPage" :options="perPageOptions" />
      <DuiButton color="primary" @click="onSearch">Buscar</DuiButton>
      <div class="flex-grow"></div>
      <DuiButton
        variant="ghost"
        color="secondary"
        :disabled="extractingAll"
        @click="extractAllDetails"
      >
        <i class="mdi mdi-download"></i> Fetch Details
      </DuiButton>
      <DuiButton
        variant="ghost"
        color="secondary"
        :disabled="fetchingRepos"
        @click="fetchAllRepos"
      >
        <i class="mdi mdi-database-import"></i> Fetch Repos
      </DuiButton>
    </div>
    <div v-if="loading" class="py-8 text-center text-gray-500">Cargando repositorios...</div>
    <div v-else-if="error" class="py-8 text-center text-red-500">Error: {{ error }}</div>
    <div v-else>
      <DuiTable :columns="[
          { name: 'name', label: 'Nombre' },
          { name: 'defaultBranch', label: 'Branch Principal' },
          { name: 'size', label: 'Tamaño' },
          { name: 'appservice', label: 'App Service' },
          { name: 'timestamps', label: 'Timestamps' },
          { name: 'actions', label: 'Acciones'},
        ]"
        :rows="repos" :loading="loading">
        <template #name="{ id, name, url, projectName }">
          <a :href="url" target="_blank" class="text-sky-900 hover:underline font-bold">{{ name }}</a><br>
          <small>{{ projectName }}</small><br>
          <small>{{ id }}</small>

        </template>
        <template #timestamps="{ createdAt, updatedAt }">
          <div>
            <small>Creado: {{ new Date(createdAt).toLocaleString() }}</small><br>
            <small>Actualizado: {{ new Date(updatedAt).toLocaleString() }}</small>
          </div>
        </template>
        <template #actions="repo">
          <div class="flex gap-2">
            <DuiButton variant="ghost" size="sm" @click="fetchDetails(repo.id)">
              <i class="mdi mdi-download"></i>
            </DuiButton>
            <DuiButton v-if="repo.package" variant="ghost" size="sm" @click="openPackageModal(repo)">
              <i class="mdi mdi-package-variant"></i>
            </DuiButton>
            <DuiButton v-if="repo.pipeline" variant="ghost" size="sm" @click="openPipelineModal(repo)">
              <i class="mdi mdi-timeline-clock-outline"></i>
            </DuiButton>
          </div>
        </template>
      </DuiTable>
      <div class="flex justify-between items-center mt-4">
        <span>Página {{ currentPage }} de {{ lastPage }}</span>
        <div class="flex gap-2">
          <DuiButton class="border rounded px-2 py-1" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">Anterior</DuiButton>
          <DuiButton class="border rounded px-2 py-1" :disabled="currentPage === lastPage" @click="goToPage(currentPage + 1)">Siguiente</DuiButton>
        </div>
      </div>
    </div>
    <!-- Modal para mostrar el package -->
    <div v-if="showPackageModal" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg w-[80vw] max-w-5xl p-6 relative">
        <button class="absolute top-2 right-2 text-gray-500 hover:text-black" @click="closePackageModal">
          <i class="mdi mdi-close"></i>
        </button>
        <h2 class="text-xl font-bold mb-2">Package de {{ selectedRepoName }}</h2>
        <pre class="bg-gray-100 rounded p-3 overflow-x-auto text-xs max-h-[70vh]">{{ selectedPackage ? JSON.stringify(selectedPackage, null, 2) : 'Sin datos' }}</pre>
      </div>
    </div>
    <!-- Modal para mostrar el pipeline -->
    <div v-if="showPipelineModal" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg w-[80vw] max-w-5xl p-6 relative">
        <button class="absolute top-2 right-2 text-gray-500 hover:text-black" @click="closePipelineModal">
          <i class="mdi mdi-close"></i>
        </button>
        <h2 class="text-xl font-bold mb-2">Pipeline de {{ selectedRepoName }}</h2>
        <pre class="bg-gray-100 rounded p-3 overflow-x-auto text-xs max-h-[70vh]" v-text="selectedPipeline || 'Sin datos'"></pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { DuiButton, DuiTable, DuiInput, DuiSelect } from '@dronico/droni-kit';
import type { Pagination, Repository } from '../../types/devops';

const repos = ref<Repository[]>([]);
const loading = ref(true);
const error = ref('');
const search = ref('');
const selectedProject = ref('');
const qJson = ref('');
const currentPage = ref(1);
const perPage = ref(10);
const total = ref(0);
const lastPage = ref(1);
const projectOptions = ref<string[]>([]);

const perPageOptions = [
  { label: '10', value: 10 },
  { label: '20', value: 20 },
  { label: '50', value: 50 },
  { label: '100', value: 100 },
  { label: 'All', value: 999999999 },
];

// Modal para mostrar package y pipeline
const showPackageModal = ref(false);
const selectedPackage = ref<any>(null);
const selectedRepoName = ref('');

const showPipelineModal = ref(false);
const selectedPipeline = ref<any>(null);

const openPackageModal = (repo: Repository) => {
  selectedPackage.value = repo.package;
  selectedRepoName.value = repo.name;
  showPackageModal.value = true;
};
const closePackageModal = () => {
  showPackageModal.value = false;
  selectedPackage.value = null;
  selectedRepoName.value = '';
};

const openPipelineModal = (repo: Repository) => {
  selectedPipeline.value = repo.pipeline;
  selectedRepoName.value = repo.name;
  showPipelineModal.value = true;
};
const closePipelineModal = () => {
  showPipelineModal.value = false;
  selectedPipeline.value = null;
  selectedRepoName.value = '';

};

// Exportar funciones para el template
// @ts-ignore
defineExpose({ openPipelineModal, closePipelineModal });

const fetchRepos = async () => {
  loading.value = true;
  error.value = '';
  try {
    const apiURL = import.meta.env.VITE_API_URL;
    const params: Record<string, any> = {
      page: currentPage.value,
      perPage: perPage.value,
    };
    if (search.value) params.q = search.value;
    if (selectedProject.value) params.project = selectedProject.value;
    if (qJson.value) params.qJson = qJson.value;
    const endpoint = apiURL + '/repos';
    const response = await axios.get<Pagination<Repository[]>>(endpoint, { params });
    repos.value = response.data.data;
    total.value = response.data.meta.total;
    lastPage.value = response.data.meta.lastPage;
    // Actualizar opciones de proyectos si es la primera página
    if (currentPage.value === 1) {
      const projects = repos.value.map(r => r.projectName).filter(Boolean);
      projectOptions.value = Array.from(new Set(projects));
    }
  } catch (err: any) {
    error.value = err.message || 'Error al cargar los repositorios';
  } finally {
    loading.value = false;
  }
};

const fetchDetails = async (id: string) => {
  try {
    const apiURL = import.meta.env.VITE_API_URL;
    const endpoint = `${apiURL}/repos/import/${id}`;
    await axios.get(endpoint);
    console.log('Detalles importados correctamente', id);
  } catch (err: any) {
    console.error('Error al importar el detalle:', err.message || 'Error desconocido');
  }
};

const extractingAll = ref(false);

const extractAllDetails = async () => {
  if (extractingAll.value) return;
  extractingAll.value = true;
  for (let i = 0; i < repos.value.length; i++) {
    try {
      await fetchDetails(repos.value[i].id);
    } catch (e) {
      // Ignorar errores individuales
    }
    if (i < repos.value.length - 1) {
      await new Promise(res => setTimeout(res, 2000));
    }
  }
  extractingAll.value = false;
  alert('Extracción de detalles finalizada');
};

const fetchingRepos = ref(false);

const fetchAllRepos = async () => {
  if (fetchingRepos.value) return;
  fetchingRepos.value = true;
  try {
    const apiURL = import.meta.env.VITE_API_URL;
    await axios.get(apiURL + '/repos/import');
    alert('Repos importados correctamente');
  } catch (err: any) {
    alert('Error al importar los repos: ' + (err.message || 'Error desconocido'));
  } finally {
    fetchingRepos.value = false;
  }
};

onMounted(() => {
  fetchRepos();
});

const goToPage = (page: number) => {
  if (page >= 1 && page <= lastPage.value) {
    currentPage.value = page;
    fetchRepos();
  }
};

const onSearch = () => {
  currentPage.value = 1;
  fetchRepos();
};


</script>