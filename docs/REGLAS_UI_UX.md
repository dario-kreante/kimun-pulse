# Reglas de UI/UX - KimunPulse

## Introducción

Este documento establece las reglas y patrones de diseño que deben seguirse en KimunPulse para mantener la consistencia visual y funcional en toda la aplicación. Estas reglas están basadas en el sistema de diseño existente y deben respetarse en todas las nuevas implementaciones.

## Principios Fundamentales

### 1. Mobile-First Design
- **SIEMPRE** diseñar primero para móvil, luego escalar a desktop
- Usar breakpoints responsivos: `sm:`, `md:`, `lg:`, `xl:`
- Priorizar la usabilidad en pantallas pequeñas

### 2. Consistencia Visual
- Mantener patrones visuales uniformes en toda la aplicación
- Usar el mismo sistema de colores, tipografía y espaciado
- Seguir las convenciones establecidas para componentes similares

### 3. Accesibilidad
- Usar elementos semánticos HTML
- Incluir `aria-label` en elementos interactivos
- Mantener contraste adecuado de colores
- Asegurar navegación por teclado

## Sistema de Colores

### Colores Principales
```css
/* Colores del sistema agrícola */
cultivo-50: #f0f9f0    /* Fondos suaves */
cultivo-600: #16a34a   /* Elementos principales */
cultivo-700: #15803d   /* Estados hover */

lima-50: #f7fee7       /* Fondos alternativos */
lima-600: #65a30d      /* Acentos */

orange-50: #fff7ed     /* Alertas suaves */
orange-600: #ea580c    /* Alertas importantes */

/* Estados */
green-50/600/800: Éxito, completado
red-50/600/800: Error, rechazado
yellow-50/600/800: Advertencia, pendiente
blue-50/600/800: Información, proceso
purple-50/600/800: Especial, premium
```

### Uso de Colores por Contexto
- **Verde (cultivo/lima)**: Procesos agrícolas, éxito, completado
- **Naranja**: Alertas, procesos críticos, paletizado
- **Azul**: Información general, formularios, navegación
- **Rojo**: Errores, rechazos, temperatura crítica
- **Amarillo**: Advertencias, procesos pendientes
- **Púrpura**: Funciones especiales, calidad premium

## Patrones de Layout

### 1. Estructura de Página
```jsx
// Patrón estándar para páginas principales
<div className="space-y-6">
  {/* Header con gradiente */}
  <div className="bg-gradient-to-r from-[color]-50 to-[color2]-50 rounded-xl p-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-[color]-500 rounded-full flex items-center justify-center text-white">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-[color]-900">Título</h2>
          <p className="text-[color]-700">Descripción</p>
        </div>
      </div>
      {/* Badge de estado opcional */}
      <span className="px-3 py-1 bg-[color]-100 text-[color]-800 rounded-full text-sm font-medium">
        Estado
      </span>
    </div>
  </div>
  
  {/* Contenido principal */}
  <div className="space-y-6">
    {/* Cards de contenido */}
  </div>
</div>
```

### 2. Cards y Contenedores
```jsx
// Card estándar
<div className="bg-white rounded-lg border border-gray-200 p-6">
  <div className="flex items-center space-x-2 mb-4">
    <Icon className="h-5 w-5 text-[color]-600" />
    <h3 className="font-medium text-gray-900">Título</h3>
  </div>
  {/* Contenido */}
</div>

// Card con estado
<div className="bg-[color]-50 border border-[color]-200 rounded-lg p-4">
  <div className="flex items-start space-x-3">
    <Icon className="h-5 w-5 text-[color]-600 mt-0.5" />
    <div className="flex-1">
      <h4 className="font-medium text-[color]-900">Título</h4>
      <p className="text-[color]-800 text-sm mt-1">Descripción</p>
    </div>
  </div>
</div>
```

## Componentes Específicos

### 1. Métricas y KPIs
```jsx
// Patrón para métricas en dashboard
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  <div className="text-center">
    <div className="text-2xl font-bold text-[color]-900">{valor}</div>
    <div className="text-sm text-[color]-700">{etiqueta}</div>
  </div>
</div>
```

### 2. Grids Responsivos
```jsx
// Grid estándar para elementos
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Elementos */}
</div>

// Grid para móvil con expansión
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Elementos más pequeños */}
</div>
```

### 3. Estados de Carga
```jsx
// Loading state estándar
<div className="bg-gray-50 rounded-lg p-4">
  <div className="flex items-center space-x-3">
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[color]-600"></div>
    <span className="text-gray-600">Cargando...</span>
  </div>
</div>
```

### 4. Estados Vacíos
```jsx
// Empty state estándar
<div className="bg-gray-50 rounded-lg p-8 text-center">
  <Icon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
  <h3 className="text-lg font-medium text-gray-900 mb-2">Sin datos</h3>
  <p className="text-gray-600">Descripción del estado vacío</p>
</div>
```

## Formularios

### 1. Estructura de Formularios
```jsx
// Sección de formulario
<div className="bg-white border border-gray-200 rounded-lg p-4">
  <div className="flex items-center space-x-2 mb-4">
    <Icon className="h-5 w-5 text-[color]-600" />
    <h5 className="font-medium text-gray-900">Título de Sección</h5>
  </div>
  
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Campos del formulario */}
  </div>
</div>
```

### 2. Campos de Entrada
```jsx
// Input estándar
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Etiqueta {required && '*'}
  </label>
  <input
    type="text"
    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[color]-500 focus:border-[color]-500"
    placeholder="Placeholder"
    aria-label="Descripción accesible"
  />
</div>

// Select estándar
<select
  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[color]-500 focus:border-[color]-500"
  aria-label="Descripción accesible"
>
  <option value="">Seleccionar...</option>
</select>
```

### 3. Validación de Formularios
```jsx
// Indicador de validación
<div className={`p-3 rounded-lg text-sm border ${
  esValido 
    ? 'bg-green-50 text-green-800 border-green-200' 
    : 'bg-red-50 text-red-800 border-red-200'
}`}>
  <div className="flex items-center space-x-2">
    <div className={`w-2 h-2 rounded-full ${
      esValido ? 'bg-green-500' : 'bg-red-500'
    }`}></div>
    <span className="font-medium">
      {esValido 
        ? 'Formulario completo y válido'
        : 'Completa todos los campos obligatorios'
      }
    </span>
  </div>
  {!esValido && (
    <ul className="mt-2 ml-4 text-xs space-y-1">
      {errores.map(error => <li key={error}>• {error}</li>)}
    </ul>
  )}
</div>
```

## Botones y Acciones

### 1. Botones Principales
```jsx
// Botón primario
<button className="px-4 py-2 bg-[color]-600 text-white rounded-lg hover:bg-[color]-700 font-medium transition-colors">
  Acción Principal
</button>

// Botón secundario
<button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
  Acción Secundaria
</button>

// Botón con icono
<button className="flex items-center space-x-2 px-4 py-2 bg-[color]-600 text-white rounded-lg hover:bg-[color]-700 transition-colors">
  <Icon className="h-4 w-4" />
  <span>Texto</span>
</button>
```

### 2. Botones de Estado
```jsx
// Botón de éxito
<button className="px-3 py-1.5 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700">
  Completar
</button>

// Botón de advertencia
<button className="px-3 py-1.5 bg-yellow-600 text-white rounded text-sm font-medium hover:bg-yellow-700">
  Revisar
</button>

// Botón de peligro
<button className="px-3 py-1.5 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700">
  Eliminar
</button>
```

## Navegación y Estados

### 1. Breadcrumbs y Navegación
```jsx
// Header de página con navegación
<div className="flex items-center justify-between mb-6">
  <div className="flex items-center space-x-4">
    <button 
      onClick={goBack}
      className="text-gray-400 hover:text-gray-600 transition-colors"
    >
      <ArrowLeft className="h-6 w-6" />
    </button>
    <h1 className="text-2xl font-bold text-gray-900">Título de Página</h1>
  </div>
</div>
```

### 2. Badges de Estado
```jsx
// Badge estándar
<span className={`px-2 py-1 rounded-full text-xs font-medium ${
  estado === 'completado' ? 'bg-green-100 text-green-800' :
  estado === 'proceso' ? 'bg-blue-100 text-blue-800' :
  estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
  'bg-gray-100 text-gray-800'
}`}>
  {estado}
</span>
```

## Espaciado y Tipografía

### 1. Sistema de Espaciado
```css
/* Espaciado estándar */
space-y-6: Entre secciones principales
space-y-4: Entre elementos relacionados
space-y-2: Entre elementos muy relacionados
gap-6: Grid principal
gap-4: Grid secundario
p-6: Padding de cards principales
p-4: Padding de cards secundarios
```

### 2. Tipografía
```css
/* Jerarquía de títulos */
text-2xl font-bold: Títulos de página
text-xl font-semibold: Títulos de sección
text-lg font-medium: Subtítulos
text-sm font-medium: Labels y etiquetas
text-xs: Texto auxiliar y metadatos
```

## Iconografía

### 1. Uso de Iconos
- **SIEMPRE** usar iconos de Lucide React
- Tamaño estándar: `h-5 w-5` para elementos normales
- Tamaño grande: `h-6 w-6` para headers importantes
- Tamaño pequeño: `h-4 w-4` para botones y elementos compactos

### 2. Iconos por Contexto
```jsx
// Iconos comunes por función
<Package />      // Lotes, productos, empaque
<Activity />     // Eventos, procesos
<Users />        // Personal, operarios
<Thermometer />  // Temperatura, control ambiental
<Clock />        // Tiempo, horarios
<MapPin />       // Ubicación, sectores
<Truck />        // Transporte, logística
<ShieldCheck />  // Calidad, certificaciones
<AlertCircle />  // Advertencias, problemas
<CheckCircle />  // Éxito, completado
```

## Responsive Design

### 1. Breakpoints
```css
/* Breakpoints estándar */
sm: 640px   /* Móvil grande */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop pequeño */
xl: 1280px  /* Desktop grande */
```

### 2. Patrones Responsivos
```jsx
// Ocultar en móvil, mostrar en desktop
<div className="hidden sm:block">Contenido desktop</div>

// Grid responsivo estándar
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// Texto responsivo
<h1 className="text-xl md:text-2xl font-bold">

// Espaciado responsivo
<div className="p-4 md:p-6">
```

## Reglas Específicas de KimunPulse

### 1. Gestión de Pallets
- Los pallets SIEMPRE se muestran en grid responsivo
- Cada pallet debe tener su propio card con estado visual
- Usar colores específicos para estados de pallet:
  - `green`: Completo/Listo
  - `blue`: En cámara
  - `orange`: En tránsito
  - `gray`: Sin estado

### 2. Eventos de Trazabilidad
- Cada tipo de evento tiene su color asociado
- Los formularios específicos deben seguir el patrón de secciones con iconos
- SIEMPRE incluir validación visual en tiempo real

### 3. Estados de Lote
- Lotes paletizados NO muestran "siguiente paso sugerido"
- La gestión post-paletizado se hace por pallets individuales
- Usar badges de estado consistentes en toda la aplicación

## Checklist de Implementación

### Antes de Implementar
- [ ] ¿Sigue el patrón mobile-first?
- [ ] ¿Usa los colores del sistema establecido?
- [ ] ¿Incluye estados de carga y error?
- [ ] ¿Tiene labels accesibles?
- [ ] ¿Sigue la estructura de espaciado?

### Durante la Implementación
- [ ] ¿Los iconos son de Lucide React?
- [ ] ¿Los formularios tienen validación visual?
- [ ] ¿Los grids son responsivos?
- [ ] ¿Los botones tienen estados hover?
- [ ] ¿Se mantiene la consistencia tipográfica?

### Después de Implementar
- [ ] ¿Se ve bien en móvil?
- [ ] ¿Se ve bien en desktop?
- [ ] ¿Es accesible por teclado?
- [ ] ¿Mantiene la consistencia visual?
- [ ] ¿Funciona con el resto de la aplicación?

## Ejemplos de Implementación Correcta

### Página de Gestión de Pallets
```jsx
// ✅ CORRECTO - Sigue todos los patrones
<div className="space-y-6">
  {/* Header con gradiente */}
  <div className="bg-gradient-to-r from-orange-50 to-cultivo-50 rounded-xl p-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white">
          <Grid3X3 className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-orange-900">Gestión de Pallets</h2>
          <p className="text-orange-700">Lote LP-2025-CHIL-001</p>
        </div>
      </div>
      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
        Ciclo Completado
      </span>
    </div>
  </div>

  {/* Grid de pallets */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {pallets.map(pallet => (
      <div key={pallet.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:border-orange-300 cursor-pointer transition-colors">
        {/* Contenido del pallet */}
      </div>
    ))}
  </div>
</div>
```

## Errores Comunes a Evitar

### ❌ NO Hacer
```jsx
// Colores inconsistentes
<div className="bg-red-100"> // Usar solo para errores

// Espaciado inconsistente
<div className="p-3 space-y-5"> // Usar valores estándar

// Iconos de diferentes librerías
<FontAwesomeIcon /> // Solo usar Lucide React

// Grids no responsivos
<div className="grid grid-cols-3"> // Siempre incluir responsive
```

### ✅ SÍ Hacer
```jsx
// Colores del sistema
<div className="bg-cultivo-50">

// Espaciado estándar
<div className="p-4 space-y-6">

// Iconos de Lucide
<Package className="h-5 w-5" />

// Grids responsivos
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
```

---

**Nota Importante**: Estas reglas deben seguirse estrictamente para mantener la coherencia visual y funcional de KimunPulse. Cualquier desviación debe ser justificada y documentada. 