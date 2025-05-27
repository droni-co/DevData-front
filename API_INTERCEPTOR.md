# API Interceptor - Guía de Uso

Este documento explica cómo usar el interceptor de API que automatiza la autenticación y manejo de errores en todas las peticiones HTTP.

## 📁 Archivo: `src/utils/api.ts`

El interceptor de API proporciona las siguientes funcionalidades:

### ✨ **Características Principales**

1. **🔐 Autenticación Automática**: Agrega automáticamente el token Bearer a todas las peticiones
2. **🚀 Logging Inteligente**: Logs detallados en modo desarrollo
3. **⚠️ Manejo de Errores**: Gestión automática de errores 401, 403, 404, 5xx
4. **🔄 Redirección Automática**: Redirige al login cuando el token expira
5. **📤 Upload de Archivos**: Soporte para multipart/form-data

### 🛠️ **Cómo Usar**

#### **Importación Básica**
```typescript
import api, { get, post, put, patch, del, upload } from '../utils/api'
```

#### **Métodos Disponibles**

##### 1. **GET Request**
```typescript
// Antes (manual)
const response = await axios.get('/repos', {
  headers: { Authorization: `Bearer ${token}` }
})

// Después (automático)
import { get } from '../utils/api'
const response = await get('/repos')
```

##### 2. **POST Request**
```typescript
// Antes (manual)
const response = await axios.post('/repos', data, {
  headers: { Authorization: `Bearer ${token}` }
})

// Después (automático)
import { post } from '../utils/api'
const response = await post('/repos', data)
```

##### 3. **PUT Request**
```typescript
import { put } from '../utils/api'
const response = await put('/repos/123', updateData)
```

##### 4. **PATCH Request**
```typescript
import { patch } from '../utils/api'
const response = await patch('/repos/123', partialData)
```

##### 5. **DELETE Request**
```typescript
import { del } from '../utils/api'
const response = await del('/repos/123')
```

##### 6. **Upload de Archivos**
```typescript
import { upload } from '../utils/api'
const formData = new FormData()
formData.append('file', file)
const response = await upload('/upload', formData)
```

### 🔧 **Configuración Avanzada**

#### **Usar la Instancia Principal**
```typescript
import api from '../utils/api'

// Con parámetros de query
const response = await api.get('/repos', { 
  params: { page: 1, limit: 10 } 
})

// Con headers adicionales
const response = await api.post('/repos', data, {
  headers: { 'Custom-Header': 'value' }
})
```

#### **Crear Instancia Personalizada**
```typescript
import { createApiInstance } from '../utils/api'

const customApi = createApiInstance('https://api.example.com', {
  timeout: 5000,
  headers: { 'Custom-Default': 'value' }
})

const response = await customApi.get('/custom-endpoint')
```

### 🎯 **Ejemplo de Refactorización**

#### **❌ Código Anterior (Manual)**
```typescript
const fetchRepos = async () => {
  try {
    const apiURL = import.meta.env.VITE_API_URL;
    const headers = {
      Authorization: `Bearer ${token?.token}`,
      'Content-Type': 'application/json',
    };
    const response = await axios.get(apiURL + '/repos', { params, headers });
    repos.value = response.data.data;
  } catch (err: any) {
    error.value = err.message || 'Error al cargar los repositorios';
  }
};
```

#### **✅ Código Nuevo (Automático)**
```typescript
import { get } from '../utils/api'

const fetchRepos = async () => {
  try {
    const response = await get('/repos', { params });
    repos.value = response.data.data;
  } catch (err: any) {
    error.value = err.message || 'Error al cargar los repositorios';
  }
};
```

### 🚨 **Manejo Automático de Errores**

El interceptor maneja automáticamente:

- **401 Unauthorized**: Limpia la sesión y redirige al login
- **403 Forbidden**: Log de acceso prohibido
- **404 Not Found**: Log de recurso no encontrado
- **5xx Server Error**: Log de error del servidor
- **Network Error**: Log de error de red/timeout

### 📊 **Logging en Desarrollo**

En modo desarrollo, el interceptor muestra logs detallados:

```
🚀 API Request: GET /repos
  headers: { Authorization: "Bearer xxx...", ... }
  params: { page: 1, limit: 10 }

✅ API Response: GET /repos
  status: 200
  data: { data: [...], meta: {...} }
```

### 🔒 **Seguridad**

- El token se obtiene automáticamente del `AuthManager`
- Verificación automática de expiración de token
- Limpieza automática de sesión en errores 401
- Headers seguros por defecto

### 🌐 **Variables de Entorno**

El interceptor usa automáticamente:
- `VITE_API_URL`: URL base de la API
- `DEV`: Modo desarrollo para logging

### 💡 **Beneficios**

1. **Menos Código**: Elimina código repetitivo de autenticación
2. **Consistencia**: Manejo uniforme de errores y autenticación
3. **Mantenibilidad**: Centralización de la lógica de API
4. **Debugging**: Logs automáticos en desarrollo
5. **Seguridad**: Manejo automático de tokens expirados

### 🚀 **Migración Gradual**

Puedes migrar gradualmente tu código existente:

1. Importa las funciones helper: `import { get, post } from '../utils/api'`
2. Reemplaza `axios.get()` por `get()`
3. Elimina headers manuales de Authorization
4. Simplifica el manejo de errores (opcional)

El interceptor es compatible con tu código existente y no requiere cambios inmediatos en toda la aplicación.
