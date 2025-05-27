<template>
  <div class="dashboard">
    <!-- Header con información de usuario y logout -->
    <div class="auth-header">
      <div class="user-info">
        <span>Bienvenido, {{ user?.name || user?.email }}</span>
      </div>
      <button @click="handleLogout" class="logout-btn">
        Cerrar Sesión
      </button>
    </div>
    
    <div class="dashboard-header">
      <h1>Dashboard Copilot Analytics</h1>
      <div class="date-info">
        <span>Datos de los últimos 28 días</span>
      </div>
    </div>

    <div class="loading-container" v-if="loading">
      <div class="loading-spinner"></div>
      <p>Cargando métricas de Copilot...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <p>Error al cargar los datos: {{ error }}</p>
      <button @click="fetchMetrics">Reintentar</button>
    </div>

    <div v-else-if="metrics.length === 0" class="empty-state">
      <p>No hay datos disponibles</p>
    </div>

    <div v-else class="dashboard-content">
      <!-- KPI Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricsCard 
          title="Total Usuarios Activos" 
          :value="totalActiveUsers" 
          :trend="activeUsersTrend" 
        />
        <MetricsCard 
          title="Total Usuarios Comprometidos" 
          :value="totalEngagedUsers" 
          :trend="engagedUsersTrend"
        />
        <MetricsCard 
          title="Tasa de Aceptación Global" 
          :value="globalAcceptanceRate" 
          :trend="acceptanceRateTrend" 
        />
        <MetricsCard 
          title="Total Interacciones Chat" 
          :value="totalChatInteractions" 
          :trend="chatInteractionsTrend" 
        />
      </div>


      <!-- Charts - First Row -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        <UsageTrendChart :metrics="metrics" />
        <ActiveUsersChart :metrics="metrics" />
      </div>
      
      <!-- Charts - Second Row -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        <EditorUsageChart :metrics="metrics" />
        <ChatEventsChart :metrics="metrics" />
      </div>
      
      <!-- Charts - Third Row -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        <LanguageUsageChart :metrics="metrics" />
        <AcceptanceRateChart :metrics="metrics" />
      </div>

      <!-- Summary Table -->
      <div class="summary-section">
        <SummaryTable 
          title="Resumen por Lenguaje" 
          :headers="['Lenguaje', 'Usuarios', 'Sugerencias', 'Aceptaciones', 'Tasa de Aceptación']" 
          :data="languageSummary" 
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, type Ref } from 'vue';
import axios from 'axios';
import type { Metric } from '../types/copilot';
import { useAuth } from '../composables/useAuth';

// Importar componentes
import MetricsCard from '../components/MetricsCard.vue';
import ActiveUsersChart from '../components/charts/ActiveUsersChart.vue';
import EditorUsageChart from '../components/charts/EditorUsageChart.vue';
import LanguageUsageChart from '../components/charts/LanguageUsageChart.vue';
import AcceptanceRateChart from '../components/charts/AcceptanceRateChart.vue';
import UsageTrendChart from '../components/charts/UsageTrendChart.vue';
import ChatEventsChart from '../components/charts/ChatEventsChart.vue';
import SummaryTable from '../components/SummaryTable.vue';

// Autenticación
const { user, logout } = useAuth();

// Función para manejar logout
const handleLogout = () => {
  logout();
};

// Estado
const metrics: Ref<Metric[]> = ref([]);
const loading = ref(true);
const error = ref('');

// Cargar datos
const fetchMetrics = async () => {
  loading.value = true;
  error.value = '';
  
  const copilotEndpoint = import.meta.env.VITE_COPILOT_ENDPOINT;
  const copilotToken = import.meta.env.VITE_COPILOT_TOKEN;

  try {
    const response = await axios.get(copilotEndpoint, {
      headers: {
        'Authorization': `Bearer ${copilotToken}`,
        'Content-Type': 'application/json',
      },
    });
    metrics.value = response.data;
  } catch (err: any) {
    console.error('Error fetching metrics:', err);
    error.value = err.message || 'Error al cargar los datos';
  } finally {
    loading.value = false;
  }
};

// KPI Calculados
const totalActiveUsers = computed(() => {
  if (metrics.value.length === 0) return 0;
  return metrics.value.reduce((sum: number, metric: Metric) => sum + metric.total_active_users, 0);
});

const totalEngagedUsers = computed(() => {
  if (metrics.value.length === 0) return 0;
  return metrics.value.reduce((sum: number, metric: Metric) => sum + metric.total_engaged_users, 0);
});

// Calcular tasas de aceptación global
const globalAcceptanceRate = computed(() => {
  let totalAcceptances = 0;
  let totalSuggestions = 0;
  
  metrics.value.forEach((metric: Metric) => {
    metric.copilot_ide_code_completions.editors.forEach((editor) => {
      editor.models.forEach((model) => {
        model.languages.forEach((lang) => {
          totalAcceptances += lang.total_code_acceptances;
          totalSuggestions += lang.total_code_suggestions;
        });
      });
    });
  });
  
  if (totalSuggestions === 0) return 0;
  return Math.round((totalAcceptances / totalSuggestions) * 100);
});

// Calcular total interacciones de chat
const totalChatInteractions = computed(() => {
  let total = 0;
  
  metrics.value.forEach((metric: Metric) => {
    if (metric.copilot_ide_chat.editors) {
      metric.copilot_ide_chat.editors.forEach((editor) => {
        editor.models.forEach((model) => {
          total += model.total_chats;
        });
      });
    }
  });
  
  return total;
});

// Tendencias (simuladas para este ejemplo - en una implementación real esto sería calculado comparando periodos)
const activeUsersTrend = ref(12); // +12% respecto al periodo anterior
const engagedUsersTrend = ref(8); // +8% respecto al periodo anterior
const acceptanceRateTrend = ref(-2); // -2% respecto al periodo anterior
const chatInteractionsTrend = ref(15); // +15% respecto al periodo anterior

// Tabla resumen por lenguaje
const languageSummary = computed(() => {
  const languageData: Record<string, { users: number, acceptances: number, suggestions: number }> = {};
  
  metrics.value.forEach((metric: Metric) => {
    metric.copilot_ide_code_completions.editors.forEach((editor) => {
      editor.models.forEach((model) => {
        model.languages.forEach((lang) => {
          if (!languageData[lang.name]) {
            languageData[lang.name] = { 
              users: 0,
              acceptances: 0,
              suggestions: 0
            };
          }
          languageData[lang.name].users += lang.total_engaged_users;
          languageData[lang.name].acceptances += lang.total_code_acceptances;
          languageData[lang.name].suggestions += lang.total_code_suggestions;
        });
      });
    });
  });
  
  return Object.entries(languageData)
    .map(([name, data]) => ({
      'Lenguaje': name,
      'Usuarios': data.users,
      'Sugerencias': data.suggestions,
      'Aceptaciones': data.acceptances,
      'Tasa de Aceptación': data.suggestions > 0 
        ? `${Math.round((data.acceptances / data.suggestions) * 100)}%` 
        : '0%'
    }))
    .sort((a, b) => b.Usuarios - a.Usuarios)
    .slice(0, 10); // Top 10 por usuarios
});

// Cargar datos al montar el componente
onMounted(fetchMetrics);
</script>

<style scoped>
.dashboard {
  padding: 20px;
  max-width: 100%;
  margin: 0 auto;
}

.auth-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 20px;
  border-radius: 8px;
}

.user-info {
  color: #64748b;
  font-size: 14px;
}

.logout-btn {
  padding: 8px 16px;
  background-color: #dc2626;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.logout-btn:hover {
  background-color: #b91c1c;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.date-info span {
  padding: 6px 12px;
  background-color: #f1f5f9;
  border-radius: 4px;
  font-size: 14px;
  color: #64748b;
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.charts-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
  gap: 20px;
  break-inside: avoid;
  page-break-inside: avoid;
}

.loading-container, .error-container, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.error-container button {
  margin-top: 16px;
  padding: 8px 16px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .charts-row {
    grid-template-columns: 1fr;
  }
  
  .kpi-section {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}

@media print {
  .dashboard {
    padding: 0;
  }

  .kpi-section {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .kpi-section > * {
    flex: 1 1 200px;
  }

  .charts-row {
    display: block;
    margin-bottom: 20px;
  }
  
  .chart-container {
    max-width: 100%;
    margin-bottom: 20px;
  }
  
  .dashboard-header {
    margin-bottom: 15px;
  }
  
  h1 {
    font-size: 24px;
  }
}
</style>