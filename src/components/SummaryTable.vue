<template>
  <div class="summary-table">
    <h3>{{ title }}</h3>
    <table>
      <thead>
        <tr>
          <th v-for="header in headers" :key="header">{{ header }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in data" :key="index">
          <td v-for="(value, key) in row" :key="key">{{ value }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  headers: string[];
  data: Record<string, any>[];
}>();
</script>

<style scoped>
.summary-table {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  overflow-x: auto;
}

@media print {
  .summary-table {
    box-shadow: none;
    border: 1px solid #e2e8f0;
    overflow-x: visible;
    page-break-inside: avoid;
    break-inside: avoid;
  }
}

h3 {
  margin-bottom: 16px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

th {
  background-color: #f8fafc;
  font-weight: 600;
}

tbody tr:hover {
  background-color: #f1f5f9;
}
</style>
