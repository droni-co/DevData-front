<template>
  <div class="container mx-auto py-8 px-4">
    <div class="max-w-4xl mx-auto">
      <!-- Header con información del usuario -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">¡Bienvenido!</h1>
            <p class="text-gray-600 mt-2">
              Hola {{ user?.name || user?.email }}, has iniciado sesión correctamente.
            </p>
          </div>
          <div class="flex space-x-4">
            <button
              @click="handleLogout"
              class="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      <!-- Información de la sesión -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Información de la Sesión</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 class="text-sm font-medium text-gray-500">Usuario</h3>
            <p class="mt-1 text-sm text-gray-900">{{ user?.name }}</p>
          </div>
          <div>
            <h3 class="text-sm font-medium text-gray-500">Email</h3>
            <p class="mt-1 text-sm text-gray-900">{{ user?.email }}</p>
          </div>
          <div>
            <h3 class="text-sm font-medium text-gray-500">ID</h3>
            <p class="mt-1 text-sm text-gray-900">{{ user?.id }}</p>
          </div>
          <div>
            <h3 class="text-sm font-medium text-gray-500">Rol</h3>
            <p class="mt-1 text-sm text-gray-900">{{ user?.role || 'No definido' }}</p>
          </div>
        </div>
      </div>

      <!-- Navegación rápida -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Navegación Rápida</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <router-link
            to="/copilot"
            class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div class="flex-shrink-0">
              <i class="mdi mdi-robot text-2xl text-blue-500"></i>
            </div>
            <div class="ml-4">
              <h3 class="text-sm font-medium text-gray-900">Copilot Analytics</h3>
              <p class="text-sm text-gray-500">Ver métricas de GitHub Copilot</p>
            </div>
          </router-link>

          <router-link
            to="/repos"
            class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div class="flex-shrink-0">
              <i class="mdi mdi-source-repository text-2xl text-green-500"></i>
            </div>
            <div class="ml-4">
              <h3 class="text-sm font-medium text-gray-900">Repositorios</h3>
              <p class="text-sm text-gray-500">Gestionar repositorios</p>
            </div>
          </router-link>

          <router-link
            to="/reports/sonar"
            class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div class="flex-shrink-0">
              <i class="mdi mdi-file-chart text-2xl text-purple-500"></i>
            </div>
            <div class="ml-4">
              <h3 class="text-sm font-medium text-gray-900">Reportes</h3>
              <p class="text-sm text-gray-500">Ver reportes de SonarQube</p>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '../composables/useAuth'

const { user, logout } = useAuth()

const handleLogout = () => {
  logout()
}
</script>