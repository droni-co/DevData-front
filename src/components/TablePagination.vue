<template>
  <div class="flex justify-between items-center mt-4">
    <span class="text-sm text-gray-600">
      {{ paginationText }}
    </span>
    <div class="flex gap-2 items-center">
      <!-- Botón Primera página -->
      <DuiButton 
        variant="ghost" 
        size="sm"
        :disabled="currentPage === 1" 
        @click="goToPage(1)"
        v-if="showFirstLast && currentPage > 2"
      >
        <i class="mdi mdi-chevron-double-left"></i>
      </DuiButton>
      
      <!-- Botón Anterior -->
      <DuiButton 
        variant="ghost" 
        size="sm"
        :disabled="currentPage === 1" 
        @click="goToPage(currentPage - 1)"
      >
        <i class="mdi mdi-chevron-left"></i>
        {{ previousText }}
      </DuiButton>
      
      <!-- Páginas numeradas -->
      <template v-if="showPageNumbers">
        <DuiButton
          v-for="page in visiblePages"
          :key="page"
          :variant="page === currentPage ? 'solid' : 'ghost'"
          :color="page === currentPage ? 'primary' : 'secondary'"
          size="sm"
          @click="goToPage(page)"
          class="min-w-[40px]"
        >
          {{ page }}
        </DuiButton>
      </template>
      
      <!-- Botón Siguiente -->
      <DuiButton 
        variant="ghost" 
        size="sm"
        :disabled="currentPage === lastPage" 
        @click="goToPage(currentPage + 1)"
      >
        {{ nextText }}
        <i class="mdi mdi-chevron-right"></i>
      </DuiButton>
      
      <!-- Botón Última página -->
      <DuiButton 
        variant="ghost" 
        size="sm"
        :disabled="currentPage === lastPage" 
        @click="goToPage(lastPage)"
        v-if="showFirstLast && currentPage < lastPage - 1"
      >
        <i class="mdi mdi-chevron-double-right"></i>
      </DuiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { DuiButton } from '@dronico/droni-kit';

interface Props {
  currentPage: number;
  lastPage: number;
  total: number;
  perPage?: number;
  itemName?: string;
  itemNamePlural?: string;
  showPageNumbers?: boolean;
  showFirstLast?: boolean;
  maxVisiblePages?: number;
  previousText?: string;
  nextText?: string;
}

interface Emits {
  (e: 'page-change', page: number): void;
}

const props = withDefaults(defineProps<Props>(), {
  perPage: 10,
  itemName: 'elemento',
  itemNamePlural: 'elementos',
  showPageNumbers: true,
  showFirstLast: true,
  maxVisiblePages: 5,
  previousText: 'Anterior',
  nextText: 'Siguiente'
});

const emit = defineEmits<Emits>();

const paginationText = computed(() => {
  const start = (props.currentPage - 1) * props.perPage + 1;
  const end = Math.min(props.currentPage * props.perPage, props.total);
  const itemText = props.total === 1 ? props.itemName : props.itemNamePlural;
  
  return `Página ${props.currentPage} de ${props.lastPage} | Mostrando ${start}-${end} de ${props.total} ${itemText}`;
});

const visiblePages = computed(() => {
  if (!props.showPageNumbers) return [];
  
  const pages: number[] = [];
  const maxPages = props.maxVisiblePages;
  const half = Math.floor(maxPages / 2);
  
  let start = Math.max(1, props.currentPage - half);
  let end = Math.min(props.lastPage, start + maxPages - 1);
  
  // Ajustar el inicio si no hay suficientes páginas al final
  if (end - start + 1 < maxPages) {
    start = Math.max(1, end - maxPages + 1);
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  
  return pages;
});

const goToPage = (page: number) => {
  if (page >= 1 && page <= props.lastPage && page !== props.currentPage) {
    emit('page-change', page);
  }
};
</script>

<style scoped>
/* Estilos adicionales si se necesitan */
</style>
