import { ref, computed } from 'vue'
import { AuthManager, type User, type AuthData } from '../middleware/auth'

// Estado reactivo global de autenticación
const user = ref<User | null>(AuthManager.getUser())
const token = ref<string | null>(AuthManager.getToken())
const authData = ref<AuthData | null>(AuthManager.getAuthData())

// Función para actualizar el estado reactivo
const updateAuthState = () => {
  user.value = AuthManager.getUser()
  token.value = AuthManager.getToken()
  authData.value = AuthManager.getAuthData()
}

export function useAuth() {
  const isAuthenticated = computed(() => AuthManager.isAuthenticated())
  
  const login = (userData: User, userToken: string, expiresIn?: number) => {
    AuthManager.setAuthData(userData, userToken, expiresIn)
    updateAuthState()
  }
  
  const logout = () => {
    AuthManager.clearAuth()
    updateAuthState()
    // Redirigir al login después del logout
    window.location.href = '/login'
  }
  
  const updateUser = (userData: User) => {
    AuthManager.updateUser(userData)
    updateAuthState()
  }
  
  const renewToken = (newToken: string, expiresIn?: number) => {
    AuthManager.renewToken(newToken, expiresIn)
    updateAuthState()
  }
  
  return {
    // Estado reactivo
    user: computed(() => user.value),
    token: computed(() => token.value),
    authData: computed(() => authData.value),
    isAuthenticated,
    
    // Métodos
    login,
    logout,
    updateUser,
    renewToken,
    
    // Métodos estáticos del AuthManager
    getUser: AuthManager.getUser,
    getToken: AuthManager.getToken,
    getAuthData: AuthManager.getAuthData,
    clearAuth: AuthManager.clearAuth
  }
}
