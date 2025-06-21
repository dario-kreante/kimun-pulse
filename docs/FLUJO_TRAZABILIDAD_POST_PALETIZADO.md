# Flujo de Trazabilidad Post-Paletizado - Mercado Chileno 🇨🇱

## 📊 **Resumen Ejecutivo**

Basado en la investigación del mercado frutícola chileno y las prácticas de la industria, este documento define el flujo de trazabilidad después del paletizado, resolviendo las preguntas críticas sobre el manejo de lotes, pallets, envases, pesos y taras.

## 🔍 **Análisis del Mercado Chileno**

### **Realidad del Paletizado en Chile**

**SÍ, de UN LOTE pueden salir VARIOS PALLETS** - Esta es la práctica estándar en Chile:

#### **Ejemplos Reales:**
- **Lote LP-2025-CHIL-022** (150 cajas, 1,200 kg) puede generar:
  - PAL-2025-CHIL-00001 (60 cajas, 480 kg)
  - PAL-2025-CHIL-00002 (50 cajas, 400 kg) 
  - PAL-2025-CHIL-00003 (40 cajas, 320 kg)

#### **Factores que Determinan División:**
1. **Destinos diferentes** (Exportación vs Nacional)
2. **Calidades distintas** (Premium vs Estándar)
3. **Fechas de envío** (Inmediato vs Almacenamiento)
4. **Limitaciones físicas** (Altura máxima, peso contenedor)
5. **Clientes específicos** (Cada cliente puede requerir pallets separados)

## 🎯 **Flujo Propuesto para KimunPulse**

### **Fase 1: Paletizado (Estado Actual)**
```
LOTE LP-2025-CHIL-022
└── Evento: "Paletizado" ✅ (Ya implementado)
    └── Resultado: Lote marcado como "paletizado"
    └── PROBLEMA: No hay pallets registrados ❌
```

### **Fase 2: Creación de Pallets (NUEVA)**
```
LOTE LP-2025-CHIL-022 (paletizado)
├── PAL-2025-CHIL-00001 (Destino: Exportación USA)
├── PAL-2025-CHIL-00002 (Destino: Exportación Europa) 
└── PAL-2025-CHIL-00003 (Destino: Mercado Nacional)
```

### **Fase 3: Eventos Post-Paletizado (POR PALLET)**
```
Cada pallet sigue su propio ciclo:

PAL-2025-CHIL-00001:
├── Enfriado (Cámara 1, -0.5°C)
├── Control Calidad (Aprobado)
├── Almacenamiento (Sector A-12)
├── Consolidación (Contenedor MSKU123)
└── Despacho (Puerto San Antonio → LA)

PAL-2025-CHIL-00002:
├── Enfriado (Cámara 2, -1°C)
├── Control Calidad (Aprobado)
└── Almacenamiento (Sector B-05)
    └── [Esperando consolidación Europa]

PAL-2025-CHIL-00003:
├── Control Calidad (Aprobado)
└── Despacho Directo (Mercado Nacional)
```

## 📋 **Solución Técnica Implementada**

### **1. Modelo de Datos Híbrido**

#### **Nivel LOTE (Pre-Paletizado)**
```typescript
Eventos: [
  "Inicio Cosecha",
  "Cosecha Completa", 
  "Recepción Packing",
  "Selección",
  "Empaque",
  "Paletizado" ← PUNTO DE INFLEXIÓN
]
```

#### **Nivel PALLET (Post-Paletizado)**
```typescript
Eventos por Pallet: [
  "Enfriado",           // Cámara frigorífica específica
  "Control Calidad",    // Inspección por pallet
  "Almacenamiento",     // Ubicación en bodega
  "Consolidación",      // Agrupación para envío
  "Despacho"           // Envío al cliente final
]
```

### **2. Trazabilidad Completa**

#### **Estructura de Seguimiento:**
```
LOTE → PALLETS → UBICACIONES → CLIENTES

LP-2025-CHIL-022
├── PAL-2025-CHIL-00001
│   ├── Cámara 1 → Sector A-12 → Contenedor MSKU123
│   └── Cliente: Walmart USA
├── PAL-2025-CHIL-00002  
│   ├── Cámara 2 → Sector B-05
│   └── Cliente: Carrefour Francia
└── PAL-2025-CHIL-00003
    ├── Sin cámara → Despacho directo
    └── Cliente: Jumbo Chile
```

## ⚖️ **Gestión de Pesos y Envases**

### **Control de Peso por Pallet**

#### **Componentes del Peso:**
```typescript
interface PesoPallet {
  peso_bruto_kg: number;      // Peso total
  peso_neto_kg: number;       // Fruta solamente
  peso_envases_kg: number;    // Cajas + separadores
  peso_pallet_kg: number;     // Pallet de madera
  tara_total_kg: number;      // Envases + pallet
}

// Validación automática
peso_bruto = peso_neto + tara_total
```

#### **Ejemplo Práctico:**
```
PAL-2025-CHIL-00001:
├── Peso bruto: 523 kg
├── Peso neto fruta: 480 kg  
├── Peso cajas (60x0.5kg): 30 kg
├── Peso separadores: 8 kg
├── Peso pallet: 5 kg
└── Tara total: 43 kg ✅ (30+8+5)
```

### **Gestión de Envases**

#### **Registro Detallado:**
```typescript
interface EnvasesPallet {
  tipo_caja: string;          // "Clamshell 500g", "Bandeja 2kg"
  cantidad_cajas: number;     // 60 cajas
  peso_caja_vacia: number;    // 0.5 kg por caja
  separadores_carton: number; // 8 unidades
  peso_separador: number;     // 1 kg por separador
  etiquetas_aplicadas: string[]; // Códigos de barras
}
```

## 🔄 **Casos de Uso Específicos**

### **Caso 1: Pallet Mixto (Multiple Lotes)**
```
PAL-2025-CHIL-00004 (Pallet Mixto):
├── LP-2025-CHIL-020 (30 cajas, 240 kg) - Parte superior
├── LP-2025-CHIL-021 (25 cajas, 200 kg) - Parte media  
└── LP-2025-CHIL-022 (15 cajas, 120 kg) - Parte inferior
Total: 70 cajas, 560 kg
```

### **Caso 2: Re-paletizado**
```
Situación: Pallet PAL-2025-CHIL-00001 necesita dividirse

ANTES:
PAL-2025-CHIL-00001 (60 cajas, destino USA)

DESPUÉS:
├── PAL-2025-CHIL-00001A (40 cajas, destino USA Costa Este)
└── PAL-2025-CHIL-00001B (20 cajas, destino USA Costa Oeste)
```

### **Caso 3: Diferentes Destinos Temperatura**
```
LOTE LP-2025-CHIL-022 → División por temperatura:

├── PAL-2025-CHIL-00001 (Exportación)
│   └── Enfriado: -0.5°C, 24 horas
├── PAL-2025-CHIL-00002 (Exportación Premium)  
│   └── Enfriado: -1°C, 48 horas
└── PAL-2025-CHIL-00003 (Nacional)
    └── Sin enfriado: Temperatura ambiente
```

## 🎛️ **Implementación en UI**

### **Modal Agregar Evento Mejorado**

#### **Para Lotes Post-Paletizado:**
```typescript
if (lote.ultimo_evento === 'Paletizado') {
  mostrarSelector: {
    opciones: ['Nivel Lote', 'Nivel Pallet'],
    default: 'Nivel Pallet'
  }
}

if (modoSeleccionado === 'Nivel Pallet') {
  requerirCampo: 'codigo_pallet',
  validarFormato: 'PAL-YYYY-CHIL-NNNNN',
  eventosDisponibles: [
    'Enfriado',
    'Control Calidad', 
    'Almacenamiento',
    'Consolidación',
    'Despacho'
  ]
}
```

### **Vista de Detalles de Lote**

#### **Sección Pallets (Nueva):**
```typescript
if (lote.ultimo_evento === 'Paletizado') {
  mostrarSeccion: 'Estado de Pallets',
  contenido: {
    alertaSiVacio: 'Acción Requerida: Crear Pallets',
    listaPallets: 'Grid con estado y ubicación',
    resumenConsolidado: 'Total cajas, peso, pallets'
  }
}
```

## 📊 **Métricas y Control**

### **KPIs por Pallet:**
- **Tiempo en cámara**: Desde entrada hasta salida
- **Temperatura promedio**: Control de cadena de frío
- **Tiempo hasta despacho**: Eficiencia logística
- **Pérdidas por calidad**: % descarte por pallet

### **Validaciones Automáticas:**
```typescript
// Al crear pallet
validar_peso_total_vs_lote_origen()
validar_suma_cajas_no_excede_lote()
validar_trazabilidad_completa()

// En cada evento
validar_secuencia_eventos_pallet()
validar_ubicacion_disponible()
validar_temperatura_requerida()
```

## 🚀 **Plan de Implementación**

### **Fase 1 - Inmediata (Esta Semana)**
1. ✅ **Crear tipos TypeScript** para eventos post-pallet
2. ✅ **Modificar ModalAgregarEvento** con selector dual
3. ✅ **Actualizar DetallesLote** con sección pallets
4. 🔄 **Crear modal "Registrar Pallets"**

### **Fase 2 - Corto Plazo (Próxima Semana)**
1. **Formularios específicos** para cada evento pallet
2. **Validaciones de peso** y envases
3. **Vista consolidada** de pallets por lote
4. **Reportes** de estado post-paletizado

### **Fase 3 - Mediano Plazo (2-3 Semanas)**
1. **Dashboard pallets** en tiempo real
2. **Alertas** de temperatura y ubicación
3. **Integración** con sistemas de cámaras
4. **Exportación** de documentos SAG

## ✅ **Beneficios de la Solución**

### **Para el Productor:**
- ✅ **Trazabilidad completa** desde lote hasta cliente final
- ✅ **Control de calidad** por pallet individual
- ✅ **Optimización logística** con múltiples destinos
- ✅ **Cumplimiento SAG** automático

### **Para el Operador:**
- ✅ **UI simple** con flujo intuitivo
- ✅ **Validaciones automáticas** evitan errores
- ✅ **Información contextual** en cada paso
- ✅ **Alertas proactivas** para acciones requeridas

### **Para la Administración:**
- ✅ **Visibilidad total** del proceso
- ✅ **Métricas en tiempo real** 
- ✅ **Reportes automáticos** para SAG
- ✅ **Auditoría completa** de todas las operaciones

---

## 🎯 **Próximos Pasos Inmediatos**

1. **Registrar pallets** para lote LP-2025-CHIL-022
2. **Probar flujo completo** de evento nivel pallet
3. **Validar métricas** de peso y ubicación
4. **Documentar casos específicos** encontrados

**¿Continuamos con la implementación del modal "Registrar Pallets"?** 