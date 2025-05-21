<template>
  <div class="container mx-auto py-5">
    <ReposMenu />
    <h1 class="text-2xl font-bold mb-4">Pull Requests</h1>
    <div class="flex flex-wrap gap-2 mb-4 items-center">
      <DuiSelect v-model="selectedProjectName" :options="projectNameOptions" placeholder="Filtrar por proyecto..." />
      <DuiSelect v-model="selectedRepositoryName" :options="repositoryNameOptions" placeholder="Filtrar por repositorio..." />
      <DuiSelect v-model="selectedCreatorName" :options="creatorNameOptions" placeholder="Filtrar por creador..." />
      <DuiSelect v-model="selectedSourceRefName" :options="sourceRefNameOptions" placeholder="Filtrar por rama origen..." />
      <DuiSelect v-model="selectedTargetRefName" :options="targetRefNameOptions" placeholder="Filtrar por rama destino..." />
      <DuiSelect v-model="selectedStatus" :options="statusOptions" placeholder="Filtrar por estado..." />
      <DuiSelect v-model="selectedMergeStatus" :options="mergeStatusOptions" placeholder="Filtrar por merge status..." />
      <DuiSelect v-model="perPage" :options="perPageOptions" />
      <DuiButton color="primary" @click="onSearch">Buscar</DuiButton>
      <div class="flex-grow"></div>
      <DuiButton
        variant="ghost"
        color="secondary"
        :disabled="loading"
      >
        <i class="mdi mdi-download"></i> Fetch Pull Requests
      </DuiButton>
    </div>
    <div v-if="loading" class="py-8 text-center text-gray-500">Cargando pull requests...</div>
    <div v-else-if="error" class="py-8 text-center text-red-500">Error: {{ error }}</div>
    <div v-else>
      <DuiTable :columns="columns" :rows="pullrequests" :loading="loading">
        <template #title="{ title, id }">
          <span class="font-mono text-xs text-gray-500">#{{ id }}</span>
          <span class="ml-2">{{ title }}</span>
        </template>
        <template #creator="{ creatorName }">
          <span>{{ creatorName }}</span>
        </template>
        <template #repo="{ repositoryName, projectName }">
          <strong>{{ repositoryName }}</strong><br>
          <small>{{ projectName }}</small>
        </template>
        <template #status="{ status }">
          <span>{{ statusLabel(status) }}</span>
        </template>
        <template #mergeStatus="{ mergeStatus }">
          <span>{{ mergeStatusLabel(mergeStatus) }}</span>
        </template>
        <template #date="{ creationDate, closedDate }">
          <span>Creado: {{ new Date(creationDate).toLocaleString() }}</span><br>
          <span v-if="closedDate">Cerrado: {{ new Date(closedDate).toLocaleString() }}</span>
        </template>
      </DuiTable>
      <div class="flex justify-between items-center mt-4">
        <span>
          Página {{ currentPage }} de {{ lastPage }} | Total: {{ total }} PRs
        </span>
        <div class="flex gap-2">
          <DuiButton :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">Anterior</DuiButton>
          <DuiButton :disabled="currentPage === lastPage" @click="goToPage(currentPage + 1)">Siguiente</DuiButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { DuiButton, DuiTable, DuiSelect } from '@dronico/droni-kit';
import ReposMenu from '../../components/ReposMenu.vue';
import type { Pullrequest, PullrequestFilters } from '../../types/devops';

const pullrequests = ref<Pullrequest[]>([]);
const loading = ref(true);
const error = ref('');
const currentPage = ref(1);
const perPage = ref(10);
const total = ref(0);
const lastPage = ref(1);

// Filtros
const selectedProjectName = ref('');
const selectedRepositoryName = ref('');
const selectedCreatorName = ref('');
const selectedSourceRefName = ref('');
const selectedTargetRefName = ref('');
const selectedStatus = ref('');
const selectedMergeStatus = ref('');

const projectNameOptions = ref<{ label: string; value: string }[]>([]);
const repositoryNameOptions = ref<{ label: string; value: string }[]>([]);
const creatorNameOptions = ref<{ label: string; value: string }[]>([]);
const sourceRefNameOptions = ref<{ label: string; value: string }[]>([]);
const targetRefNameOptions = ref<{ label: string; value: string }[]>([]);
const statusOptions = ref<{ label: string; value: string }[]>([]);
const mergeStatusOptions = ref<{ label: string; value: string }[]>([]);

const perPageOptions = [
  { label: '10', value: 10 },
  { label: '20', value: 20 },
  { label: '50', value: 50 },
  { label: '100', value: 100 },
];

const columns = [
  { name: 'title', label: 'Título' },
  { name: 'creator', label: 'Creador' },
  { name: 'repo', label: 'Repositorio' },
  { name: 'sourceRefName', label: 'Rama Origen' },
  { name: 'targetRefName', label: 'Rama Destino' },
  { name: 'status', label: 'Estado' },
  { name: 'mergeStatus', label: 'Merge Status' },
  { name: 'date', label: 'Fechas' },
];

const fetchPullrequestFilters = async () => {
  try {
    const apiURL = import.meta.env.VITE_API_URL;
    const response = await axios.get(apiURL + '/pullrequests/filters');
    const filters: PullrequestFilters = response.data;
    projectNameOptions.value = [
      { label: 'Todos los proyectos', value: '' },
      ...filters.projectName.map((p: string) => ({ label: p, value: p }))
    ];
    repositoryNameOptions.value = [
      { label: 'Todos los repositorios', value: '' },
      ...filters.repositoryName.map((r: string) => ({ label: r, value: r }))
    ];
    creatorNameOptions.value = [
      { label: 'Todos los creadores', value: '' },
      ...filters.creatorName.map((c: string) => ({ label: c, value: c }))
    ];
    sourceRefNameOptions.value = [
      { label: 'Todas las ramas origen', value: '' },
      ...filters.sourceRefName.map((s: string) => ({ label: s, value: s }))
    ];
    targetRefNameOptions.value = [
      { label: 'Todas las ramas destino', value: '' },
      ...filters.targetRefName.map((t: string) => ({ label: t, value: t }))
    ];
    statusOptions.value = [
      { label: 'Todos los estados', value: '' },
      ...filters.status.map((s: number) => ({ label: statusLabel(s), value: String(s) }))
    ];
    mergeStatusOptions.value = [
      { label: 'Todos los merge status', value: '' },
      ...filters.mergeStatus.map((m: number) => ({ label: mergeStatusLabel(m), value: String(m) }))
    ];
  } catch (err) {
    projectNameOptions.value = [{ label: 'Todos los proyectos', value: '' }];
    repositoryNameOptions.value = [{ label: 'Todos los repositorios', value: '' }];
    creatorNameOptions.value = [{ label: 'Todos los creadores', value: '' }];
    sourceRefNameOptions.value = [{ label: 'Todas las ramas origen', value: '' }];
    targetRefNameOptions.value = [{ label: 'Todas las ramas destino', value: '' }];
    statusOptions.value = [{ label: 'Todos los estados', value: '' }];
    mergeStatusOptions.value = [{ label: 'Todos los merge status', value: '' }];
  }
};

const fetchPullrequests = async () => {
  loading.value = true;
  error.value = '';
  try {
    const apiURL = import.meta.env.VITE_API_URL;
    const params: Record<string, any> = {
      page: currentPage.value,
      perPage: perPage.value,
    };
    if (selectedProjectName.value) params.projectName = selectedProjectName.value;
    if (selectedRepositoryName.value) params.repositoryName = selectedRepositoryName.value;
    if (selectedCreatorName.value) params.creatorName = selectedCreatorName.value;
    if (selectedSourceRefName.value) params.sourceRefName = selectedSourceRefName.value;
    if (selectedTargetRefName.value) params.targetRefName = selectedTargetRefName.value;
    if (selectedStatus.value) params.status = selectedStatus.value;
    if (selectedMergeStatus.value) params.mergeStatus = selectedMergeStatus.value;
    const endpoint = apiURL + '/pullrequests';
    const response = await axios.get(endpoint, { params });
    pullrequests.value = response.data.data;
    total.value = response.data.meta.total;
    lastPage.value = response.data.meta.lastPage;
  } catch (err: any) {
    error.value = err.message || 'Error al cargar los pull requests';
  } finally {
    loading.value = false;
  }
};

const statusLabel = (status: number|string) => {
  const map: Record<number|string, string> = {
    0: 'Activo',
    1: 'Completado',
    2: 'Abandonado',
  };
  return map[status] ?? status;
};
const mergeStatusLabel = (mergeStatus: number|string) => {
  const map: Record<number|string, string> = {
    0: 'Desconocido',
    1: 'Sin conflictos',
    2: 'Conflictos',
    3: 'Completado',
    4: 'No aplicable',
  };
  return map[mergeStatus] ?? mergeStatus;
};

const goToPage = (page: number) => {
  if (page >= 1 && page <= lastPage.value) {
    currentPage.value = page;
    fetchPullrequests();
  }
};
const onSearch = () => {
  currentPage.value = 1;
  fetchPullrequests();
};

onMounted(() => {
  fetchPullrequestFilters();
  fetchPullrequests();
});
</script>
