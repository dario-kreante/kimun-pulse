# KimunPulse 🌱

**El pulso vivo de tu campo** - Sistema de trazabilidad agrícola post-cosecha

## Descripción

KimunPulse es una aplicación web de trazabilidad agrícola que permite el seguimiento completo de lotes de producción desde la cosecha hasta el despacho, cumpliendo con las normativas del SAG (Servicio Agrícola y Ganadero) de Chile.

### Características Principales

- ✅ **Trazabilidad Completa**: Seguimiento de lotes desde cosecha hasta despacho
- ✅ **Estados de Proceso**: En Cosecha → Cosecha Completa → En Packing → Empacado → En Cámara → Listo Despacho → Despachado
- ✅ **Gestión de Eventos**: Registro de eventos de trazabilidad en tiempo real
- ✅ **Dashboard en Tiempo Real**: Métricas y KPIs actualizados automáticamente
- ✅ **Base de Datos Real**: Backend completo con Supabase
- ✅ **Diseño Responsive**: Optimizado para dispositivos móviles y desktop
- ✅ **Reportes**: Generación de reportes de trazabilidad por lote

## Stack Tecnológico

### Frontend
- **React 18** con TypeScript
- **Vite** para desarrollo rápido
- **Tailwind CSS** para estilos utility-first
- **Lucide React** para iconografía

### Backend
- **Supabase** como BaaS (Backend as a Service)
- **PostgreSQL** como base de datos principal
- **Row Level Security (RLS)** para seguridad
- **Real-time subscriptions** para actualizaciones en vivo

### Herramientas de Desarrollo
- **TypeScript** para type safety
- **ESLint** para linting
- **Git** para control de versiones

## Arquitectura de Datos

### Esquema de Base de Datos

```sql
-- Tipos enum
CREATE TYPE estado_lote AS ENUM (
  'En Cosecha', 'Cosecha Completa', 'En Packing', 
  'Empacado', 'En Cámara', 'Listo Despacho', 'Despachado'
);

CREATE TYPE tipo_evento AS ENUM (
  'Inicio Cosecha', 'Cosecha Completa', 'Recepción Packing',
  'Selección', 'Empaque', 'Paletizado', 'Enfriado', 
  'Control Calidad', 'Despacho'
);

-- Tablas principales
- cultivos (Arándanos, Cerezas, Manzanas)
- variedades (Duke, Sweet Heart, Golden Delicious, etc.)
- cuarteles (Cuartel 1, 2, 3)
- usuarios (supervisores, operadores, jefes)
- lotes (lotes de producción con trazabilidad)
- eventos_trazabilidad (historial completo de eventos)
```

### Vistas y Funciones
- `v_lotes_completos`: Vista con información completa de lotes
- `v_dashboard_metricas`: Métricas resumidas para dashboard
- `v_eventos_recientes`: Eventos de los últimos 30 días
- `obtener_metricas_dashboard()`: Función para métricas en tiempo real
- `generar_reporte_lote()`: Función para reportes completos

## Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- npm o yarn
- Cuenta de Supabase (ya configurada)

### Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/dario-kreante/kimun-pulse.git
cd kimun-pulse
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configuración de entorno**
El proyecto ya incluye la configuración de Supabase integrada.

### Configuración de Supabase

#### Proyecto Activo
- **Proyecto ID**: `kimun-pulse`
- **URL**: `https://etmbspkgeofygcowsylp.supabase.co`
- **Región**: `us-west-1`
- **Estado**: `ACTIVE_HEALTHY`

#### Datos de Prueba Incluidos
- **3 Lotes de producción** con trazabilidad completa
- **15 Eventos** de trazabilidad distribuidos
- **3 Cultivos**: Arándanos, Cerezas, Manzanas
- **6 Variedades**: Duke, Bluecrop, Sweet Heart, etc.
- **3 Cuarteles**: Cuartel 1, 2, 3
- **9 Usuarios**: Supervisores, operadores, jefes de área

### Ejecutar la Aplicación

```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Preview de producción
npm run preview
```

La aplicación estará disponible en `http://localhost:5173`

## Estructura del Proyecto

```
src/
├── components/           # Componentes React (eliminados - UI integrada)
├── hooks/               # Custom hooks para manejo de datos
│   └── useKimunPulse.ts # Hooks principales para Supabase
├── lib/                 # Configuración y servicios
│   └── supabase.ts      # Cliente y servicios de Supabase
├── types/               # Definiciones de tipos TypeScript
│   └── database.ts      # Tipos generados desde Supabase
├── App.tsx              # Componente principal
├── index.css            # Estilos base y Tailwind
└── main.tsx             # Entry point
```

## Funcionalidades Principales

### 1. Dashboard de Monitoreo
- **Métricas en tiempo real**: Total lotes, área, eventos del día
- **Estados de lotes**: Distribución por estado de proceso
- **Eventos recientes**: Últimas 5 actividades de trazabilidad
- **Auto-refresh**: Actualización automática cada 30 segundos

### 2. Gestión de Lotes
- **Lista completa** de lotes con filtros y búsqueda
- **Vista de detalle** con historial completo de eventos
- **Estados visuales** con iconografía intuitiva
- **Información técnica**: Cultivo, variedad, área, cuartel

### 3. Trazabilidad de Eventos
- **9 Tipos de eventos** según flujo post-cosecha
- **Registro en tiempo real** con responsable y descripción
- **Historial cronológico** completo por lote
- **Datos adicionales** en formato JSON para flexibilidad

### 4. Reportes de Trazabilidad
- **Exportación** de reportes por lote
- **Formato de texto** con información completa
- **Historial de eventos** incluido
- **Información técnica** y de proceso

### 5. Interfaz Responsive
- **Diseño mobile-first** con navegación adaptativa
- **Sidebar** para desktop con navegación completa
- **Bottom navigation** para móviles
- **Componentes optimizados** para touch y mouse

## Flujo de Trazabilidad

### Estados de Lote
1. **En Cosecha** 🌱 - Proceso de cosecha en campo
2. **Cosecha Completa** ✅ - Cosecha finalizada
3. **En Packing** 🏭 - Recepción en planta de packing
4. **Empacado** 📦 - Producto empacado y etiquetado
5. **En Cámara** ❄️ - Almacenamiento en frío
6. **Listo Despacho** 🚚 - Preparado para envío
7. **Despachado** ✈️ - Enviado a destino

### Tipos de Eventos
- **Inicio Cosecha**: Comienzo del proceso de cosecha
- **Cosecha Completa**: Finalización de cosecha
- **Recepción Packing**: Llegada a planta de procesamiento
- **Selección**: Clasificación y selección de producto
- **Empaque**: Proceso de empaque y etiquetado
- **Paletizado**: Organización en pallets
- **Enfriado**: Proceso de enfriamiento
- **Control Calidad**: Verificación de estándares
- **Despacho**: Envío a destino final

## Seguridad y Cumplimiento

### Row Level Security (RLS)
- **Políticas aplicadas** en todas las tablas
- **Acceso controlado** por usuario autenticado
- **Auditoría** de todas las operaciones

### Normativas SAG
- **Trazabilidad completa** según requerimientos
- **Registro cronológico** de todos los eventos
- **Identificación única** de lotes de producción
- **Responsables identificados** en cada proceso

## API y Servicios

### Servicios Implementados

```typescript
// Servicio de lotes
lotesService.obtenerLotesCompletos()
lotesService.obtenerLotePorId(id)
lotesService.crearLote(lote)

// Servicio de eventos
eventosService.obtenerHistorialLote(loteId)
eventosService.agregarEvento(evento)
eventosService.obtenerEventosRecientes()

// Servicio de dashboard
dashboardService.obtenerMetricas()
dashboardService.generarReporteLote(loteId)

// Servicio de catálogos
catalogosService.obtenerCultivos()
catalogosService.obtenerVariedades(cultivoId)
catalogosService.obtenerCuarteles()
catalogosService.obtenerUsuarios()
```

### Hooks Reactivos

```typescript
// Hook para lotes
const { lotes, loading, error, refrescar } = useLotes()

// Hook para lote específico
const { lote, eventos, agregarEvento } = useLote(loteId)

// Hook para dashboard
const { metricas, eventosRecientes } = useDashboard()

// Hook para catálogos
const { cultivos, variedades, cuarteles } = useCatalogos()
```

## Próximas Funcionalidades

### En Desarrollo
- [ ] **Autenticación de usuarios** completa
- [ ] **Roles y permisos** granulares
- [ ] **Notificaciones en tiempo real**
- [ ] **Reportes avanzados** en PDF
- [ ] **API para integraciones** externas

### Planificadas
- [ ] **App móvil nativa**
- [ ] **Integración con sensores IoT**
- [ ] **Analytics avanzados**
- [ ] **Exportación a Excel**
- [ ] **Códigos QR automáticos**

## Contribución

### Configuración de Desarrollo
1. Fork del repositorio
2. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -am 'Agregar nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

### Estándares de Código
- **TypeScript**: Código completamente tipado
- **ESLint**: Linting configurado y obligatorio
- **Prettier**: Formateo automático de código
- **Conventional Commits**: Formato estándar de commits

## Licencia

MIT License - ver archivo [LICENSE](LICENSE) para detalles.

## Contacto

- **Desarrollador**: Dario @ Kreante
- **Email**: dario@kreante.co
- **GitHub**: [@dario-kreante](https://github.com/dario-kreante)

---

**KimunPulse v1.0** - Trazabilidad agrícola profesional para la industria frutícola chilena 🇨🇱

## Estado del Proyecto

✅ **Backend completo** con Supabase  
✅ **Frontend funcional** con datos reales  
✅ **Trazabilidad implementada** según SAG  
✅ **Dashboard en tiempo real**  
✅ **Responsive design**  
🔄 **Autenticación** (en desarrollo)  
🔄 **Reportes PDF** (planificado)  

**Última actualización**: Enero 2025
