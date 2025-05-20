<template>
  <div class="container mx-auto py-5">
    <h1 class="text-2xl font-bold mb-4">Commits</h1>
    <div class="flex flex-wrap gap-2 mb-4 items-center">
      <DuiInput v-model="search" type="text" placeholder="Buscar por mensaje, autor o hash..." />
      <DuiInput v-model="repoName" type="text" placeholder="Filtrar por repositorio..." />
      <DuiSelect v-model="perPage" :options="perPageOptions" />
      <DuiButton color="primary" @click="onSearch">Buscar</DuiButton>
      <div class="flex-grow"></div>
      <DuiButton
        variant="ghost"
        color="secondary"
        :disabled="loading || fetchingAllCommits"
        @click="fetchAllCommits"
      >
        <i class="mdi mdi-download"></i> Fetch All Commits
      </DuiButton>
    </div>
    <div v-if="loading" class="py-8 text-center text-gray-500">Cargando commits...</div>
    <div v-else-if="error" class="py-8 text-center text-red-500">Error: {{ error }}</div>
    <div v-else>
      <DuiTable :columns="[
          { name: 'message', label: 'Mensaje' },
          { name: 'author', label: 'Autor' },
          { name: 'repo', label: 'Repositorio' },
          { name: 'date', label: 'Fecha' },
        ]" :rows="commits" :loading="loading">
        <template #message="{ comment, commitId }">
          <span class="bg-gray-200 text-gray-800 rounded-full px-2 py-0.5 font-mono text-xs align-middle">
            {{ commitId.slice(0, 8) }}
          </span>
          <span class="ml-2">{{ comment }}</span>
        </template>
        <template #author="{ authorName, authorEmail }">
          <span>{{ authorName }}</span><br>
          <span class="text-xs text-gray-500">{{ authorEmail }}</span>
        </template>
        <template #repo="{ projectName, repositoryName }">
          <strong>{{ repositoryName }}</strong><br>
          <small>{{ projectName }}</small>
        </template>
        <template #date="{ committerDate }">
          <span>{{ new Date(committerDate).toLocaleString() }}</span>
        </template>
      </DuiTable>
      <div class="flex justify-between items-center mt-4">
        <span>Página {{ currentPage }} de {{ lastPage }}</span>
        <div class="flex gap-2">
          <DuiButton :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">Anterior</DuiButton>
          <DuiButton :disabled="currentPage === lastPage" @click="goToPage(currentPage + 1)">Siguiente</DuiButton>
        </div>
      </div>
    </div>
    <div v-if="showScanningDialog" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg w-[80vw] max-w-3xl p-6 relative">
        <h2 class="text-xl font-bold mb-4">Progreso de importación de commits</h2>
        <div class="max-h-[60vh] overflow-y-auto">
          <table class="w-full text-xs">
            <thead>
              <tr>
                <th class="text-left">Repositorio</th>
                <th class="text-left">Proyecto</th>
                <th class="text-left">Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(repo) in scanningRepos" :key="repo.id">
                <td>{{ repo.name || repo.repositoryName }}</td>
                <td>{{ repo.projectName }}</td>
                <td>
                  <span v-if="repo.status === 'pending'" class="text-gray-500">En proceso...</span>
                  <span v-else-if="repo.status === 'success'" class="text-green-600">✔️ OK</span>
                  <span v-else class="text-red-600">❌ Error</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="mt-4 text-right">
          <DuiButton color="primary" @click="showScanningDialog = false">Cerrar</DuiButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { DuiButton, DuiTable, DuiInput, DuiSelect } from '@dronico/droni-kit';

interface Commit {
  hash: string;
  message: string;
  authorName: string;
  authorEmail: string;
  date: string;
  repoName: string;
}

const commits = ref<Commit[]>([]);
const loading = ref(true);
const error = ref('');
const search = ref('');
const repoName = ref('');
const currentPage = ref(1);
const perPage = ref(10);
const total = ref(0);
const lastPage = ref(1);
const fetchingAllCommits = ref(false);
const scanningRepos = ref<any[]>([]);
const showScanningDialog = ref(false);

const perPageOptions = [
  { label: '10', value: 10 },
  { label: '20', value: 20 },
  { label: '50', value: 50 },
  { label: '100', value: 100 },
];

const fetchCommits = async () => {
  loading.value = true;
  error.value = '';
  try {
    const apiURL = import.meta.env.VITE_API_URL;
    const params: Record<string, any> = {
      page: currentPage.value,
      perPage: perPage.value,
    };
    if (search.value) params.q = search.value;
    if (repoName.value) params.repo = repoName.value;
    const endpoint = apiURL + '/commits';
    const response = await axios.get(endpoint, { params });
    commits.value = response.data.data;
    total.value = response.data.meta.total;
    lastPage.value = response.data.meta.lastPage;
  } catch (err: any) {
    error.value = err.message || 'Error al cargar los commits';
  } finally {
    loading.value = false;
  }
};

const fetchAllCommits = async () => {
  if (fetchingAllCommits.value) return;
  fetchingAllCommits.value = true;
  scanningRepos.value = [];
  showScanningDialog.value = true;
  try {
    const apiURL = import.meta.env.VITE_API_URL;
    // 1. Obtener todos los repositorios (sin paginación)
    const reposResponse = await axios.get(apiURL + '/repos', { params: { perPage: 999999999, page: 1 } });
    const reposList = reposResponse.data.data;
    for (let i = 0; i < reposList.length; i++) {
      const repo = reposList[i];
      scanningRepos.value.push({ ...repo, status: 'pending' });
      try {
        await axios.get(`${apiURL}/commits/import/${repo.id}`);
        scanningRepos.value[i].status = 'success';
      } catch (err) {
        scanningRepos.value[i].status = 'error';
      }
      if (i < reposList.length - 1) {
        await new Promise(res => setTimeout(res, 2000));
      }
    }
    alert('Importación de commits finalizada');
  } catch (err: any) {
    alert('Error al importar commits: ' + (err.message || 'Error desconocido'));
  } finally {
    fetchingAllCommits.value = false;
    setTimeout(() => { showScanningDialog.value = false; }, 2000);
  }
};

onMounted(() => {
  fetchCommits();
});

const goToPage = (page: number) => {
  if (page >= 1 && page <= lastPage.value) {
    currentPage.value = page;
    fetchCommits();
  }
};

const onSearch = () => {
  currentPage.value = 1;
  fetchCommits();
};
</script>
