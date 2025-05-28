import { 
  useAuth as useAuthMiddleware,
  setAuthData,
  clearAuth,
  updateUser as updateUserData,
  type User
} from '../middleware/auth'
import type { Token } from '../types'

export function useAuth() {
  // Usar el useAuth reactivo del middleware
  const authComposable = useAuthMiddleware()
  const login = (userData: User, userToken: Token) => {
    setAuthData(userData, userToken)
  }

  const logout = () => {
    clearAuth()
    // Redirigir al login después del logout
    window.location.href = '/login'
  }

  const updateUser = (userData: User) => {
    updateUserData(userData)
  }
  
  return {
    // Estado reactivo del middleware
    user: authComposable.user,
    token: authComposable.token,
    authData: authComposable.authData,
    isAuthenticated: authComposable.isAuthenticated,
    
    // Métodos
    login,
    logout,
    updateUser
  }
}
