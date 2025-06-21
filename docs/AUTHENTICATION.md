# Sistema de Autenticación - KimunPulse

## 📋 Descripción General

KimunPulse implementa un sistema de autenticación completo usando **Supabase Auth** que se integra perfectamente con la tabla `usuarios` de la base de datos. El sistema maneja registro, login, logout y sincronización de datos del usuario.

## 🔐 Características Principales

### ✅ **Funcionalidades Implementadas**

- **Registro de usuarios** con validación completa
- **Login/Logout** seguro
- **Sincronización automática** con tabla `usuarios`
- **Gestión de sesiones** persistentes
- **Validación de formularios** en tiempo real
- **Manejo de errores** robusto
- **UI/UX moderna** y responsive
- **Protección de rutas** automática

### 🔧 **Arquitectura del Sistema**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Supabase Auth │◄──►│   useAuth Hook   │◄──►│  Tabla usuarios │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  App Components  │
                    │  - AuthContainer │
                    │  - Login         │
                    │  - Register      │
                    │  - Header        │
                    └──────────────────┘
```

## 🚀 Componentes Principales

### 1. **useAuth Hook** (`src/hooks/useAuth.ts`)

Hook principal que maneja toda la lógica de autenticación:

```typescript
const { 
  user,           // Usuario de Supabase Auth
  usuario,        // Datos completos de la tabla usuarios
  isAuthenticated,// Estado de autenticación
  isLoading,      // Estado de carga
  login,          // Función de login
  register,       // Función de registro
  logout,         // Función de logout
  error           // Errores de autenticación
} = useAuth()
```

### 2. **AuthContainer** (`src/components/AuthContainer.tsx`)

Componente contenedor que maneja el cambio entre Login y Register.

### 3. **Login** (`src/components/Login.tsx`)

Formulario de inicio de sesión con:
- Validación de email y contraseña
- Mostrar/ocultar contraseña
- Manejo de errores
- Estados de carga

### 4. **Register** (`src/components/Register.tsx`)

Formulario de registro con:
- Validación completa de campos
- Confirmación de contraseña
- Selección de cargo
- Pantalla de éxito

### 5. **Header** (`src/components/Header.tsx`)

Header de la aplicación con:
- Información del usuario
- Menú desplegable
- Opción de logout

## 📊 Integración con Base de Datos

### **Tabla `usuarios`**

El sistema se sincroniza automáticamente con la tabla `usuarios`:

```sql
CREATE TABLE usuarios (
  id UUID PRIMARY KEY,           -- Coincide con auth.users.id
  email VARCHAR NOT NULL,        -- Email del usuario
  nombre VARCHAR NOT NULL,       -- Nombre completo
  cargo VARCHAR DEFAULT 'Operador', -- Cargo/rol del usuario
  telefono VARCHAR,              -- Teléfono (opcional)
  activo BOOLEAN DEFAULT true,   -- Estado activo/inactivo
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### **Flujo de Sincronización**

1. **Registro**: Se crea usuario en `auth.users` y automáticamente en `usuarios`
2. **Login**: Se obtienen datos de ambas tablas
3. **Actualización**: Los cambios se reflejan en la tabla `usuarios`

## 🔒 Seguridad Implementada

### **Validaciones de Frontend**

- **Email**: Formato válido
- **Contraseña**: Mínimo 6 caracteres, mayúscula, minúscula y número
- **Confirmación**: Las contraseñas deben coincidir
- **Campos requeridos**: Validación en tiempo real

### **Seguridad de Backend**

- **Row Level Security (RLS)** en Supabase
- **JWT Tokens** para autenticación
- **Sesiones seguras** con renovación automática
- **Protección CSRF** nativa de Supabase

## 🎨 Experiencia de Usuario

### **Estados de la Aplicación**

1. **Cargando**: `LoadingScreen` mientras verifica autenticación
2. **No autenticado**: `AuthContainer` con Login/Register
3. **Autenticado**: Aplicación principal con `Header`

### **Flujo de Usuario**

```
┌─────────────┐    ┌──────────────┐    ┌─────────────────┐
│   Landing   │───►│ Login/Register│───►│   Dashboard     │
│   (Loading) │    │              │    │   (Authenticated)│
└─────────────┘    └──────────────┘    └─────────────────┘
                           │                      │
                           ▼                      ▼
                   ┌──────────────┐    ┌─────────────────┐
                   │   Register   │    │     Logout      │
                   │   Success    │    │   (Back to      │
                   └──────────────┘    │    Login)       │
                                       └─────────────────┘
```

## 🛠️ Configuración y Uso

### **Variables de Entorno**

El sistema usa las credenciales de Supabase configuradas en:
- `src/config/environments.ts`

### **Inicialización**

El hook `useAuth` se inicializa automáticamente en `App.tsx`:

```typescript
export default function App() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) return <LoadingScreen />
  if (!isAuthenticated) return <AuthContainer />
  
  return <MainApp />
}
```

## 📱 Responsive Design

El sistema es completamente responsive:

- **Desktop**: Formularios centrados con sidebar
- **Mobile**: Formularios optimizados para pantallas pequeñas
- **Tablet**: Adaptación automática

## 🔄 Estados y Transiciones

### **Estados del Hook useAuth**

```typescript
interface AuthState {
  user: User | null          // Usuario de Supabase Auth
  session: Session | null    // Sesión activa
  usuario: UsuarioCompleto | null // Datos de tabla usuarios
  loading: boolean           // Estado de carga
  error: string | null       // Errores
}
```

### **Transiciones Automáticas**

- **Login exitoso** → Redirección a dashboard
- **Registro exitoso** → Pantalla de éxito → Login
- **Logout** → Limpieza de estado → Login
- **Sesión expirada** → Logout automático

## 🧪 Testing y Validación

### **Casos de Prueba Cubiertos**

- ✅ Registro con datos válidos
- ✅ Login con credenciales correctas
- ✅ Validación de formularios
- ✅ Manejo de errores de red
- ✅ Persistencia de sesión
- ✅ Logout y limpieza de estado

### **Validaciones Implementadas**

- **Email único** (manejado por Supabase)
- **Contraseñas seguras** (frontend + backend)
- **Datos requeridos** (validación en tiempo real)
- **Sincronización** usuario auth ↔ tabla usuarios

## 🚀 Próximas Mejoras

### **Funcionalidades Planificadas**

- [ ] **Recuperación de contraseña**
- [ ] **Verificación de email**
- [ ] **Autenticación con Google/GitHub**
- [ ] **Roles y permisos avanzados**
- [ ] **Perfil de usuario editable**
- [ ] **Configuración de cuenta**

### **Optimizaciones Técnicas**

- [ ] **Cache de datos de usuario**
- [ ] **Refresh tokens automático**
- [ ] **Logging de eventos de auth**
- [ ] **Métricas de uso**

## 📞 Soporte

Para problemas relacionados con autenticación:

1. **Verificar configuración** de Supabase
2. **Revisar logs** en consola del navegador
3. **Validar RLS policies** en Supabase
4. **Comprobar variables** de entorno

---

**✨ El sistema de autenticación está completamente funcional y listo para producción.** 