<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Crear Nueva Cuenta
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          ¿Ya tienes una cuenta?
          <router-link to="/login" class="font-medium text-indigo-600 hover:text-indigo-500">
            Inicia sesión aquí
          </router-link>
        </p>
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <div class="rounded-md shadow-sm space-y-4">
          <div>
            <input
              id="name"
              v-model="form.name"
              name="name"
              type="text"
              required
              class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Nombre completo"
            />
          </div>
          <div>
            <input
              id="email"
              v-model="form.email"
              name="email"
              type="email"
              required
              class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Email"
            />
          </div>
          <div>
            <input
              id="password"
              v-model="form.password"
              name="password"
              type="password"
              required
              minlength="6"
              class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Contraseña (mínimo 6 caracteres)"
            />
          </div>
          <div>
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              name="confirmPassword"
              type="password"
              required
              class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Confirmar contraseña"
            />
          </div>
        </div>

        <div v-if="error" class="text-red-600 text-sm text-center">
          {{ error }}
        </div>

        <div v-if="success" class="text-green-600 text-sm text-center">
          {{ success }}
        </div>

        <div class="flex items-center">
          <input
            id="terms"
            v-model="form.acceptTerms"
            name="terms"
            type="checkbox"
            required
            class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label for="terms" class="ml-2 block text-sm text-gray-900">
            Acepto los
            <a href="#" class="text-indigo-600 hover:text-indigo-500">términos y condiciones</a>
            y la
            <a href="#" class="text-indigo-600 hover:text-indigo-500">política de privacidad</a>
          </label>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading || !isFormValid"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Creando cuenta...' : 'Crear Cuenta' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import axios from 'axios'

const apiURL = import.meta.env.VITE_API_URL;
const router = useRouter()
const { login } = useAuth()

const form = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false
})

const loading = ref(false)
const error = ref('')
const success = ref('')

// Validaciones
const isFormValid = computed(() => {
  return form.value.name && 
         form.value.email && 
         form.value.password && 
         form.value.confirmPassword &&
         form.value.password === form.value.confirmPassword &&
         form.value.password.length >= 6 &&
         form.value.acceptTerms
})

const validateForm = () => {
  if (!form.value.name) {
    error.value = 'El nombre es requerido'
    return false
  }
  
  if (!form.value.email) {
    error.value = 'El email es requerido'
    return false
  }
  
  if (!form.value.password) {
    error.value = 'La contraseña es requerida'
    return false
  }
  
  if (form.value.password.length < 6) {
    error.value = 'La contraseña debe tener al menos 6 caracteres'
    return false
  }
  
  if (form.value.password !== form.value.confirmPassword) {
    error.value = 'Las contraseñas no coinciden'
    return false
  }
  
  if (!form.value.acceptTerms) {
    error.value = 'Debes aceptar los términos y condiciones'
    return false
  }
  
  return true
}

const handleRegister = async () => {
  loading.value = true
  error.value = ''
  success.value = ''

  if (!validateForm()) {
    loading.value = false
    return
  }

  try {
    // Preparar datos para el registro
    const registerData = {
      name: form.value.name,
      email: form.value.email,
      password: form.value.password
    }

    // Llamada a la API de registro
    const response = await axios.post(apiURL + '/auth/register', registerData)
    
    // Estructura esperada de la respuesta:
    // { user: { id, email, name, role }, token: string, expiresIn?: number, message?: string }
    const { user, token, expiresIn, message } = response.data

    // Mostrar mensaje de éxito si existe
    if (message) {
      success.value = message
    }

    // Si el registro incluye login automático (token presente)
    if (token && user) {
      // Usar el middleware para guardar los datos
      login(user, token, expiresIn)
      
      // Esperar un momento para mostrar el mensaje de éxito
      setTimeout(() => {
        router.push('/')
      }, 1500)
    } else {
      // Si no hay login automático, redirigir al login después de un momento
      success.value = 'Cuenta creada exitosamente. Redirigiendo al login...'
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    }
    
  } catch (err: any) {
    if (err.response?.status === 409) {
      error.value = 'Ya existe una cuenta con este email'
    } else {
      error.value = err.response?.data?.message || 'Error al crear la cuenta'
    }
  } finally {
    loading.value = false
  }
}
</script>
