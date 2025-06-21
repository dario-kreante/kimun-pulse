# Formato Oficial de Códigos - KimunPulse 🏷️

## 📋 **Especificación del Formato**

### **Lotes de Producción - Formato Estándar Obligatorio**
```
LP-YYYY-CHIL-NNN

Donde:
├── LP     = Lote de Producción (fijo)
├── YYYY   = Año de cosecha (4 dígitos)
├── CHIL   = Chile, código de país (fijo)
└── NNN    = Número secuencial (3 dígitos con ceros a la izquierda)
```

### **🆕 Pallets - Nuevo Formato Integrado**
```
PAL-YYYY-CHIL-NNNNN

Donde:
├── PAL    = Pallet (fijo)
├── YYYY   = Año de paletizado (4 dígitos)
├── CHIL   = Chile, código de país (fijo)
└── NNNNN  = Número secuencial pallet (5 dígitos con ceros a la izquierda)
```

### **Ejemplos Válidos**

#### **Lotes**
```
✅ LP-2024-CHIL-001
✅ LP-2024-CHIL-025  
✅ LP-2025-CHIL-147
✅ LP-2023-CHIL-999
```

#### **Pallets**
```
✅ PAL-2024-CHIL-00001
✅ PAL-2024-CHIL-00287
✅ PAL-2025-CHIL-01547
✅ PAL-2023-CHIL-99999
```

### **Ejemplos Inválidos**
```
❌ L-2024-001           (falta P y CHIL)
❌ LP-24-CHIL-001       (año debe ser 4 dígitos)
❌ LP-2024-CH-001       (debe ser CHIL completo)
❌ LP-2024-CHIL-1       (número debe ser 3 dígitos)
❌ LP-2024-CHIL-1234    (número no puede ser más de 3 dígitos)
❌ PAL-2024-CHIL-1      (pallet debe ser 5 dígitos)
❌ LP-2024-CHIL-PAL     (mezcla de formatos incorrecta)
```

## 🎯 **Reglas de Implementación**

### **1. Validación Regex**
```typescript
// Patrón para lotes
const LOTE_PATTERN = /^LP-\d{4}-CHIL-\d{3}$/

// Patrón para pallets
const PALLET_PATTERN = /^PAL-\d{4}-CHIL-\d{5}$/

// Patrón combinado para validación general
const CODIGO_PATTERN = /^(LP-\d{4}-CHIL-\d{3}|PAL-\d{4}-CHIL-\d{5})$/

// Funciones de validación
function validarCodigoLote(codigo: string): boolean {
  return LOTE_PATTERN.test(codigo)
}

function validarCodigoPallet(codigo: string): boolean {
  return PALLET_PATTERN.test(codigo)
}

function validarCodigo(codigo: string): { valido: boolean; tipo: 'lote' | 'pallet' | null } {
  if (LOTE_PATTERN.test(codigo)) return { valido: true, tipo: 'lote' }
  if (PALLET_PATTERN.test(codigo)) return { valido: true, tipo: 'pallet' }
  return { valido: false, tipo: null }
}
```

### **2. Auto-formato en Input Manual**
```typescript
// Transformaciones automáticas permitidas para lotes:
LP2024001        → LP-2024-CHIL-001
L2024001         → LP-2024-CHIL-001  
LP2024CHIL001    → LP-2024-CHIL-001
LP-2024-1        → LP-2024-CHIL-001

// Transformaciones automáticas permitidas para pallets:
PAL2024001       → PAL-2024-CHIL-00001
P202400001       → PAL-2024-CHIL-00001
PAL-2024-1       → PAL-2024-CHIL-00001
```

### **3. Generación Automática de Secuencial**
```sql
-- Para lotes:
SELECT COALESCE(MAX(CAST(RIGHT(id, 3) AS INTEGER)), 0) + 1 
FROM lotes 
WHERE id LIKE 'LP-2024-CHIL-%'

-- Para pallets:
SELECT COALESCE(MAX(CAST(RIGHT(codigo_pallet, 5) AS INTEGER)), 0) + 1 
FROM pallets 
WHERE codigo_pallet LIKE 'PAL-2024-CHIL-%'
```

## 🏭 **Estructura del Código**

### **Componentes del Formato de Lotes**

#### **Prefijo: "LP"**
- **Significado**: Lote de Producción
- **Obligatorio**: SÍ
- **Alternativas**: NO (siempre debe ser LP)
- **Caso**: MAYÚSCULAS

#### **Año: "YYYY"**
- **Formato**: 4 dígitos
- **Rango**: 2020-2099 (configurable)
- **Ejemplo**: 2024, 2025
- **Validación**: Debe ser año válido

#### **País: "CHIL"**
- **Significado**: Chile
- **Obligatorio**: SÍ
- **Fijo**: Siempre "CHIL"
- **Futuro**: Podría extenderse (PERU, ARGE, etc.)

#### **Secuencial Lote: "NNN"**
- **Formato**: 3 dígitos con ceros a la izquierda
- **Rango**: 001-999
- **Auto-incremento**: SÍ
- **Reinicio**: Por año (cada año empieza en 001)

### **🆕 Componentes del Formato de Pallets**

#### **Prefijo: "PAL"**
- **Significado**: Pallet
- **Obligatorio**: SÍ
- **Alternativas**: NO (siempre debe ser PAL)
- **Caso**: MAYÚSCULAS

#### **Año: "YYYY"**
- **Formato**: 4 dígitos
- **Rango**: 2020-2099 (configurable)
- **Ejemplo**: 2024, 2025
- **Validación**: Debe ser año de paletizado

#### **País: "CHIL"**
- **Significado**: Chile
- **Obligatorio**: SÍ
- **Fijo**: Siempre "CHIL"
- **Consistente**: Igual que en lotes

#### **Secuencial Pallet: "NNNNN"**
- **Formato**: 5 dígitos con ceros a la izquierda
- **Rango**: 00001-99999
- **Auto-incremento**: SÍ
- **Reinicio**: Por año (cada año empieza en 00001)
- **Capacidad**: Hasta 99,999 pallets por año

## 📱 **Implementación en UI**

### **Input Manual**
```typescript
// Placeholders en formularios
const placeholders = {
  lote: "LP-2024-CHIL-001",
  pallet: "PAL-2024-CHIL-00001"
}

// Máximo de caracteres
const maxLengths = {
  lote: 16,    // LP-YYYY-CHIL-NNN = 16 caracteres
  pallet: 19   // PAL-YYYY-CHIL-NNNNN = 19 caracteres
}

// Patrones HTML5
const patterns = {
  lote: "LP-\\d{4}-CHIL-\\d{3}",
  pallet: "PAL-\\d{4}-CHIL-\\d{5}"
}
```

### **Mensajes de Error**
```typescript
const MENSAJES_ERROR = {
  formato_invalido_lote: "Formato inválido. Use: LP-YYYY-CHIL-NNN",
  formato_invalido_pallet: "Formato inválido. Use: PAL-YYYY-CHIL-NNNNN",
  año_invalido: "Año debe ser 4 dígitos (ej: 2024)",
  secuencial_invalido_lote: "Número debe ser 3 dígitos (001-999)",
  secuencial_invalido_pallet: "Número debe ser 5 dígitos (00001-99999)",
  codigo_duplicado: "Este código ya existe",
  tipo_no_reconocido: "Tipo de código no reconocido"
}
```

### **Ayudas Visuales**
```typescript
// Estados de validación visual
const getValidationColor = (codigo: string) => {
  const validacion = validarCodigo(codigo)
  if (validacion.valido && validacion.tipo === 'lote') return 'green'     // ✅ Lote válido
  if (validacion.valido && validacion.tipo === 'pallet') return 'blue'    // ✅ Pallet válido
  if (codigo.length > 0) return 'orange'                                  // 🟡 En progreso
  return 'gray'                                                           // ⚪ Vacío
}

// Iconos por tipo
const getIconoByCodigo = (codigo: string) => {
  const validacion = validarCodigo(codigo)
  if (validacion.tipo === 'lote') return '📦'      // Icono de lote
  if (validacion.tipo === 'pallet') return '🏗️'   // Icono de pallet
  return '❓'                                       // Desconocido
}
```

## 🔧 **Configuración Técnica**

### **Base de Datos**

#### **Tabla lotes (existente)**
```sql
-- Constraint existente para lotes
ALTER TABLE lotes ADD CONSTRAINT formato_id_lote 
CHECK (id ~ '^LP-\d{4}-CHIL-\d{3}$');
```

#### **🆕 Nueva tabla pallets**
```sql
-- Nueva tabla para gestión de pallets
CREATE TABLE pallets (
  codigo_pallet TEXT PRIMARY KEY,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
  estado estado_pallet DEFAULT 'en_construccion',
  tipo_pallet VARCHAR(50) NOT NULL DEFAULT 'madera',
  peso_total_kg NUMERIC(10,2),
  cantidad_cajas_total INTEGER DEFAULT 0,
  destino_inicial TEXT,
  ubicacion_actual TEXT,
  temperatura_objetivo NUMERIC(4,1),
  observaciones TEXT,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint para formato
  CONSTRAINT formato_codigo_pallet 
  CHECK (codigo_pallet ~ '^PAL-\d{4}-CHIL-\d{5}$')
);

-- Enum para estados de pallet
CREATE TYPE estado_pallet AS ENUM (
  'en_construccion',    -- Se está armando
  'completo',           -- Terminado, listo para mover
  'en_camara',          -- En cámara frigorífica  
  'en_transito',        -- En movimiento
  'entregado',          -- Entregado al cliente
  'devuelto'            -- Devuelto por algún motivo
);

-- Tabla de relación pallet-lotes para pallets mixtos
CREATE TABLE pallet_lotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo_pallet TEXT REFERENCES pallets(codigo_pallet),
  lote_id TEXT REFERENCES lotes(id),
  cantidad_cajas_lote INTEGER NOT NULL,
  peso_lote_kg NUMERIC(10,2) NOT NULL,
  posicion_en_pallet INTEGER, -- Para ubicación física
  fecha_agregado TIMESTAMPTZ DEFAULT NOW(),
  
  -- Un lote no puede estar en el mismo pallet dos veces
  UNIQUE(codigo_pallet, lote_id)
);

-- Índices para búsquedas eficientes
CREATE INDEX idx_pallets_year_pattern ON pallets (
  substring(codigo_pallet from 5 for 4)  -- Extraer año
);

CREATE INDEX idx_pallets_estado ON pallets(estado);
CREATE INDEX idx_pallet_lotes_pallet ON pallet_lotes(codigo_pallet);
CREATE INDEX idx_pallet_lotes_lote ON pallet_lotes(lote_id);
```

### **Funciones Utilitarias**
```typescript
// Extraer componentes del código
function parseCodigoCompleto(codigo: string) {
  // Detectar tipo automáticamente
  const validacion = validarCodigo(codigo)
  
  if (!validacion.valido) return null
  
  if (validacion.tipo === 'lote') {
    const match = codigo.match(/^LP-(\d{4})-CHIL-(\d{3})$/)
    if (!match) return null
    
    return {
      tipo: 'lote' as const,
      prefijo: 'LP',
      año: parseInt(match[1]),
      pais: 'CHIL',
      secuencial: parseInt(match[2]),
      valido: true
    }
  }
  
  if (validacion.tipo === 'pallet') {
    const match = codigo.match(/^PAL-(\d{4})-CHIL-(\d{5})$/)
    if (!match) return null
    
    return {
      tipo: 'pallet' as const,
      prefijo: 'PAL',
      año: parseInt(match[1]),
      pais: 'CHIL',
      secuencial: parseInt(match[2]),
      valido: true
    }
  }
  
  return null
}

// Generar siguiente código
async function generarSiguienteCodigoLote(año: number): Promise<string> {
  // Implementación que consulta BD para obtener siguiente número de lote
  const siguiente = await obtenerSiguienteSecuencialLote(año)
  return `LP-${año}-CHIL-${String(siguiente).padStart(3, '0')}`
}

async function generarSiguienteCodigoPallet(año: number): Promise<string> {
  // Implementación que consulta BD para obtener siguiente número de pallet
  const siguiente = await obtenerSiguienteSecuencialPallet(año)
  return `PAL-${año}-CHIL-${String(siguiente).padStart(5, '0')}`
}
```

## 📊 **Casos de Uso por Módulo**

### **Input Manual (ModalEscanearQR)**
- ✅ Auto-formato para lotes y pallets mientras escribe
- ✅ Validación visual en tiempo real con iconos diferenciados
- ✅ Auto-submit cuando formato completo
- ✅ Mensajes de error descriptivos por tipo

### **Generación de QR**
- ✅ Validar formato antes de generar
- ✅ Incluir tipo en metadata del QR
- ✅ Formato JSON estándar diferenciado

### **Paletizado - Integración con Códigos**
```typescript
// Flujo de paletizado
1. Escanear/ingresar código de lote: LP-2024-CHIL-001
2. Sistema genera automáticamente código de pallet: PAL-2024-CHIL-00001
3. Asociar lote(s) al pallet en tabla pallet_lotes
4. Generar QR del pallet para etiquetado
5. Mantener trazabilidad: lote → pallet → ubicación
```

### **Etiquetas de Impresión**
- ✅ Mostrar código en formato legible diferenciado
- ✅ Incluir QR con código completo
- ✅ Validar antes de imprimir
- ✅ Plantillas diferentes para lotes vs pallets

### **Búsquedas y Filtros**
- ✅ Búsqueda por código completo (lotes y pallets)
- ✅ Filtros por año (LP-2024-* o PAL-2024-*)
- ✅ Filtros por tipo de código
- ✅ Búsqueda de pallets que contengan lote específico

## 🚨 **Reglas Críticas**

### **❌ NUNCA HACER**
- Cambiar el formato sin migración de datos
- Permitir códigos con formato incorrecto
- Usar códigos duplicados
- Saltarse la validación en backend
- **Mezclar lotes y pallets en la misma tabla**
- **Perder la trazabilidad lote→pallet**

### **✅ SIEMPRE HACER**
- Validar formato en frontend Y backend
- Documentar cambios en formato
- Mantener compatibilidad con códigos existentes
- Usar constantes para el patrón regex
- **Registrar todos los movimientos de pallets**
- **Mantener integridad referencial lote-pallet**

### **⚠️ CONSIDERACIONES FUTURAS**
- **Expansión internacional**: PERU, ARGE, BRAS
- **Tipos de lote**: LP (producción), LE (exportación), LI (interno)
- **Tipos de pallet**: PAL (estándar), EXP (exportación), EUR (europeo)
- **Categorías**: LP-2024-CHIL-ORG-001 (orgánico)
- **Sub-pallets**: PAL-2024-CHIL-00001-A (subdivisiones)

## 📈 **Manejo de Trazabilidad Lote-Pallet**

### **Escenarios de Paletizado**

#### **Pallet Único (Un solo lote)**
```sql
-- Registrar el pallet
INSERT INTO pallets (codigo_pallet, tipo_pallet, destino_inicial)
VALUES ('PAL-2024-CHIL-00001', 'madera', 'Cliente A');

-- Asociar el lote completo
INSERT INTO pallet_lotes (codigo_pallet, lote_id, cantidad_cajas_lote, peso_lote_kg)
VALUES ('PAL-2024-CHIL-00001', 'LP-2024-CHIL-001', 150, 1200.5);
```

#### **Pallet Mixto (Múltiples lotes)**
```sql
-- El mismo pallet con múltiples lotes
INSERT INTO pallet_lotes (codigo_pallet, lote_id, cantidad_cajas_lote, peso_lote_kg, posicion_en_pallet) VALUES
('PAL-2024-CHIL-00002', 'LP-2024-CHIL-002', 80, 640.0, 1),
('PAL-2024-CHIL-00002', 'LP-2024-CHIL-003', 70, 560.0, 2);

-- Actualizar totales del pallet
UPDATE pallets 
SET cantidad_cajas_total = 150, peso_total_kg = 1200.0
WHERE codigo_pallet = 'PAL-2024-CHIL-00002';
```

### **Consultas de Trazabilidad**
```sql
-- ¿En qué pallet está este lote?
SELECT p.codigo_pallet, p.estado, p.ubicacion_actual
FROM pallets p
JOIN pallet_lotes pl ON p.codigo_pallet = pl.codigo_pallet
WHERE pl.lote_id = 'LP-2024-CHIL-001';

-- ¿Qué lotes contiene este pallet?
SELECT l.id, l.cultivo, l.variedad, pl.cantidad_cajas_lote, pl.peso_lote_kg
FROM lotes l
JOIN pallet_lotes pl ON l.id = pl.lote_id
WHERE pl.codigo_pallet = 'PAL-2024-CHIL-00001';

-- Historial completo de un producto
SELECT 
  l.id as lote_id,
  p.codigo_pallet,
  l.estado as estado_lote,
  p.estado as estado_pallet,
  p.ubicacion_actual
FROM lotes l
LEFT JOIN pallet_lotes pl ON l.id = pl.lote_id
LEFT JOIN pallets p ON pl.codigo_pallet = p.codigo_pallet
WHERE l.id = 'LP-2024-CHIL-001';
```

## 📝 **Historia de Versiones**

### **v2.0 (Con Pallets - PROPUESTA)**
- **Lotes**: `LP-YYYY-CHIL-NNN`
- **Pallets**: `PAL-YYYY-CHIL-NNNNN`
- Estado: 🔄 EN DESARROLLO
- Cambios: Agregado manejo completo de pallets

### **v1.0 (Solo Lotes - Actual)**
- Formato: `LP-YYYY-CHIL-NNN`
- Implementado: ✅
- Compatible con: Datos demo actuales

### **v0.1 (Incorrecto)**
- Formato: `L-YYYY-NNN` / `LT-YYYY-NNNN`
- Estado: ❌ CORREGIDO
- Problema: No era consistente ni escalable

---

## 📎 **Referencias**

- **Archivo de implementación**: `src/components/ModalEscanearQR.tsx`
- **Validaciones**: `src/lib/qrUtils.ts`
- **Datos demo**: `docs/DEMO_USER.md`
- **Base de datos**: Tabla `lotes.id` + nueva tabla `pallets`
- **Tipos**: `src/types/eventSpecificData.ts`

---

**🎯 Este formato es OBLIGATORIO para toda la aplicación KimunPulse. El manejo de pallets mantiene la misma filosofía de códigos únicos y trazabilidad completa.** 