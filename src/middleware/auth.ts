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

// Clase para manejar la autenticación
export class AuthManager {
  private static readonly USER_KEY = 'auth_user'
  private static readonly TOKEN_KEY = 'auth_token'
  private static readonly AUTH_DATA_KEY = 'auth_data'

  // Guardar datos de autenticación
  static setAuthData(user: User, token: Token, expiresIn?: number): void {
    const authData: AuthData = {
      user,
      token,
      expiresAt: expiresIn ? Date.now() + (expiresIn * 1000) : undefined
    }

    sessionStorage.setItem(this.AUTH_DATA_KEY, JSON.stringify(authData))
    sessionStorage.setItem(this.USER_KEY, JSON.stringify(user))
    sessionStorage.setItem(this.TOKEN_KEY, JSON.stringify(token))
  }

  // Obtener usuario
  static getUser(): User | null {
    try {
      const userData = sessionStorage.getItem(this.USER_KEY)
      return userData ? JSON.parse(userData) : null
    } catch (error) {
      console.error('Error parsing user data:', error)
      return null
    }
  }

  // Obtener token
  static getToken(): Token | null {
    const tokenData = sessionStorage.getItem(this.TOKEN_KEY) ?? null
    return tokenData ? JSON.parse(tokenData) : null
  }

  // Obtener datos completos de autenticación
  static getAuthData(): AuthData | null {
    try {
      const authData = sessionStorage.getItem(this.AUTH_DATA_KEY)
      if (!authData) return null

      const parsed: AuthData = JSON.parse(authData)
      
      // Verificar si el token ha expirado
      if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
        this.clearAuth()
        return null
      }

      return parsed
    } catch (error) {
      console.error('Error parsing auth data:', error)
      return null
    }
  }

  // Verificar si el usuario está autenticado
  static isAuthenticated(): boolean {
    const token = this.getToken()
    const user = this.getUser()
    const authData = this.getAuthData()
    
    return !!(token && user && authData)
  }

  // Limpiar datos de autenticación
  static clearAuth(): void {
    sessionStorage.removeItem(this.AUTH_DATA_KEY)
    sessionStorage.removeItem(this.USER_KEY)
    sessionStorage.removeItem(this.TOKEN_KEY)
  }

  // Actualizar solo el usuario (útil para updates de perfil)
  static updateUser(user: User): void {
    const currentAuthData = this.getAuthData()
    if (currentAuthData) {
      this.setAuthData(user, currentAuthData.token, currentAuthData.expiresAt)
    }
  }
}

// Middleware guard para rutas protegidas
export const authGuard = (
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
): void => {
  const isAuthenticated = AuthManager.isAuthenticated()

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ['/login', '/register', '/forgot-password']

  // Verificar si la ruta actual es pública
  const isPublicRoute = publicRoutes.some(route => 
    to.path === route || to.path.startsWith(route + '/')
  )

  if (isAuthenticated) {
    // Si está autenticado y trata de acceder a login, redirigir al dashboard
    if (publicRoutes.includes(to.path)) {
      next('/') // redirigir a copilot como página principal
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

// Helper para usar en componentes Vue
export const useAuth = () => {
  return {
    user: AuthManager.getUser(),
    token: AuthManager.getToken(),
    authData: AuthManager.getAuthData(),
    isAuthenticated: AuthManager.isAuthenticated(),
    login: AuthManager.setAuthData,
    logout: AuthManager.clearAuth,
    updateUser: AuthManager.updateUser
  }
}

// Función para configurar interceptors de Axios (opcional)
export const setupAuthInterceptors = (axiosInstance: any) => {
  // Request interceptor para agregar token automáticamente
  axiosInstance.interceptors.request.use(
    (config: any) => {
      const token = AuthManager.getToken()
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
        AuthManager.clearAuth()
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }
  )
}