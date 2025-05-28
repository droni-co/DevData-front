import { ref, computed } from 'vue'
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import type { Token } from '../types'

// Interfaces para tipado
export interface User {
  id: string | number
  email: string
  name: string
  role?: string
  [key: string]: any
}

export interface AuthData {
  user: User
  token: Token
  expiresAt?: number
}

// Constantes para las keys de sessionStorage
const AUTH_DATA_KEY = 'auth_data'
const USER_KEY = 'auth_user'
const TOKEN_KEY = 'auth_token'

// Estados reactivos globales
const authState = ref<AuthData | null>(null)
const isInitialized = ref(false)

// Función para inicializar el estado desde sessionStorage
const initializeAuthState = () => {
  if (isInitialized.value) return
  
  try {
    const authData = sessionStorage.getItem(AUTH_DATA_KEY)
    if (authData) {
      const parsed: AuthData = JSON.parse(authData)
      
      // Verificar si el token ha expirado
      if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
        sessionStorage.removeItem(AUTH_DATA_KEY)
        sessionStorage.removeItem(USER_KEY)
        sessionStorage.removeItem(TOKEN_KEY)
        authState.value = null
      } else {
        authState.value = parsed
      }
    }
  } catch (error) {
    console.error('Error initializing auth state:', error)
    authState.value = null
  }
  
  isInitialized.value = true
}

// Computeds reactivos exportados
export const isAuthenticated = computed(() => {
  initializeAuthState()
  return !!(authState.value?.user && authState.value?.token)
})

export const currentUser = computed(() => {
  initializeAuthState()
  return authState.value?.user || null
})

export const currentToken = computed(() => {
  initializeAuthState()
  return authState.value?.token || null
})

// Funciones para manejar la autenticación
export const setAuthData = (user: User, token: Token): void => {
  const authData: AuthData = {
    user,
    token
  }

  // Guardar en sessionStorage
  sessionStorage.setItem(AUTH_DATA_KEY, JSON.stringify(authData))
  sessionStorage.setItem(USER_KEY, JSON.stringify(user))
  sessionStorage.setItem(TOKEN_KEY, JSON.stringify(token))
  
  // Actualizar estado reactivo
  authState.value = authData
}

export const clearAuth = (): void => {
  sessionStorage.removeItem(AUTH_DATA_KEY)
  sessionStorage.removeItem(USER_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
  authState.value = null
}

export const updateUser = (user: User): void => {
  if (authState.value) {
    const newAuthData: AuthData = {
      ...authState.value,
      user
    }
    
    sessionStorage.setItem(AUTH_DATA_KEY, JSON.stringify(newAuthData))
    sessionStorage.setItem(USER_KEY, JSON.stringify(user))
    authState.value = newAuthData
  }
}

// Funciones auxiliares para compatibilidad
export const getUser = (): User | null => {
  initializeAuthState()
  return currentUser.value
}

export const getToken = (): Token | null => {
  initializeAuthState()
  return currentToken.value
}

export const getAuthData = (): AuthData | null => {
  initializeAuthState()
  return authState.value
}

// Clase para manejar la autenticación (mantener compatibilidad)
export class AuthManager {
  static readonly AUTH_DATA_KEY = AUTH_DATA_KEY
  static readonly USER_KEY = USER_KEY
  static readonly TOKEN_KEY = TOKEN_KEY

  // Guardar datos de autenticación
  static setAuthData(user: User, token: Token): void {
    setAuthData(user, token)
  }

  // Obtener usuario
  static getUser(): User | null {
    return getUser()
  }

  // Obtener token
  static getToken(): Token | null {
    return getToken()
  }

  // Obtener datos completos de autenticación
  static getAuthData(): AuthData | null {
    return getAuthData()
  }

  // Verificar si el usuario está autenticado
  static isAuthenticated(): boolean {
    return isAuthenticated.value
  }

  // Limpiar datos de autenticación
  static clearAuth(): void {
    clearAuth()
  }

  // Actualizar solo el usuario (útil para updates de perfil)
  static updateUser(user: User): void {
    updateUser(user)
  }
}

// Middleware guard para rutas protegidas
export const authGuard = (
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
): void => {
  const authenticated = isAuthenticated.value

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ['/login', '/register', '/forgot-password']

  // Verificar si la ruta actual es pública
  const isPublicRoute = publicRoutes.some(route => 
    to.path === route || to.path.startsWith(route + '/')
  )

  if (authenticated) {
    // Si está autenticado y trata de acceder a login, redirigir al dashboard
    if (publicRoutes.includes(to.path)) {
      next('/') // redirigir a home como página principal
    } else {
      next()
    }
  } else {
    // Si no está autenticado y trata de acceder a ruta protegida
    if (!isPublicRoute && to.path !== '/') {
      next('/login')
    } else if (to.path === '/') {
      // Si accede a la raíz sin autenticación, ir al login
      next('/login')
    } else {
      next()
    }
  }
}

// Helper para usar en componentes Vue - Versión reactiva
export const useAuth = () => {
  return {
    user: currentUser,
    token: currentToken,
    authData: computed(() => authState.value),
    isAuthenticated: isAuthenticated,
    login: setAuthData,
    logout: clearAuth,
    updateUser: updateUser
  }
}

// Función para configurar interceptors de Axios (opcional)
export const setupAuthInterceptors = (axiosInstance: any) => {
  // Request interceptor para agregar token automáticamente
  axiosInstance.interceptors.request.use(
    (config: any) => {
      const token = getToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error: any) => Promise.reject(error)
  )

  // Response interceptor para manejar tokens expirados
  axiosInstance.interceptors.response.use(
    (response: any) => response,
    (error: any) => {
      if (error.response?.status === 401) {
        clearAuth()
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }
  )
}