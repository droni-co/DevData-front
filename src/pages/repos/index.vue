<template>
  <div class="container mx-auto py-5">
    <ReposMenu />
    <h1 class="text-2xl font-bold mb-4">Repositorios</h1>
    <div class="flex flex-wrap gap-2 mb-4 items-center">
      <DuiInput v-model="search" type="text" placeholder="Buscar por nombre..." />
      <DuiSelect v-model="selectedProject" :options="projectOptions" placeholder="Filtrar por proyecto..." />
      <DuiInput v-model="qPackage" type="text" placeholder="Buscar por JSON..." />
      <DuiSelect v-model="perPage" :options="perPageOptions" />
      <DuiSelect v-model="isApi" :options="isApiOptions" placeholder="¿Es un API?" />
      <DuiSelect v-model="isExp" :options="isExpOptions" placeholder="¿Es de Experiencia?" />
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
        <template #name="{ repoId, name, url, projectName }">
          <a :href="url" target="_blank" class="text-sky-900 hover:underline font-bold">{{ name }}</a><br>
          <small>{{ projectName }}</small><br>
          <small>{{ repoId }}</small>

        </template>
        <template #timestamps="{ createdAt, updatedAt }">
          <div>
            <small>Creado: {{ new Date(createdAt).toLocaleString() }}</small><br>
            <small>Actualizado: {{ new Date(updatedAt).toLocaleString() }}</small>
          </div>
        </template>
        <template #actions="repo">
          <div class="flex gap-2">
            <DuiButton variant="ghost" size="sm" @click="fetchDetails(repo.repoId)">
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
      <TablePagination
        :current-page="currentPage"
        :last-page="lastPage"
        :total="total"
        :per-page="perPage"
        item-name="repositorio"
        item-name-plural="repositorios"
        @page-change="goToPage"
      />
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
import { get } from '../../utils/api';
import { DuiButton, DuiTable, DuiInput, DuiSelect } from '@dronico/droni-kit';
import type { Pagination, Repository, RepositoryFilters } from '../../types/devops';
import ReposMenu from '../../components/ReposMenu.vue';
import TablePagination from '../../components/TablePagination.vue';
const repos = ref<Repository[]>([]);
const loading = ref(true);
const error = ref('');
const search = ref('');
const selectedProject = ref('');
const qPackage = ref('');
const currentPage = ref(1);
const perPage = ref(10);
const total = ref(0);
const lastPage = ref(1);
const projectOptions = ref<{ label: string; value: string }[]>([]);

const perPageOptions = [
  { label: '10', value: 10 },
  { label: '20', value: 20 },
  { label: '50', value: 50 },
  { label: '100', value: 100 },
  { label: 'All', value: 999999999 },
];

const isApi = ref('');
const isApiOptions = [
  { label: 'Todas', value: '' },
  { label: 'Es un API', value: 'true' },
  { label: 'No es un API', value: 'false' },
];

const isExp = ref('');
const isExpOptions = [
  { label: 'Todas', value: '' },
  { label: 'Es de Experiencia', value: 'true' },
  { label: 'No es de Experiencia', value: 'false' },
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
    const params: Record<string, any> = {
      page: currentPage.value,
      perPage: perPage.value,
    };
    if (search.value) params.q = search.value;
    if (selectedProject.value) params.projectId = selectedProject.value;
    if (qPackage.value) params.qPackage = qPackage.value;
    if (isApi.value !== '') params.isApi = isApi.value;
    if (isExp.value !== '') params.isExp = isExp.value;
    
    const response = await get<Pagination<Repository[]>>('/repos', { params });
    repos.value = response.data.data;
    total.value = response.data.meta.total;
    lastPage.value = response.data.meta.lastPage;
  } catch (err: any) {
    error.value = err.message || 'Error al cargar los repositorios';
  } finally {
    loading.value = false;
  }
};

const fetchDetails = async (id: string) => {
  try {
    await get(`/repos/import/${id}`);
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
      await fetchDetails(repos.value[i].repoId);
    } catch (e) {
      // Ignorar errores individuales
    }
    if (i < repos.value.length - 1) {
      await new Promise(res => setTimeout(res, 500)); // Esperar 500ms entre cada solicitud
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
    await get('/repos/import');
    alert('Repos importados correctamente');
  } catch (err: any) {
    alert('Error al importar los repos: ' + (err.message || 'Error desconocido'));
  } finally {
    fetchingRepos.value = false;
  }
};

const fetchProjectOptions = async () => {
  try {
    const response = await get<RepositoryFilters>('/repos/filters');
    const filters: RepositoryFilters = response.data;
    projectOptions.value = [
      { label: 'Todos los proyectos', value: '' },
      ...filters.projects.map((p) => ({ label: p.projectName, value: p.projectId }))
    ];
  } catch (err) {
    projectOptions.value = [{ label: 'Todos los proyectos', value: '' }];
  }
};

onMounted(() => {
  fetchRepos();
  fetchProjectOptions();
});

const goToPage = (page: number) => {
  currentPage.value = page;
  fetchRepos();
};

const onSearch = () => {
  currentPage.value = 1;
  fetchRepos();
};


</script>