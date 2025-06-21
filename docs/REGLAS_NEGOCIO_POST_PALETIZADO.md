# Reglas de Negocio: Flujo Post-Paletizado en KimunPulse

## 📋 **Problema Identificado y Solucionado**

### **🚨 ERROR CONCEPTUAL DETECTADO**
La UI previamente mostraba que un lote paletizado podía continuar con eventos como "Enfriado", lo cual es **conceptualmente incorrecto** según las prácticas agrícolas chilenas y los requerimientos SAG.

### **✅ CORRECCIÓN IMPLEMENTADA**
Se implementó la lógica correcta donde **después del paletizado, el lote termina su ciclo y la trazabilidad continúa por pallets individuales**.

---

## 🎯 **Reglas de Negocio Fundamentales**

### **1. Ciclo de Vida del Lote**
- **Inicio → Cosecha → Recepción → Selección → Empaque → Paletizado** ✅ **FIN DEL LOTE**
- Una vez **paletizado**, el lote NO tiene más eventos directos
- El lote se convierte en contenedor histórico y referencia

### **2. Fragmentación en Pallets**
- Un lote genera **múltiples pallets independientes** durante el paletizado
- Cada pallet tiene su propio código único: `PAL-YYYY-CHIL-NNNNN`
- Los pallets son las nuevas **unidades de seguimiento** para la trazabilidad

### **3. Flujo de Trazabilidad Post-Paletizado**
```
Lote LP-2025-CHIL-019 [PALETIZADO] → Estado FINAL
├── PAL-2025-CHIL-00001 → Enfriado → Control Calidad → Despacho
├── PAL-2025-CHIL-00002 → Enfriado → Control Calidad → Despacho
└── PAL-2025-CHIL-00003 → Enfriado → Control Calidad → Despacho
```

### **4. Eventos por Pallet (NO por Lote)**
- **Enfriado:** Ingreso a cámara frigorífica específica
- **Control de Calidad:** Inspección individual por pallet
- **Almacenaje:** Ubicación física en bodega/cámara
- **Despacho:** Asignación a contenedores/camiones

---

## 🎨 **Implementación en UI**

### **Para Lotes Paletizados:**
- ✅ **Mostrar:** "Lote Paletizado - Ciclo Completado" (mensaje verde)
- ✅ **NO mostrar:** "Siguiente paso sugerido" para el lote
- ✅ **Mostrar:** Sección "Pallets Generados" con lista de pallets
- ✅ **Permitir:** Acciones individuales por pallet

### **Para Lotes NO Paletizados:**
- ✅ **Mostrar:** "Siguiente paso sugerido" normal
- ✅ **Continuar:** Flujo tradicional de eventos de lote

### **Indicadores Visuales:**
- 🟢 **Verde:** Lote completado (paletizado)
- 🔵 **Azul:** Información de pallets
- 🟡 **Amarillo:** Advertencias (pallets no registrados)
- 🟠 **Naranja:** Próximas acciones por pallet

---

## 🏭 **Realidad Operativa Chilena**

### **Proceso Real en Empresas Agrícolas:**
1. **Packing:** Lote se empaca en cajas
2. **Paletizado:** Cajas se agrupan en pallets
3. **Cámaras Frigoríficas:** **PALLETS** (no lotes) van a enfriado
4. **Control de Calidad:** Inspección por **PALLET individual**
5. **Despacho:** **PALLETS** se asignan a contenedores/exportación

### **Requerimientos SAG:**
- Trazabilidad completa desde lote hasta pallet final
- Registro detallado de temperaturas por pallet en cámaras
- Control individual de calidad por unidad exportable (pallet)
- Identificación específica de responsables por cada evento

---

## 📊 **Funciones Implementadas**

### **En `DetallesLote.tsx`:**
```typescript
// Determina si lote fue paletizado
const fuePaletizado = () => {
  const estadosPaletizados = ['Paletizado', 'En Cámara', 'Listo Despacho']
  return estadosPaletizados.includes(lote?.estado || '') || 
         eventosPaletizado.includes(lote?.ultimo_evento || '')
}

// NO sugiere próximos pasos para lotes paletizados
const getSiguienteAccionSugerida = () => {
  if (fuePaletizado()) {
    return null // NO hay siguiente acción para lotes paletizados
  }
  // ... lógica para lotes en proceso
}
```

### **Carga de Pallets:**
- Detecta automáticamente lotes paletizados
- Carga información de pallets asociados
- Muestra estado individual de cada pallet
- Permite acciones específicas por pallet

---

## 🚀 **Próximos Desarrollos Requeridos**

### **1. Vista de Gestión de Pallets**
- Panel dedicado para gestionar pallets individuales
- Registro de eventos por pallet (Enfriado, Control Calidad, etc.)
- Seguimiento de ubicación en tiempo real

### **2. Integración con Cámaras Frigoríficas**
- Asignación de pallets a cámaras específicas
- Monitoreo de temperatura por pallet
- Alertas de condiciones críticas

### **3. Formularios Específicos por Pallet**
- Formulario de enfriado con datos SAG
- Control de calidad individual por pallet
- Registro de despacho y asignación a contenedores

### **4. Reportes de Trazabilidad**
- Seguimiento completo: Lote → Pallets → Eventos
- Reportes SAG específicos por pallet
- Historial completo para auditorías

---

## ⚠️ **Reglas Críticas**

### **❌ NO PERMITIDO:**
- Registrar eventos de enfriado en el lote después del paletizado
- Mostrar "siguiente paso" para lotes paletizados
- Manejar cámara frigorífica a nivel de lote

### **✅ REQUERIDO:**
- Fragmentar trazabilidad en pallets post-paletizado
- Registrar eventos individuales por pallet
- Mantener referencia histórica del lote original
- Seguir estándares SAG de trazabilidad por unidad exportable

---

## 🔍 **Validación Implementada**

La UI ahora refleja correctamente que:
1. **Un lote paletizado NO puede ir directamente a cámara**
2. **Son los pallets los que continúan el flujo de trazabilidad**
3. **Cada pallet es una unidad independiente de seguimiento**
4. **El lote sirve como contenedor histórico y de referencia**

Esta corrección asegura que KimunPulse refleje fielmente los procesos operativos reales de la industria agrícola chilena y cumpla con los requerimientos de trazabilidad del SAG. 