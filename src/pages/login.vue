<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Iniciar Sesión
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          ¿No tienes una cuenta?
          <router-link to="/register" class="font-medium text-indigo-600 hover:text-indigo-500">
            Regístrate aquí
          </router-link>
        </p>
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="space-y-4">
          <DuiInput
            id="email"
            v-model="form.email"
            name="email"
            type="email"
            required
            placeholder="Email"
            block
          />
          <DuiInput
            id="password"
            v-model="form.password"
            name="password"
            type="password"
            required
            placeholder="Contraseña"
            block
          />
        </div>

        <div v-if="error" class="text-red-600 text-sm text-center">
          {{ error }}
        </div>

        <div>
          <DuiButton
            type="submit"
            :disabled="loading"
            color="primary"
            block
          >
            {{ loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
          </DuiButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { DuiInput, DuiButton } from '@dronico/droni-kit'
import axios from 'axios'

const apiURL = import.meta.env.VITE_API_URL;
const router = useRouter()
const { login } = useAuth()

const form = ref({
  email: '',
  password: ''
})

const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''

  try {
    // Aquí harías la llamada a tu API de autenticación
    const response = await axios.post(apiURL + '/auth/login', form.value)
    
    // Estructura esperada de la respuesta:
    // { user: { id, email, name, role }, token: string }
    const { user, token } = response.data

    // Usar el middleware para guardar los datos
    login(user, token)

    // Redirigir al dashboard o página principal
    router.push('/')
    
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al iniciar sesión'
  } finally {
    loading.value = false
  }
}
</script>