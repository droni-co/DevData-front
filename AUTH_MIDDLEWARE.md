# Middleware de Autenticación

Este middleware proporciona un sistema completo de autenticación para la aplicación Vue.js con las siguientes características:

## Características

- ✅ Almacenamiento seguro en sessionStorage
- ✅ Gestión automática de tokens de expiración
- ✅ Protección de rutas automática
- ✅ Interceptors de Axios incluidos
- ✅ Composable reactivo para componentes
- ✅ Redirección automática en login/logout

## Estructura de Archivos

```
src/
├── middleware/
│   └── auth.ts              # Middleware principal
├── composables/
│   └── useAuth.ts           # Composable reactivo
├── utils/
│   └── api.ts               # Instancia de Axios configurada
└── pages/
    └── login.vue            # Página de login de ejemplo
```

## Uso Básico

### 1. Configuración en el Router

El middleware ya está configurado globalmente en `router.ts`:

```typescript
import { authGuard } from './middleware/auth'

router.beforeEach(authGuard)
```

### 2. Login de Usuario

```vue
<script setup lang="ts">
import { useAuth } from '../composables/useAuth'

const { login } = useAuth()

const handleLogin = async () => {
  try {
    const response = await axios.post('/api/auth/login', form.value)
    const { user, token, expiresIn } = response.data
    
    // Guardar datos de autenticación
    login(user, token, expiresIn)
    
    // Redirigir automáticamente
    router.push('/dashboard')
  } catch (error) {
    // Manejar error
  }
}
</script>
```

### 3. Logout de Usuario

```vue
<script setup lang="ts">
import { useAuth } from '../composables/useAuth'

const { logout } = useAuth()

const handleLogout = () => {
  logout() // Limpia datos y redirige a /login automáticamente
}
</script>
```

### 4. Verificar Estado de Autenticación

```vue
<script setup lang="ts">
import { useAuth } from '../composables/useAuth'

const { user, isAuthenticated, token } = useAuth()
</script>

<template>
  <div v-if="isAuthenticated">
    <p>Bienvenido, {{ user?.name }}!</p>
  </div>
  <div v-else>
    <p>Por favor inicia sesión</p>
  </div>
</template>
```

### 5. Usar con Axios

```typescript
import api from '../utils/api'

// El token se agrega automáticamente a las peticiones
const response = await api.get('/protected-endpoint')
```

## API del Middleware

### AuthManager (Clase estática)

```typescript
// Guardar datos de autenticación
AuthManager.setAuthData(user, token, expiresIn?)

// Obtener datos
AuthManager.getUser()
AuthManager.getToken()
AuthManager.getAuthData()

// Verificar autenticación
AuthManager.isAuthenticated()

// Limpiar datos
AuthManager.clearAuth()

// Actualizar usuario
AuthManager.updateUser(userData)

// Renovar token
AuthManager.renewToken(newToken, expiresIn?)
```

### useAuth() Composable

```typescript
const {
  // Estado reactivo
  user,
  token,
  authData,
  isAuthenticated,
  
  // Métodos
  login,
  logout,
  updateUser,
  renewToken
} = useAuth()
```

## Configuración de Rutas

### Rutas Públicas

Las siguientes rutas NO requieren autenticación:
- `/login`
- `/register`  
- `/forgot-password`

### Rutas Protegidas

Todas las demás rutas requieren autenticación. Si un usuario no autenticado trata de acceder, será redirigido a `/login`.

### Redirección Automática

- Usuario autenticado que accede a `/login` → Redirige a `/copilot`
- Usuario no autenticado que accede a `/` → Redirige a `/login`
- Usuario no autenticado que accede a ruta protegida → Redirige a `/login`

## Interceptors de Axios

### Request Interceptor
- Agrega automáticamente el token Bearer a todas las peticiones

### Response Interceptor  
- Detecta respuestas 401 (Unauthorized)
- Limpia automáticamente la sesión
- Redirige a `/login`

## Ejemplo de Estructura de Datos

### Usuario
```typescript
interface User {
  id: string | number
  email: string
  name: string
  role?: string
  [key: string]: any
}
```

### Respuesta de Login Esperada
```typescript
{
  user: {
    id: "123",
    email: "user@example.com", 
    name: "Juan Pérez",
    role: "admin"
  },
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  expiresIn: 3600 // segundos (opcional)
}
```

## Almacenamiento

Los datos se almacenan en `sessionStorage` con las siguientes claves:
- `auth_user` - Datos del usuario
- `auth_token` - Token de autenticación  
- `auth_data` - Datos completos con expiración

## Seguridad

- Los tokens expiran automáticamente
- Los datos se limpian al cerrar el navegador (sessionStorage)
- Validación automática de tokens en cada petición
- Redirección automática en caso de tokens inválidos

## Personalización

Para personalizar las rutas públicas, edita el array `publicRoutes` en `authGuard`:

```typescript
const publicRoutes = ['/login', '/register', '/forgot-password', '/custom-public-route']
```

Para cambiar la ruta de redirección después del login, edita:

```typescript
next('/tu-ruta-dashboard') // En lugar de '/copilot'
```
