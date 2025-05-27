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
        <div class="space-y-4">
          <DuiInput
            id="name"
            v-model="form.name"
            name="name"
            type="text"
            required
            placeholder="Nombre completo"
            block
          />
          
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
            minlength="6"
            placeholder="Contraseña (mínimo 6 caracteres)"
            block
          />
          
          <DuiInput
            id="confirmPassword"
            v-model="form.confirmPassword"
            name="confirmPassword"
            type="password"
            required
            placeholder="Confirmar contraseña"
            block
          />
          
          <DuiInput
            id="orgId"
            v-model="form.orgId"
            name="orgId"
            type="text"
            required
            placeholder="ID de la organización"
            block
          />
          
          <DuiInput
            id="orgSecret"
            v-model="form.orgSecret"
            name="orgSecret"
            type="password"
            required
            placeholder="Secreto de la organización"
            block
          />
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
          <DuiButton
            type="submit"
            :disabled="loading || !isFormValid"
            color="primary"
            block
          >
            {{ loading ? 'Creando cuenta...' : 'Crear Cuenta' }}
          </DuiButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { DuiInput, DuiButton } from '@dronico/droni-kit'
import axios from 'axios'

const apiURL = import.meta.env.VITE_API_URL;
const router = useRouter()
const { login } = useAuth()

const form = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  orgId: '',
  orgSecret: '',
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
         form.value.orgId &&
         form.value.orgSecret &&
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
  
  if (!form.value.orgId) {
    error.value = 'El ID de la organización es requerido'
    return false
  }
  
  if (!form.value.orgSecret) {
    error.value = 'El secreto de la organización es requerido'
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
      password: form.value.password,
      password_confirmation: form.value.confirmPassword,
      orgId: form.value.orgId,
      orgSecret: form.value.orgSecret
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
