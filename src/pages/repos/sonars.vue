<template>
  <div class="container mx-auto py-5">
    <ReposMenu />
    <h1 class="text-2xl font-bold mb-4">Sonar Issues</h1>
    <div class="flex flex-wrap gap-2 mb-4 items-center">
      <DuiInput v-model="search" type="text" placeholder="Buscar por mensaje, regla o autor..." />
      <DuiSelect v-model="selectedSeverity" :options="severityOptions" placeholder="Filtrar por severidad..." />
      <DuiSelect v-model="selectedStatus" :options="statusOptions" placeholder="Filtrar por estado..." />
      <DuiSelect v-model="selectedProject" :options="projectOptions" placeholder="Filtrar por proyecto..." />
      <DuiSelect v-model="selectedAuthor" :options="authorOptions" placeholder="Filtrar por autor..." />
      <DuiSelect v-model="selectedRule" :options="ruleOptions" placeholder="Filtrar por regla..." />
      <DuiSelect v-model="selectedType" :options="typeOptions" placeholder="Filtrar por tipo..." />
      <DuiSelect v-model="perPage" :options="perPageOptions" />
      <DuiButton color="primary" @click="onSearch">Buscar</DuiButton>
      <div class="flex-grow"></div>
      <DuiButton
        v-if="user?.role === 'admin'"
        variant="ghost"
        color="secondary"
        @click="fetchAllSonars"
      >
        <i class="mdi mdi-download"></i> Fetch Sonar Issues
      </DuiButton>
    </div>
    <div v-if="loading" class="py-8 text-center text-gray-500">Cargando issues de Sonar...</div>
    <div v-else-if="error" class="py-8 text-center text-red-500">Error: {{ error }}</div>
    <div v-else>
      <DuiTable :columns="[
          { name: 'rule', label: 'Regla' },
          { name: 'severity', label: 'Severidad' },
          { name: 'project', label: 'Proyecto' },
          { name: 'author', label: 'Autor' },
          { name: 'status', label: 'Estado' },
          { name: 'effortDebt', label: 'Esfuerzo / Deuda' },
          { name: 'date', label: 'Fechas' },
        ]" :rows="sonars" :loading="loading">
        <template #rule="{ rule, message }">
          <span class="font-mono text-xs">{{ rule }}</span><br>
          <small>{{ message }}</small>
        </template>
        <template #severity="{ severity, type }">
          <span :class="severityClass(severity)">{{ severity }}</span><br>
          {{ type }}
        </template>
        <template #component="{ component }">
          <span class="font-mono text-xs">{{ component }}</span>
        </template>
        <template #project="{ projectName }">
          <span>{{ projectName }}</span>
        </template>
        <template #author="{ author }">
          <span>{{ author }}</span>
        </template>
        <template #status="{ status }">
          <span>{{ status }}</span>
        </template>
        <template #effortDebt="{ effort, debt }">
          <small class="flex">
            <span class="bg-gray-200 rounded-l px-2 py-1">
              {{ effort }}
            </span>
            <span class="bg-gray-300 rounded-r px-2 py-1">
              {{ debt }}
            </span>
          </small>
        </template>
        <template #date="{ creationDate, updateDate }">
          <small>Creado: {{ new Date(creationDate).toLocaleString() }}<br>
          Actualizado: {{ new Date(updateDate).toLocaleString() }}</small>
        </template>
      </DuiTable>
      <TablePagination
        :current-page="currentPage"
        :last-page="lastPage"
        :total="total"
        :per-page="perPage"
        item-name="issue"
        item-name-plural="issues"
        @page-change="goToPage"
      />
    </div>
  </div>
  <div v-if="importingSonars" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-lg w-[90vw] max-w-md p-6 flex flex-col items-center">
      <h2 class="text-lg font-bold mb-2">{{ importMessage }}</h2>
      <div v-if="importMessage === 'Importando issues de Sonar...'">
        <span class="loader"></span>
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
import type { Sonars, Pagination } from '../../types/devops';

const { user } = useAuth();
const sonars = ref<Sonars[]>([]);
const loading = ref(true);
const error = ref('');
const search = ref('');
const selectedSeverity = ref('');
const selectedStatus = ref('');
const selectedProject = ref('');
const selectedAuthor = ref('');
const selectedRule = ref('');
const selectedType = ref('');
const currentPage = ref(1);
const perPage = ref(10);
const total = ref(0);
const lastPage = ref(1);

const severityOptions = ref([{ label: 'Todas las severidades', value: '' }]);
const statusOptions = ref([{ label: 'Todos los estados', value: '' }]);
const projectOptions = ref([{ label: 'Todos los proyectos', value: '' }]);
const authorOptions = ref([{ label: 'Todos los autores', value: '' }]);
const ruleOptions = ref([{ label: 'Todas las reglas', value: '' }]);
const typeOptions = ref([{ label: 'Todos los tipos', value: '' }]);
const perPageOptions = [
  { label: '10', value: 10 },
  { label: '20', value: 20 },
  { label: '50', value: 50 },
  { label: '100', value: 100 },
];

const fetchSonarsFilters = async () => {
  try {
    const response = await get('/sonars/filters');
    const filters = response.data;
    severityOptions.value = [
      { label: 'Todas las severidades', value: '' },
      ...filters.severity.map((s: string) => ({ label: s, value: s }))
    ];
    statusOptions.value = [
      { label: 'Todos los estados', value: '' },
      ...filters.status.map((s: string) => ({ label: s, value: s }))
    ];
    projectOptions.value = [
      { label: 'Todos los proyectos', value: '' },
      ...filters.project.map((p: string) => ({ label: p, value: p }))
    ];
    authorOptions.value = [
      { label: 'Todos los autores', value: '' } // No author in filters, keep default
    ];
    ruleOptions.value = [
      { label: 'Todas las reglas', value: '' },
      ...filters.rule.map((r: string) => ({ label: r, value: r }))
    ];
    typeOptions.value = [
      { label: 'Todos los tipos', value: '' },
      ...filters.type.map((t: string) => ({ label: t, value: t }))
    ];
  } catch (err) {
    // fallback: mantener opciones por defecto
  }
};

const fetchSonars = async () => {
  loading.value = true;
  error.value = '';
  try {
    const params: Record<string, any> = {
      page: currentPage.value,
      perPage: perPage.value,
    };
    if (search.value) params.q = search.value;
    if (selectedSeverity.value) params.severity = selectedSeverity.value;
    if (selectedStatus.value) params.status = selectedStatus.value;
    if (selectedProject.value) params.project = selectedProject.value;
    if (selectedAuthor.value) params.author = selectedAuthor.value;
    if (selectedRule.value) params.rule = selectedRule.value;
    if (selectedType.value) params.type = selectedType.value;
    const response = await get<Pagination<Sonars[]>>('/sonars', { params });
    sonars.value = response.data.data;
    total.value = response.data.meta.total;
    lastPage.value = response.data.meta.lastPage;
  } catch (err: any) {
    error.value = err.message || 'Error al cargar los issues de Sonar';
  } finally {
    loading.value = false;
  }
};

const severityClass = (severity: string) => {
  switch (severity) {
    case 'BLOCKER': return 'text-red-700 font-bold';
    case 'CRITICAL': return 'text-red-500 font-bold';
    case 'MAJOR': return 'text-orange-500';
    case 'MINOR': return 'text-yellow-600';
    case 'INFO': return 'text-gray-500';
    default: return '';
  }
};

const goToPage = (page: number) => {
  currentPage.value = page;
  fetchSonars();
};
const onSearch = () => {
  currentPage.value = 1;
  fetchSonars();
};

const importingSonars = ref(false);
const importMessage = ref('');

const fetchAllSonars = async () => {
  importingSonars.value = true;
  importMessage.value = 'Importando issues de Sonar...';
  try {
    await get('/sonars/import');
    importMessage.value = 'Importación finalizada';
    setTimeout(() => { importingSonars.value = false; importMessage.value = ''; }, 1500);
  } catch (err: any) {
    importMessage.value = 'Error al importar los issues de Sonar';
    setTimeout(() => { importingSonars.value = false; importMessage.value = ''; }, 2000);
  }
};

onMounted(() => {
  fetchSonarsFilters();
  fetchSonars();
});
</script>

<style scoped>
.loader {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
