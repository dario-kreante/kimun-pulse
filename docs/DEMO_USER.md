# Usuario Demo - KimunPulse 🎯

## 🔑 Credenciales de Acceso

### **Usuario Demo Completo**
```
📧 Email:      demo.kimunpulse@gmail.com
🔑 Contraseña: Demo123!
👤 Nombre:     Usuario Demo
💼 Cargo:      Administrador
📱 Teléfono:   +56912345678
```

## 🚀 Acceso a la Aplicación

### **URL de Acceso**
- **Desarrollo**: `http://localhost:3000`
- **Producción**: `https://kimunpulse.com` (cuando esté desplegado)

### **Proceso de Login**
1. Abrir la aplicación en el navegador
2. Ingresar email: `demo.kimunpulse@gmail.com`
3. Ingresar contraseña: `Demo123!`
4. Hacer clic en "Iniciar sesión"
5. ✅ Acceso completo al sistema

## 📊 Datos Disponibles para Testing

### **Lotes de Producción (3 lotes)**
- **LP-2025-CHIL-001**: Arándanos Duke (En Packing) - 2.5 ha
- **LP-2025-CHIL-002**: Cerezas Sweet Heart (En Cámara) - 3.2 ha  
- **LP-2025-CHIL-003**: Manzanas Golden Delicious (Listo Despacho) - 4.1 ha

### **Eventos de Trazabilidad (16 eventos)**
- **Lote 001**: 3 eventos (Inicio Cosecha → Cosecha Completa → Recepción Packing)
- **Lote 002**: 6 eventos (Proceso completo hasta Enfriado)
- **Lote 003**: 7 eventos (Proceso completo hasta Control Calidad)

### **Métricas del Dashboard**
- ✅ **Total Lotes**: 3
- ✅ **Lotes Activos**: 3  
- ✅ **Área Total**: 9.8 hectáreas
- ✅ **Eventos Hoy**: 5 (eventos recientes)

## 🧪 Funcionalidades para Testear

### **1. Dashboard Principal**
- [x] Visualización de métricas en tiempo real
- [x] Lotes recientes con estados actualizados
- [x] Navegación entre secciones

### **2. Gestión de Lotes**
- [x] Lista completa de lotes con filtros
- [x] Vista de detalle de cada lote
- [x] Historial de eventos por lote
- [x] Estados visuales con iconografía

### **3. Trazabilidad de Eventos**
- [x] Visualización de eventos cronológicos
- [x] Detalles completos de cada evento
- [x] Datos adicionales en formato JSON
- [x] Responsables y timestamps

### **4. Sistema de Autenticación**
- [x] Login/Logout funcional
- [x] Información del usuario en header
- [x] Protección de rutas
- [x] Sesiones persistentes

### **5. Interfaz Responsive**
- [x] Diseño adaptativo móvil/desktop
- [x] Navegación optimizada
- [x] Componentes touch-friendly

## 🔧 Configuración Técnica

### **Base de Datos**
- **Proyecto Supabase**: `kimun-pulse`
- **URL**: `https://etmbspkgeofygcowsylp.supabase.co`
- **Estado**: ACTIVE_HEALTHY
- **Región**: us-west-1

### **Autenticación**
- **Proveedor**: Supabase Auth
- **Confirmación Email**: ✅ Confirmado automáticamente
- **Sincronización**: Usuario creado en tabla `usuarios`
- **Permisos**: Administrador completo

### **Datos de Prueba**
- **Cultivos**: 3 (Arándanos, Cerezas, Manzanas)
- **Variedades**: 6 (Duke, Bluecrop, Sweet Heart, etc.)
- **Cuarteles**: 3 (Cuartel 1, 2, 3)
- **Usuarios**: 9 (incluyendo Usuario Demo)

## 📝 Casos de Uso para Demo

### **Escenario 1: Supervisor de Campo**
1. Login como Usuario Demo
2. Ver dashboard con métricas actuales
3. Revisar lotes en proceso
4. Consultar historial de eventos

### **Escenario 2: Jefe de Packing**
1. Acceder a lote específico (LP-2025-CHIL-002)
2. Revisar eventos de recepción y selección
3. Verificar datos de calidad y temperatura
4. Consultar estado actual (En Cámara)

### **Escenario 3: Gerente de Operaciones**
1. Analizar métricas generales del dashboard
2. Revisar distribución de estados de lotes
3. Consultar eventos del día
4. Evaluar rendimiento por área

## 🎯 Puntos Clave para Demostrar

### **Trazabilidad Completa**
- ✅ Seguimiento desde cosecha hasta despacho
- ✅ Registro detallado de cada proceso
- ✅ Datos técnicos (temperatura, calidad, etc.)
- ✅ Responsables y timestamps precisos

### **Dashboard en Tiempo Real**
- ✅ Métricas actualizadas automáticamente
- ✅ Estados visuales intuitivos
- ✅ Navegación fluida entre secciones

### **Experiencia de Usuario**
- ✅ Interfaz moderna y responsive
- ✅ Autenticación segura y fluida
- ✅ Información organizada y accesible

## 🚨 Notas Importantes

### **Limitaciones del Demo**
- Los datos son de prueba, no reales
- No se pueden crear nuevos lotes (requiere formularios adicionales)
- Los eventos son históricos, no en tiempo real

### **Recomendaciones**
- Usar en navegadores modernos (Chrome, Firefox, Safari)
- Probar tanto en desktop como móvil
- Explorar todos los lotes para ver diferentes estados

### **Soporte**
- Documentación completa en `/docs`
- Código fuente disponible en el repositorio
- Configuración de ambientes en `src/config/environments.ts`

---

**✨ El usuario demo está completamente configurado y listo para demostrar todas las funcionalidades de KimunPulse MVP.** 