<template>
  <div class="p-4">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-3xl font-bold">Secrets</h1>
      <DuiButton @click="batchScrap" size="sm" color="primary">
        <i class="mdi mdi-update"> </i>
        Traer valores
      </DuiButton>
    </div>
    <table class="min-w-full border border-gray-200 divide-y divide-gray-200">
      <thead class="bg-gray-100">
        <tr>
          <th class="px-4 py-2 text-left font-semibold text-gray-700 border-r border-gray-200">Name</th>
          <th
            v-for="key in keyvaults"
            :key="key"
            class="px-4 py-2 text-left font-semibold text-gray-700 border-r border-gray-200"
          >
            {{ key }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="name in names"
          :key="name"
          class="hover:bg-gray-50 even:bg-gray-50"
        >
          <td class="px-4 py-2 border-t border-r border-gray-200 text-sm text-gray-800">{{ name }}</td>
          <td
            v-for="key in keyvaults"
            :key="key"
            class="px-4 py-2 border-t border-r border-gray-200 text-sm text-gray-700"
          >
          <span v-if="typeof tableData[name]?.[key] !== 'undefined'" class="flex items-center w-full">
            <input
              :value="tableData[name][key] ?? ''"
              class="grow p-2"
              readonly />
            <DuiButton size="sm" @click="getSecret(name, key)">
              <i class="mdi mdi-update"> </i>
            </DuiButton>
          </span>
          <span v-else class="text-rose-400">
            No existe
          </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';
import { DuiButton } from '@dronico/droni-kit';
import axios from 'axios';

const secrets = ref([]);

const fetchSecrets = async () => {
  try {
    const response = await axios.get('http://localhost:3333/secrets');
    secrets.value = response.data;
  } catch (error) {
    console.error('Error fetching secrets:', error);
  }
};

fetchSecrets();

// Columnas únicas (keyvaults)
const keyvaults = computed(() => {
  return [...new Set(secrets.value.map(item => item.keyvault))]
})

// Filas únicas (names)
const names = computed(() => {
  return [...new Set(secrets.value.map(item => item.name))]
})

// Mapeo estructurado { name: { keyvault: value } }
const tableData = computed(() => {
  const data = {}
  secrets.value.forEach(item => {
    if (!data[item.name]) data[item.name] = {}
    data[item.name][item.keyvault] = item.value
  })
  return data
})

const getSecret = async (name: string, keyvault: string) => {
  const secret = secrets.value.find(item => item.name === name && item.keyvault === keyvault);
  const detailSecret = await axios.get(`http://localhost:3333/secrets/import/${secret.id}`);  
  secret.value = detailSecret.data.value;
}

const batchScrap = async () => {
  for (let i = 0; i < secrets.value.length; i++) {
    if(secrets.value[i].value) {
      continue;
    } else {
      await getSecret(secrets.value[i].name, secrets.value[i].keyvault);
      await new Promise(resolve => setTimeout(resolve, 2000)); // espera 2 segundos
    }
  }
  console.log('Scrap finalizado');
}

</script>