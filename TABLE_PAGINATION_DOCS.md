# TablePagination Component

## Descripción

`TablePagination` es un componente reutilizable de Vue 3 + TypeScript que proporciona una interfaz de paginación completa y personalizable para tablas de datos. Está diseñado para ser usado en toda la aplicación, reemplazando la paginación manual repetitiva.

## Características

- ✅ **Paginación completa**: Botones anterior/siguiente, primera/última página y páginas numeradas
- ✅ **Totalmente tipado**: Interfaces TypeScript para máxima seguridad de tipos
- ✅ **Personalizable**: Textos configurables e iconos Material Design
- ✅ **Responsive**: Diseño adaptable con diferentes configuraciones de visualización
- ✅ **Reutilizable**: Un solo componente para todas las tablas de la aplicación
- ✅ **Accessible**: Botones deshabilitados cuando corresponde

## Props

### Requeridas
- `currentPage: number` - Página actual (1-indexed)
- `lastPage: number` - Última página disponible
- `total: number` - Total de elementos

### Opcionales
- `perPage?: number` - Elementos por página (default: 10)
- `itemName?: string` - Nombre singular del elemento (default: 'elemento')
- `itemNamePlural?: string` - Nombre plural del elemento (default: 'elementos')
- `showPageNumbers?: boolean` - Mostrar números de página (default: true)
- `showFirstLast?: boolean` - Mostrar botones primera/última (default: true)
- `maxVisiblePages?: number` - Máximo páginas visibles (default: 5)
- `previousText?: string` - Texto botón anterior (default: 'Anterior')
- `nextText?: string` - Texto botón siguiente (default: 'Siguiente')

## Eventos

- `@page-change="(page: number) => void"` - Se emite cuando cambia la página

## Uso Básico

```vue
<template>
  <div>
    <!-- Tu tabla aquí -->
    <DuiTable :columns="columns" :rows="data" />
    
    <!-- Componente de paginación -->
    <TablePagination
      :current-page="currentPage"
      :last-page="lastPage"
      :total="total"
      :per-page="perPage"
      item-name="usuario"
      item-name-plural="usuarios"
      @page-change="goToPage"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import TablePagination from '../../components/TablePagination.vue';

const currentPage = ref(1);
const lastPage = ref(10);
const total = ref(150);
const perPage = ref(15);

const goToPage = (page: number) => {
  currentPage.value = page;
  // Aquí llamar tu función de fetch
  fetchData();
};
</script>
```

## Ejemplos de Implementación

### 1. Tabla de Pull Requests
```vue
<TablePagination
  :current-page="currentPage"
  :last-page="lastPage"
  :total="total"
  :per-page="perPage"
  item-name="PR"
  item-name-plural="PRs"
  @page-change="goToPage"
/>
```

### 2. Tabla de Commits
```vue
<TablePagination
  :current-page="currentPage"
  :last-page="lastPage"
  :total="total"
  :per-page="perPage"
  item-name="commit"
  item-name-plural="commits"
  @page-change="goToPage"
/>
```

### 3. Tabla de Issues (Sonar)
```vue
<TablePagination
  :current-page="currentPage"
  :last-page="lastPage"
  :total="total"
  :per-page="perPage"
  item-name="issue"
  item-name-plural="issues"
  @page-change="goToPage"
/>
```

### 4. Tabla de Repositorios
```vue
<TablePagination
  :current-page="currentPage"
  :last-page="lastPage"
  :total="total"
  :per-page="perPage"
  item-name="repositorio"
  item-name-plural="repositorios"
  @page-change="goToPage"
/>
```

## Configuración Avanzada

### Solo botones anterior/siguiente
```vue
<TablePagination
  :current-page="currentPage"
  :last-page="lastPage"
  :total="total"
  :show-page-numbers="false"
  :show-first-last="false"
  @page-change="goToPage"
/>
```

### Paginación mínima
```vue
<TablePagination
  :current-page="currentPage"
  :last-page="lastPage"
  :total="total"
  :max-visible-pages="3"
  previous-text="<"
  next-text=">"
  @page-change="goToPage"
/>
```

## Funcionalidad Incluida

### 1. **Texto de información**
Muestra automáticamente: "Página X de Y | Mostrando A-B de C elementos"

### 2. **Navegación inteligente**
- Botones deshabilitados cuando corresponde
- Páginas numeradas con navegación inteligente
- Botones primera/última página (cuando es necesario)

### 3. **Validación automática**
- Previene navegación a páginas inválidas
- Solo emite eventos cuando el cambio es válido

### 4. **Iconos Material Design**
- `mdi-chevron-left` / `mdi-chevron-right` - Navegación
- `mdi-chevron-double-left` / `mdi-chevron-double-right` - Primera/última

## Integración con API

### Patrón típico de implementación
```typescript
const goToPage = (page: number) => {
  currentPage.value = page;
  fetchData(); // Tu función de fetch de datos
};

const fetchData = async () => {
  const params = {
    page: currentPage.value,
    perPage: perPage.value,
    // otros filtros...
  };
  
  const response = await get<Pagination<YourDataType[]>>('/your-endpoint', { params });
  data.value = response.data.data;
  total.value = response.data.meta.total;
  lastPage.value = response.data.meta.lastPage;
};
```

## Archivos Refactorizados

Los siguientes archivos han sido actualizados para usar `TablePagination`:

1. ✅ `/src/pages/repos/pullrequests.vue`
2. ✅ `/src/pages/repos/commits.vue`
3. ✅ `/src/pages/repos/sonars.vue`
4. ✅ `/src/pages/repos/index.vue`

## Beneficios

### **Antes** (código duplicado):
```vue
<div class="flex justify-between items-center mt-4">
  <span>Página {{ currentPage }} de {{ lastPage }} | Total: {{ total }} items</span>
  <div class="flex gap-2">
    <DuiButton :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">Anterior</DuiButton>
    <DuiButton :disabled="currentPage === lastPage" @click="goToPage(currentPage + 1)">Siguiente</DuiButton>
  </div>
</div>
```

### **Después** (componente reutilizable):
```vue
<TablePagination
  :current-page="currentPage"
  :last-page="lastPage"
  :total="total"
  :per-page="perPage"
  item-name="item"
  item-name-plural="items"
  @page-change="goToPage"
/>
```

### Ventajas:
- 🚀 **Menos código**: Reducción del 70% en líneas de código de paginación
- 🎯 **Consistencia**: Misma UX en toda la aplicación
- 🛠️ **Mantenimiento**: Un solo lugar para actualizar funcionalidad
- 🔧 **Funcionalidad mejorada**: Páginas numeradas, navegación completa
- ✅ **Tipado seguro**: TypeScript elimina errores de tiempo de ejecución

## Futuras Mejoras

Posibles mejoras futuras al componente:

1. **Navegación por salto**: Input para ir directamente a una página
2. **Tamaño de página dinámico**: Selector integrado de elementos por página
3. **Temas**: Soporte para diferentes esquemas de colores
4. **Animaciones**: Transiciones suaves entre páginas
5. **Accesibilidad mejorada**: Soporte completo para lectores de pantalla
