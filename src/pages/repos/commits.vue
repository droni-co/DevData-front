<template>
  <div class="container mx-auto py-5">
    <ReposMenu />
    <h1 class="text-2xl font-bold mb-4">Commits</h1>
    <div class="flex flex-wrap gap-2 mb-4 items-center">
      <DuiInput v-model="search" type="text" placeholder="Buscar por mensaje, autor o hash..." />
      <DuiSelect v-model="selectedProject" :options="projectOptions" placeholder="Filtrar por proyecto..." />
      <DuiSelect v-model="selectedAuthor" :options="authorOptions" placeholder="Filtrar por autor..." />
      <DuiSelect v-model="perPage" :options="perPageOptions" />
      <DuiButton color="primary" @click="onSearch">Buscar</DuiButton>
      <div class="flex-grow"></div>
      <DuiButton
        v-if="user?.role === 'admin'"
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
          { name: 'changes', label: 'Cambios' },
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
        <template #changes="{ changeAdd, changeEdit, changeDelete }">
          <span class="text-xs text-gray-500">
            <span class="bg-green-100 p-1 rounded-l">+{{ changeAdd }}</span>
            <span class="bg-yellow-100 p-1">~{{ changeEdit }}</span>
            <span class="bg-red-100 p-1 rounded-r">-{{ changeDelete }}</span>
          </span>
        </template>
        <template #repo="{ projectName, repositoryName }">
          <strong>{{ repositoryName }}</strong><br>
          <small>{{ projectName }}</small>
        </template>
        <template #date="{ committerDate }">
          <span>{{ new Date(committerDate).toLocaleString() }}</span>
        </template>
      </DuiTable>
      <TablePagination
        :current-page="currentPage"
        :last-page="lastPage"
        :total="total"
        :per-page="perPage"
        item-name="commit"
        item-name-plural="commits"
        @page-change="goToPage"
      />
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
import { useAuth } from '../../middleware/auth';
import { ref, onMounted } from 'vue';
import { get } from '../../utils/api';
import { DuiButton, DuiTable, DuiInput, DuiSelect } from '@dronico/droni-kit';
import ReposMenu from '../../components/ReposMenu.vue';
import TablePagination from '../../components/TablePagination.vue';
import type { CommitFilters, Commit } from '../../types/devops';

const { user } = useAuth();
const commits = ref<Commit[]>([]);
const loading = ref(true);
const error = ref('');
const search = ref('');
const currentPage = ref(1);
const perPage = ref(10);
const total = ref(0);
const lastPage = ref(1);
const fetchingAllCommits = ref(false);
const scanningRepos = ref<any[]>([]);
const showScanningDialog = ref(false);

const selectedProject = ref('');
const selectedAuthor = ref('');
const projectOptions = ref<{ label: string; value: string }[]>([]);
const authorOptions = ref<{ label: string; value: string }[]>([]);

const perPageOptions = [
  { label: '10', value: 10 },
  { label: '20', value: 20 },
  { label: '50', value: 50 },
  { label: '100', value: 100 },
];

const fetchCommitFilters = async () => {
  try {
    const response = await get<CommitFilters>('/commits/filters');
    const filters: CommitFilters = response.data;
    projectOptions.value = [
      { label: 'Todos los proyectos', value: '' },
      ...filters.projects.map((p) => ({ label: p.projectName, value: p.projectId }))
    ];
    authorOptions.value = [
      { label: 'Todos los autores', value: '' },
      ...filters.authors.map((a) => ({ label: `${a.authorName} <${a.authorEmail}>`, value: a.authorEmail }))
    ];
  } catch (err) {
    projectOptions.value = [{ label: 'Todos los proyectos', value: '' }];
    authorOptions.value = [{ label: 'Todos los autores', value: '' }];
  }
};

const fetchCommits = async () => {
  loading.value = true;
  error.value = '';
  try {
    const params: Record<string, any> = {
      page: currentPage.value,
      perPage: perPage.value,
    };
    if (search.value) params.q = search.value;
    if (selectedProject.value) params.projectId = selectedProject.value;
    if (selectedAuthor.value) params.authorEmail = selectedAuthor.value;
    
    const response = await get('/commits', { params });
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
    // 1. Obtener todos los repositorios (sin paginación)
    const reposResponse = await get('/repos', { params: { perPage: 999999999, page: 1 } });
    const reposList = reposResponse.data.data;
    for (let i = 0; i < reposList.length; i++) {
      const repo = reposList[i];
      scanningRepos.value.push({ ...repo, status: 'pending' });
      try {
        await get(`/commits/import/${repo.repoId}`);
        scanningRepos.value[i].status = 'success';
      } catch (err) {
        scanningRepos.value[i].status = 'error';
      }
      if (i < reposList.length - 1) {
        await new Promise(res => setTimeout(res, 1000));
      }
    }
    alert('Importación de commits finalizada');
  } catch (err: any) {
    alert('Error al importar commits: ' + (err.message || 'Error desconocido'));
  } finally {
    fetchingAllCommits.value = false;
    setTimeout(() => { showScanningDialog.value = false; }, 1000);
  }
};

onMounted(() => {
  fetchCommits();
  fetchCommitFilters();
});

const goToPage = (page: number) => {
  currentPage.value = page;
  fetchCommits();
};

const onSearch = () => {
  currentPage.value = 1;
  fetchCommits();
};
</script>
