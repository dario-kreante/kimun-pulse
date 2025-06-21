# Flujo de Trazabilidad Agrícola Post-Cosecha - KimunPulse

## 📋 Flujo Correcto Según Realidad Empresarial Chilena

### **Secuencia Obligatoria de Eventos**

#### **1. Inicio Cosecha** ⭐ *Evento de Campo*
- **Ubicación**: Cuartel productivo
- **Responsable**: Capataz de cosecha  
- **Datos críticos**:
  - Fecha y hora inicio
  - Condiciones climáticas
  - Personal asignado
  - Estimación de rendimiento
- **Validación SAG**: Identificación del cuartel y variedad

#### **2. Cosecha Completa** ⭐ *Evento de Campo*
- **Ubicación**: Cuartel productivo
- **Responsable**: Capataz de cosecha
- **Datos críticos**:
  - Kilos totales cosechados
  - Número de bins utilizados
  - Rendimiento real vs estimado
  - Calidad visual inicial
- **Validación SAG**: Cantidad exacta para trazabilidad

#### **3. Recepción Packing** ⭐ *Evento de Planta*
- **Ubicación**: Planta de packing
- **Responsable**: Supervisor de recepción
- **Datos críticos**:
  - Guía de recepción oficial
  - Transportista
  - Temperatura de llegada
  - Estado de la fruta
  - Peso por bin
- **Validación SAG**: **PUNTO CRÍTICO** - Verificación de cadena de frío

#### **4. Selección** ⭐ *Evento de Planta*
- **Ubicación**: Línea de selección
- **Responsable**: Operador de línea
- **Datos críticos**:
  - Porcentaje de descarte
  - Clasificación por calibres
  - Defectos encontrados
  - Velocidad de línea
- **Validación SAG**: Trazabilidad de rechazos

#### **5. Empaque** ⭐ *Evento de Planta*
- **Ubicación**: Línea de empaque
- **Responsable**: Supervisor de empaque
- **Datos críticos**:
  - Tipo de envase utilizado
  - Cantidad de cajas producidas
  - Peso neto por caja
  - Etiquetado aplicado
- **Validación SAG**: Códigos de trazabilidad en envases

#### **6. Paletizado** 🔄 *Evento Crítico*
- **Ubicación**: Zona de paletizado
- **Responsable**: Operador de montacargas
- **Datos críticos**:
  - Código único del pallet
  - Cantidad de cajas por pallet
  - Destino comercial
  - Peso total del pallet
  - Lotes consolidados (si aplica)
- **Validación SAG**: **PUNTO DE CONTROL** - Cada pallet debe tener trazabilidad completa

---

## 🎯 **DESPUÉS DEL PALETIZADO - CAMBIO DE PARADIGMA**

### **Post-Paletizado: Gestión por Pallet Individual**

Una vez que se completa el paletizado, **el sistema de trazabilidad cambia**:
- ✅ **Eventos a nivel de lote**: Solo para observaciones generales
- ✅ **Eventos a nivel de pallet**: Para procesos específicos

#### **7. Enfriado** ❄️ *Evento de Pallet*
- **Ubicación**: Cámara frigorífica
- **Datos críticos**:
  - Código de cámara asignada
  - Temperatura objetivo
  - Humedad objetivo  
  - Tiempo de proceso estimado
  - Control de temperatura real
- **Validación SAG**: **CRÍTICO** - Registro continuo de temperatura

#### **8. Control de Calidad** 🔍 *Evento de Pallet/Lote*
- **Ubicación**: Laboratorio/Cámara
- **Modalidades**:
  - **Por pallet**: Muestreo específico
  - **Por lote**: Control general de calidad
- **Datos críticos**:
  - Resultados de análisis
  - Certificaciones obtenidas
  - Acciones correctivas
- **Validación SAG**: Certificados oficiales

#### **9. Despacho** 🚛 *Evento de Pallet*
- **Ubicación**: Muelle de carga
- **Datos críticos**:
  - Número de factura
  - Guía de despacho
  - Transportista final
  - Cliente destino
  - Control de temperatura de salida
- **Validación SAG**: **PUNTO FINAL** - Documentación completa de exportación

---

## 🔧 **Correcciones Implementadas**

### **Problemas Identificados en el Código Actual**

1. **❌ Eventos desordenados cronológicamente**
   - Los datos muestran eventos fuera de secuencia
   - Necesario validar orden temporal

2. **❌ Flujo post-paletizado incorrecto**
   - Eventos asignados incorrectamente a lotes en lugar de pallets
   - Falta diferenciación entre gestión de lote vs pallet

3. **❌ Estados de lote inconsistentes**
   - Estados no reflejan la realidad del proceso
   - Falta sincronización entre eventos y estados

### **Soluciones Implementadas**

#### **1. Validación de Secuencia Temporal**
```typescript
// En eventosService
const validarSecuenciaEvento = async (loteId: string, nuevoEvento: TipoEvento) => {
  // Validar que el evento sigue la secuencia correcta
  const eventosExistentes = await obtenerHistorialLote(loteId)
  const secuenciaCorrecta = [
    'Inicio Cosecha', 'Cosecha Completa', 'Recepción Packing',
    'Selección', 'Empaque', 'Paletizado', 'Enfriado',
    'Control Calidad', 'Despacho'
  ]
  // Lógica de validación...
}
```

#### **2. Gestión Dual: Lote vs Pallet**
```typescript
// Después de paletizado, eventos específicos van al pallet
if (estadoLote === 'Paletizado') {
  // Modo dual: eventos de lote vs eventos de pallet
  modoEvento = esEventoEspecifico(tipoEvento) ? 'pallet' : 'lote'
}
```

#### **3. Estados Consistentes con Realidad**
- **Producción**: Inicio Cosecha → Cosecha Completa
- **Planta**: Recepción Packing → Selección → Empaque → Paletizado  
- **Post-Producción**: En Cámara → Listo Despacho → Despachado

---

## 📊 **Beneficios del Flujo Corregido**

### **Para Empresas Agrícolas**
- ✅ Cumplimiento normativo SAG automático
- ✅ Trazabilidad completa exportación
- ✅ Control de cadena de frío
- ✅ Gestión eficiente de pallets

### **Para Operadores**
- ✅ Flujo intuitivo que sigue el proceso real
- ✅ Validaciones que previenen errores
- ✅ Formularios específicos por etapa
- ✅ Menos tiempo en documentación

### **Para Auditores**
- ✅ Información ordenada cronológicamente
- ✅ Puntos de control claros
- ✅ Documentación SAG completa
- ✅ Trazabilidad verificable

---

## ⚠️ **Puntos Críticos para SAG**

1. **Control de Temperatura**: Registro continuo en cámara frigorífica
2. **Trazabilidad de Pallet**: Cada pallet debe tener historia completa
3. **Documentación de Transporte**: Guías y facturas correlacionadas
4. **Certificación de Calidad**: Análisis documentados por lote/pallet
5. **Identificación de Origen**: Cuartel y variedad trazables hasta destino

---

*Este flujo corregido refleja la realidad operacional de empresas exportadoras de fruta en Chile y garantiza el cumplimiento normativo SAG.* 