import axios, { 
  type AxiosInstance, 
  type AxiosRequestConfig,
  type AxiosResponse, 
  type AxiosError, 
  type InternalAxiosRequestConfig 
} from 'axios'
import { AuthManager } from '../middleware/auth'

// Crear instancia de axios con configuración base
const api: AxiosInstance = axios.create({
  baseURL: (import.meta as any).env.VITE_API_URL || 'http://localhost:3333',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor de Request - Agregar token de autenticación
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Obtener el token del usuario autenticado
    const token = AuthManager.getToken()
    
    if (token?.token) {
      // Agregar el token al header Authorization
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token.token}`
    }
    
    // Log para desarrollo (opcional - remover en producción)
    if ((import.meta as any).env.DEV) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        headers: config.headers,
        params: config.params,
        data: config.data,
      })
    }
    
    return config
  },
  (error: AxiosError) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

// Interceptor de Response - Manejar respuestas y errores
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log para desarrollo (opcional - remover en producción)
    if ((import.meta as any).env.DEV) {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      })
    }
    
    return response
  },
  (error: AxiosError) => {
    // Manejar errores específicos
    if (error.response) {
      const { status, data } = error.response
      
      // Token expirado o no válido - limpiar autenticación y redirigir
      if (status === 401) {
        console.warn('🔒 Token expirado o no válido - cerrando sesión')
        AuthManager.clearAuth()
        
        // Redirigir al login solo si no estamos ya en login/register
        const currentPath = window.location.pathname
        if (currentPath !== '/login' && currentPath !== '/register') {
          window.location.href = '/login'
        }
      }
      
      // Acceso prohibido
      if (status === 403) {
        console.warn('🚫 Acceso prohibido')
      }
      
      // Recurso no encontrado
      if (status === 404) {
        console.warn('🔍 Recurso no encontrado')
      }
      
      // Error del servidor
      if (status >= 500) {
        console.error('🔥 Error del servidor')
      }
      
      // Log del error para desarrollo
      if ((import.meta as any).env.DEV) {
        console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
          status,
          message: data,
          error: error.message,
        })
      }
    } else if (error.request) {
      // Error de red o timeout
      console.error('🌐 Error de red:', error.message)
    } else {
      // Error de configuración
      console.error('⚙️ Error de configuración:', error.message)
    }
    
    return Promise.reject(error)
  }
)

// Funciones helper para diferentes tipos de peticiones

/**
 * GET request con autenticación automática
 */
export const get = <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
  return api.get<T>(url, config)
}

/**
 * POST request con autenticación automática
 */
export const post = <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
  return api.post<T>(url, data, config)
}

/**
 * PUT request con autenticación automática
 */
export const put = <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
  return api.put<T>(url, data, config)
}

/**
 * PATCH request con autenticación automática
 */
export const patch = <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
  return api.patch<T>(url, data, config)
}

/**
 * DELETE request con autenticación automática
 */
export const del = <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
  return api.delete<T>(url, config)
}

/**
 * Upload de archivos con autenticación automática
 */
export const upload = <T = any>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
  return api.post<T>(url, formData, {
    ...config,
    headers: {
      ...config?.headers,
      'Content-Type': 'multipart/form-data',
    },
  })
}

/**
 * Crear una nueva instancia de API con configuración personalizada
 */
export const createApiInstance = (baseURL: string, additionalConfig?: AxiosRequestConfig): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
    ...additionalConfig,
  })
  
  // Aplicar el interceptor de request
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = AuthManager.getToken()
      
      if (token?.token) {
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${token.token}`
      }
      
      if ((import.meta as any).env.DEV) {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
          headers: config.headers,
          params: config.params,
          data: config.data,
        })
      }
      
      return config
    },
    (error: AxiosError) => {
      console.error('❌ Request Error:', error)
      return Promise.reject(error)
    }
  )
  
  // Aplicar el interceptor de response
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      if ((import.meta as any).env.DEV) {
        console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
          status: response.status,
          data: response.data,
        })
      }
      
      return response
    },
    (error: AxiosError) => {
      if (error.response) {
        const { status, data } = error.response
        
        if (status === 401) {
          console.warn('🔒 Token expirado o no válido - cerrando sesión')
          AuthManager.clearAuth()
          
          const currentPath = window.location.pathname
          if (currentPath !== '/login' && currentPath !== '/register') {
            window.location.href = '/login'
          }
        }
        
        if (status === 403) {
          console.warn('🚫 Acceso prohibido')
        }
        
        if (status === 404) {
          console.warn('🔍 Recurso no encontrado')
        }
        
        if (status >= 500) {
          console.error('🔥 Error del servidor')
        }
        
        if ((import.meta as any).env.DEV) {
          console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
            status,
            message: data,
            error: error.message,
          })
        }
      } else if (error.request) {
        console.error('🌐 Error de red:', error.message)
      } else {
        console.error('⚙️ Error de configuración:', error.message)
      }
      
      return Promise.reject(error)
    }
  )
  
  return instance
}

// Exportar la instancia principal
export default api
