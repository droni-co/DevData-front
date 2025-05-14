<template>
  <h1>Copilot</h1>
  {{ metrics }}
</template>
<script setup lang="ts">
import { ref, type Ref } from 'vue';
import axios from 'axios';
import type { Metric } from '../types/copilot';

const metrics:Ref<Metric[]> = ref([]);

const fetchMetrics = async () => {
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
  } catch (error) {
    console.error('Error fetching secrets:', error);
  }
};
fetchMetrics();

</script>