# 🌱 KimunPulse MVP - El Pulso Vivo de Tu Campo

Aplicación MVP móvil enfocada específicamente en trazabilidad de lotes agrícolas. **KimunPulse** te conecta con el pulso vital de tu campo, proporcionando control total sobre la trazabilidad de tus cultivos.

## 🎯 Funcionalidades MVP

### ✅ Módulos Implementados
- **📊 Panel** - Dashboard con KPIs y resumen de lotes recientes
- **📦 Lotes** - Gestión completa de lotes activos
- **📑 Reportes** - Exportación de trazabilidad (próximamente)
- **👤 Perfil** - Configuración de usuario (próximamente)

### 🔧 Funciones Core
- **Escaneo de códigos QR/GS1-128** - Acceso rápido desde header
- **Listado de lotes activos** - ID, cultivo, estado, último evento + timestamp
- **Vista detalle de lote** - Historial completo de eventos de trazabilidad
- **Registro de nuevos eventos** - Tipos específicos del proceso post-cosecha
- **Creación de lotes** - Formulario con datos SAG requeridos
- **Generación de reportes** - Exportación de trazabilidad completa

### 📦 Estados de Lotes (Ciclo Post-Cosecha)
1. **🌱 En Cosecha** - Proceso de recolección en terreno
2. **✅ Cosecha Completa** - Recolección finalizada, listo para transporte
3. **🏭 En Packing** - En proceso en planta de packing
4. **📦 Empacado** - Producto empacado y etiquetado
5. **❄️ En Cámara** - Proceso de enfriado o almacenamiento refrigerado
6. **🛒 Listo Despacho** - Producto listo para envío al cliente
7. **🚛 Despachado** - Enviado al destino final

### 📋 Tipos de Eventos (Nomenclatura SAG)
- **Inicio Cosecha** - Comienzo de recolección en cuartel
- **Cosecha Completa** - Finalización de recolección
- **Recepción Packing** - Ingreso a planta de procesamiento
- **Selección** - Clasificación por calibre y calidad
- **Empaque** - Proceso de empacado para comercialización
- **Paletizado** - Armado de pallets para despacho
- **Enfriado** - Proceso de hidrocooling o enfriado
- **Control Calidad** - Verificación final antes de despacho
- **Despacho** - Salida hacia cliente/distribuidor

### 🗂️ Módulos Secundarios (Sidebar)
- **📅 Eventos** - Historial completo de todos los eventos
- **🔔 Notificaciones** - Alertas de lotes pendientes
- **⚙️ Configuración** - Preferencias de usuario/empresa
- **❓ Ayuda & Soporte** - FAQs y contacto

## 🎨 Identidad Visual

### Logo KimunPulse
Diseño SVG personalizado que representa:
- **Hoja estilizada** en blanco sobre gradiente verde
- **Ondas de pulso** en Lima Suave que simbolizan la vitalidad
- **Vena central** que conecta con la naturaleza
- **Gradiente cultivo** como base sólida

### Colores
- **Primary:** Verde Cultivo #16A34A
- **Secondary:** Lima Suave #A3E635  
- **Neutral:** Grises suaves
- **Degradados:** Verde cultivo hacia tonos más profundos

### Tipografía
- **Fuente:** Inter (Google Fonts)
- **Mobile First:** 390×844pt (iPhone 14)

### Flujo Principal
```
Escaneo QR → Lote → Evento → Reporte
```

## 🏗️ Arquitectura de Navegación

### 📱 Header (Barra Superior)
Acciones críticas siempre disponibles:
- **☰ Menú hamburguesa** → Abre sidebar
- **🔍 Escanear** → Cámara QR/GS1-128  
- **➕ Nuevo lote** → Formulario de alta

### 🔽 Navbar (Barra Inferior)
4 módulos principales de uso frecuente:
- **🏠 Panel** → Dashboard con KPIs
- **📦 Lotes** → Gestión de lotes
- **📑 Reportes** → PDFs y CSVs
- **👤 Perfil** → Usuario y empresa

### 📋 Sidebar (Menú Lateral)
Módulos secundarios y configuraciones:
- **📅 Eventos** → Historial completo
- **🔔 Notificaciones** → Alertas
- **⚙️ Configuración** → Preferencias  
- **❓ Ayuda** → Soporte y FAQs

## 🏗️ Arquitectura Técnica

### Stack
- **React 18** + TypeScript
- **Tailwind CSS** v3.4.0
- **Lucide React** iconos
- **Single Component Architecture** con componentes internos

### 📋 Concepto: ¿Qué es un Lote en KimunPulse?

**KimunPulse** utiliza la terminología oficial chilena según normativas SAG:

#### ✅ Lote de Producción
- **Definición:** Batch de fruta que comparte mismo origen, fecha y variedad
- **Ámbito:** Desde cosecha hasta despacho
- **Normativa:** Manual FDF y reglamentos SAG
- **Ejemplo:** `LP-2025-CHIL-001` - Arándanos Duke del Cuartel 3

#### 🔄 Diferencia con Cuarteles
| Concepto | Uso en KimunPulse | Descripción |
|----------|-------------------|-------------|
| **Lote de Producción** | ✅ **Unidad principal** | Batch rastreado en trazabilidad post-cosecha |
| **Cuartel/Bloque** | 📍 **Campo de origen** | Subdivisión del predio donde se cosechó el lote |

#### 🚀 Escalabilidad Futura
- **Actual:** Trazabilidad de lotes (cosecha → despacho)
- **Futuro:** Gestión de cuarteles (labores agronómicas in-field)

### Estructura de Datos
```typescript
interface LoteTraceabilidad {
  id: string; // LP-2025-CHIL-XXX
  cultivo: 'Arándanos' | 'Cerezas' | 'Manzanas' | 'Uvas';
  variedad: string; // Duke, Bluecrop, Sweet Heart, etc.
  estado: 'Activo' | 'Cosechado' | 'Empacado' | 'Despachado';
  ultimoEvento: string;
  fechaUltimoEvento: string;
  area: number; // Hectáreas del lote
  cuartelOrigen: string; // Cuartel/bloque donde se cosechó
  eventos: EventoTrazabilidad[];
}

interface EventoTrazabilidad {
  tipo: 'Siembra' | 'Riego' | 'Fertilización' | 'Cosecha' | 'Empaque' | 'Despacho';
  fecha: string;
  descripcion: string;
  responsable: string;
  cuartel?: string; // Cuartel donde se ejecutó la labor
}
```

## 🚀 Instalación y Ejecución

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm start

# Compilar para producción
npm run build
```

## 📊 Datos de Demostración

### Lotes Chilenos Incluidos
- **LP-2025-CHIL-001** - Arándanos Duke (2.5 ha) - **En Packing**
- **LP-2025-CHIL-002** - Cerezas Sweet Heart (3.2 ha) - **En Cámara**  
- **LP-2025-CHIL-003** - Manzanas Golden Delicious (4.1 ha) - **Listo Despacho**

### Estados Demostrados
- **En Cosecha** → Recolección activa en terreno
- **En Packing** → Procesamiento en planta
- **En Cámara** → Enfriado hidrocooling completado
- **Listo Despacho** → Control calidad final aprobado

### Eventos Simulados del Proceso Real
- **Inicio/Cosecha Completa** - Labores en terreno
- **Recepción Packing** - Ingreso a planta con controles temperatura/brix
- **Selección** - Clasificación por calibre (Cat. I, Cat. II)
- **Empaque/Paletizado** - Proceso de empacado estándar export
- **Enfriado** - Hidrocooling con control temperatura pulpa
- **Control Calidad** - Verificación final de temperatura, etiquetado, trazabilidad

### KPIs del Panel
- **Lotes Activos:** Contador dinámico de lotes en proceso
- **Eventos Hoy:** Simulado (12 eventos de trazabilidad)
- **Últimos Lotes:** Top 3 más recientes con estados actualizados

## 🎯 Filosofía MVP

**KimunPulse** está diseñado para sentir el pulso vital de tu campo. Nuestro enfoque es validar rápidamente la hipótesis core de trazabilidad básica antes de agregar features complejas.

### Principios de Diseño
- **Acceso rápido** a funciones críticas desde el header
- **Navegación intuitiva** con navbar de 4 módulos principales
- **Organización clara** con sidebar para funciones secundarias
- **Flujo optimizado:** escanear → rastrear → reportar

## 📝 Siguientes Pasos (Post-MVP)

### Corto Plazo
1. **Completar módulos** de Reportes y Perfil
2. **Implementar módulos** del sidebar (Eventos, Notificaciones, etc.)
3. **Integración con escáner** real de códigos QR/GS1-128

### Mediano Plazo
4. **Backend** para persistencia de datos
5. **Autenticación** y roles de usuario  
6. **Notificaciones push** para alertas

### Largo Plazo
7. **Integración ERP** con sistemas existentes
8. **Features avanzadas** según feedback de usuarios
9. **Escalabilidad** a múltiples fundos y empresas

---

**Versión:** MVP 1.0  
**Marca:** KimunPulse  
**Eslogan:** El pulso vivo de tu campo  
**Estado:** ✅ Listo para validación de usuarios