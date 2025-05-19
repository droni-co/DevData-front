<template>
  <div class="metrics-card">
    <div class="card-title">{{ title }}</div>
    <div class="card-value">{{ formattedValue }}</div>
    <div class="card-trend" :class="{ 'positive': trend > 0, 'negative': trend < 0 }">
      <span v-if="trend !== 0">{{ trendSign }}{{ Math.abs(trend) }}% vs periodo anterior</span>
      <span v-else>Sin cambios</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  title: string;
  value: number;
  trend: number;
}>();

const formattedValue = computed(() => {
  return new Intl.NumberFormat().format(props.value);
});

const trendSign = computed(() => {
  return props.trend > 0 ? '+' : '';
});
</script>

<style scoped>
.metrics-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

@media print {
  .metrics-card {
    box-shadow: none;
    border: 1px solid #e2e8f0;
    break-inside: avoid;
    page-break-inside: avoid;
  }
}

.card-title {
  color: #64748b;
  font-size: 0.9rem;
  margin-bottom: 4px;
}

.card-value {
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.card-trend {
  font-size: 0.8rem;
}

.positive {
  color: #10b981;
}

.negative {
  color: #ef4444;
}
</style>
