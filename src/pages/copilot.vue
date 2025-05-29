<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Copilot Metrics</h1>
    <div class="flex">
      <DuiInput
        v-model="filters.fromDate"
        type="date"
        class="mr-2"
        placeholder="From Date" />
      <DuiInput
        v-model="filters.toDate"
        type="date"
        class="mr-2"
        placeholder="To Date" />
      <DuiButton 
        color="primary"
        @click="getMetrics()">
        <i class="mdi mdi-magnify"></i>
        Search
      </DuiButton>
      
      <div class="grow"></div>
      <DuiButton
        v-if="user?.role === 'admin'"
        color="secondary"
        @click="fetchCopilotData">
        <i class="mdi mdi-refresh"></i>
        Fetch Copilot Data
      </DuiButton>
    </div>
    <LineChart name="Tendencia de Completions de Código" :chart-data="usageCodeMetricsData" />
    <div class="flex">
      <div class="grow">
        <LineChart name="Eventos de Chat" :chart-data="usageChatEventsData" />
      </div>
      <div class="ml-4">
        <DonutChart name="Métricas de Chat" :chart-data="totalUsageChatData" />
      </div>
    </div>
    <LineChart name="Tendencia de Usuarios Activos" :chart-data="usageChatData" />
    <BarChart name="Distribución de Lenguajes" :chart-data="usageLenguageChartData" />
  </div>
</template>
<script setup lang="ts">
import type { Metric, Pagination } from '../types/copilot';
import  { get } from '../utils/api';
import { ref, onMounted, type Ref } from 'vue';
import { DuiInput, DuiButton } from '@dronico/droni-kit';
import { useAuth } from '../middleware/auth';
import { DateTime } from 'luxon';

// Importar componentes de gráficos
import LineChart from '../components/charts/LineChart.vue';
import BarChart from '../components/charts/BarChart.vue';
import type { ChartData } from 'chart.js';
import DonutChart from '../components/charts/DonutChart.vue';

const  { user } = useAuth();

const filters = ref({
  fromDate: DateTime.now().minus({ days: 30 }).toISODate(),
  toDate: DateTime.now().toISODate(),
  page: 1,
});

const metrics: Ref<Pagination<Metric[]>> = ref({
  data: [],
  meta: {
    total: 0,
    perPage: 0,
    currentPage: 0,
    lastPage: 0,
    firstPage: 0,
  }
});

const usageChatData = ref<ChartData<"line">>({
  labels: [''],
  datasets: [
    {
      label: 'Active Users',
      backgroundColor: '#f87979',
      data: [0],
      tension: 0.4,
      borderColor: '#f87979'
    },
    {
      label: 'Engaged Users',
      backgroundColor: '#42A5F5',
      data: [0],
      tension: 0.4,
      borderColor: '#42A5F5'
    }
  ]
});
const totalUsageChatData = ref<ChartData<"doughnut">>({
  labels: ['Total chats', 'Copy events', 'Insert events'],
  datasets: [
    {
      data: [100,200,300],
      backgroundColor: ['#8E44AD', '#27AE60', '#E67E22'],
    },
  ]
});

const usageLenguageChartData = ref<ChartData<"bar">>({
  labels: ['js', 'ts', 'java', 'python'],
  datasets: [
    {
      data: [100, 200, 300, 400],
      backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#AB47BC'],
    },
  ]
});
// Nuevo chart para métricas de code completions
const usageCodeMetricsData = ref<ChartData<"line">>({ labels: [], datasets: [] });
// Chat events chart data
const usageChatEventsData = ref<ChartData<"line">>({
  labels: [],
  datasets: []
});
onMounted(async () => {
  getMetrics();
});

const getMetrics = async () => {
  const response = await get<Pagination<Metric[]>>(`/copilots?page=${filters.value.page}&perPage=100&fromDate=${filters.value.fromDate}&toDate=${filters.value.toDate}`);
  metrics.value = {
    data: response.data.data.reverse(), // Invertir para mostrar los más recientes primero
    meta: response.data.meta
  }
  fillChartData();
};

const fetchCopilotData = async () => {
  try {
    const response = await get('/copilots/import');
    metrics.value = response.data;
  } catch (error) {
    console.error('Error fetching copilot data:', error);
  }
};

// computed chart data
const fillChartData = () => {
  // Active users Charts
  const dates = metrics.value.data.map(m => DateTime.fromISO(m.date).toFormat('MM/dd'));
  const activeUsers = metrics.value.data.map(m => m.totalActiveUsers);
  const engagedUsers = metrics.value.data.map(m => m.totalEngagedUsers);
  usageChatData.value.labels = dates;
  usageChatData.value.datasets[0].data = activeUsers;
  usageChatData.value.datasets[1].data = engagedUsers;

  // Totalizar valores para el gráfico de dona de usuarios
  const totalActive = activeUsers.reduce((sum, val) => sum + val, 0);
  const totalEngaged = engagedUsers.reduce((sum, val) => sum + val, 0);
  totalUsageChatData.value = {
    labels: ['Active Users', 'Engaged Users'],
    datasets: [
      {
        data: [totalActive, totalEngaged],
        backgroundColor: ['#f87979', '#42A5F5'],
      }
    ]
  };

  // Chat events Charts
  const totalChats = metrics.value.data.map(m => {
    let sum = 0;
    (m.copilotIdeChat?.editors ?? []).forEach(editor => {
      editor.models.forEach(model => {
        sum += model.total_chats;
      });
    });
    return sum;
  });
  const copyEvents = metrics.value.data.map(m => {
    let sum = 0;
    (m.copilotIdeChat?.editors ?? []).forEach(editor => {
      editor.models.forEach(model => {
        sum += model.total_chat_copy_events;
      });
    });
    return sum;
  });
  const insertionEvents = metrics.value.data.map(m => {
    let sum = 0;
    (m.copilotIdeChat?.editors ?? []).forEach(editor => {
      editor.models.forEach(model => {
        sum += model.total_chat_insertion_events;
      });
    });
    return sum;
  });

  // Totalizar eventos de chat para gráfico de dona
  const totalChatsSum = totalChats.reduce((sum, val) => sum + val, 0);
  const copyEventsSum = copyEvents.reduce((sum, val) => sum + val, 0);
  const insertionEventsSum = insertionEvents.reduce((sum, val) => sum + val, 0);
  totalUsageChatData.value = {
    labels: ['Total Chats', 'Copy Events', 'Insert Events'],
    datasets: [
      {
        data: [totalChatsSum, copyEventsSum, insertionEventsSum],
        backgroundColor: ['#8E44AD', '#27AE60', '#E67E22'],
      }
    ]
  };

  usageChatEventsData.value = {
    labels: dates,
    datasets: [
      { label: 'Total Chats', data: totalChats, borderColor: '#8E44AD', backgroundColor: '#8E44AD', tension: 0.4 },
      { label: 'Eventos Copiar', data: copyEvents, borderColor: '#27AE60', backgroundColor: '#27AE60', tension: 0.4 },
      { label: 'Eventos Inserción', data: insertionEvents, borderColor: '#E67E22', backgroundColor: '#E67E22', tension: 0.4 }
    ]
  };

  // usageLenguageChartData: agrupar totalEngagedUsers por lenguaje
  const countsByLang: Record<string, number> = {};
  metrics.value.data.forEach((m: Metric) => {
    m.copilotIdeCodeCompletions.languages.forEach((lang) => {
      countsByLang[lang.name] = (countsByLang[lang.name] || 0) + lang.total_engaged_users;
    });
  });
  const labels = Object.keys(countsByLang);
  const data = labels.map(label => countsByLang[label]);
  const backgroundColor = labels.map(() => getRandomColor());
  usageLenguageChartData.value = {
    labels,
    datasets: [
      { data, backgroundColor }
    ]
  };

  // usageCodeMetricsData: totales de completions por día desde editors -> models -> languages
  const codeAcceptances = metrics.value.data.map(m => {
    let total = 0;
    m.copilotIdeCodeCompletions.editors.forEach(editor => {
      editor.models.forEach(model => {
        model.languages.forEach(lang => {
          total += lang.total_code_acceptances;
        });
      });
    });
    return total;
  });
  const codeSuggestions = metrics.value.data.map(m => {
    let total = 0;
    m.copilotIdeCodeCompletions.editors.forEach(editor => {
      editor.models.forEach(model => {
        model.languages.forEach(lang => {
          total += lang.total_code_suggestions;
        });
      });
    });
    return total;
  });
  const linesAccepted = metrics.value.data.map(m => {
    let total = 0;
    m.copilotIdeCodeCompletions.editors.forEach(editor => {
      editor.models.forEach(model => {
        model.languages.forEach(lang => {
          total += lang.total_code_lines_accepted;
        });
      });
    });
    return total;
  });
  const linesSuggested = metrics.value.data.map(m => {
    let total = 0;
    m.copilotIdeCodeCompletions.editors.forEach(editor => {
      editor.models.forEach(model => {
        model.languages.forEach(lang => {
          total += lang.total_code_lines_suggested;
        });
      });
    });
    return total;
  });
  usageCodeMetricsData.value = {
    labels: dates,
    datasets: [
      { label: 'Code Acceptances', data: codeAcceptances, borderColor: '#42A5F5', backgroundColor: '#42A5F5', tension: 0.4 },
      { label: 'Code Suggestions', data: codeSuggestions, borderColor: '#66BB6A', backgroundColor: '#66BB6A', tension: 0.4 },
      { label: 'Lines Accepted', data: linesAccepted, borderColor: '#FFA726', backgroundColor: '#FFA726', tension: 0.4 },
      { label: 'Lines Suggested', data: linesSuggested, borderColor: '#AB47BC', backgroundColor: '#AB47BC', tension: 0.4 },
    ]
  };
};

const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

</script>