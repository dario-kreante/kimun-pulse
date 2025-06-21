# Eventos de Trazabilidad SAG - KimunPulse

## Estructura de Eventos

KimunPulse maneja dos tipos de eventos de trazabilidad:

1. **Eventos de Lotes** (`eventos_trazabilidad`): Para eventos pre-paletizado
2. **Eventos de Pallets** (`eventos_pallet`): Para eventos post-paletizado

### Campos Comunes

#### Tabla: eventos_trazabilidad
```sql
- id (uuid) - Identificador único del evento
- lote_id (text) - Código del lote (formato: LP-YYYY-CHIL-NNN)
- tipo (enum) - Tipo de evento
- fecha (timestamp) - Fecha y hora del evento
- descripcion (text) - Descripción del evento
- responsable_id (uuid) - ID del usuario responsable
- responsable_nombre (text) - Nombre del responsable
- datos_adicionales (jsonb) - Datos específicos del evento
- created_at (timestamp) - Fecha de creación
```

#### Tabla: eventos_pallet
```sql
- id (uuid) - Identificador único del evento
- codigo_pallet (text) - Código del pallet (formato: PAL-YYYY-CHIL-NNNNN)
- tipo (enum) - Tipo de evento
- descripcion (text) - Descripción del evento
- responsable_nombre (text) - Nombre del responsable
- datos_adicionales (jsonb) - Datos específicos del evento
- fecha (timestamp) - Fecha y hora del evento
- created_at (timestamp) - Fecha de creación
- updated_at (timestamp) - Fecha de última actualización
```

## Eventos de Lotes (Pre-Paletizado)

### 1. Inicio Cosecha
**Propósito**: Registrar el inicio de la cosecha de un lote en campo
**Compatibilidad SAG**: ✅ Cumple requerimientos de trazabilidad origen

#### Datos Adicionales:
```json
{
  "turno": "mañana|tarde|noche",
  "operario_nombre": "string",
  "temperatura_ambiente": "number (°C)",
  "humedad_relativa": "number (%)",
  "observaciones": "string",
  "equipo": "string", // Equipo de cosecha utilizado
  "madurez": "string", // Estado de madurez
  "temp_ambiente": "string", // Temperatura ambiente al inicio
  "equipo_cosecha": "string", // Manual/Mecánico
  "color": "string", // Color de la fruta
  "firmeza": "string", // Firmeza de la fruta
  "punto_madurez": "string" // Grados Brix u otra medida
}
```

#### Validaciones SAG:
- ✅ Ubicación del cuartel registrada
- ✅ Operario responsable identificado
- ✅ Condiciones climáticas documentadas
- ✅ Estado de madurez registrado

### 2. Cosecha Completa
**Propósito**: Registrar la finalización de la cosecha de un lote
**Compatibilidad SAG**: ✅ Cumple requerimientos de rendimiento y calidad

#### Datos Adicionales:
```json
{
  "turno": "mañana|tarde|noche",
  "operario_nombre": "string",
  "temperatura_ambiente": "number (°C)",
  "humedad_relativa": "number (%)",
  "observaciones": "string",
  "hora_termino": "string (HH:MM)",
  "calidad_visual": "excelente|buena|regular",
  "numero_bins_llenos": "number",
  "cantidad_cosechada_kg": "number",
  "merma_estimada_porcentaje": "number",
  "brix": "string", // Grados Brix
  "calidad": "string", // Clasificación de calidad
  "rendimiento_total": "string", // Toneladas totales
  "rendimiento_ha": "string", // Toneladas por hectárea
  "calibre_promedio": "string" // Calibre promedio de la fruta
}
```

#### Validaciones SAG:
- ✅ Rendimiento por hectárea calculado
- ✅ Calidad de fruta evaluada
- ✅ Merma estimada documentada
- ✅ Cantidad total cosechada registrada

### 3. Recepción Packing
**Propósito**: Registrar la recepción de la fruta en planta de procesamiento
**Compatibilidad SAG**: ✅ Cumple cadena de custodia y trazabilidad

#### Datos Adicionales:
```json
{
  "turno": "mañana|tarde|noche",
  "operario_nombre": "string",
  "temperatura_ambiente": "number (°C)",
  "humedad_relativa": "number (%)",
  "observaciones": "string",
  "hora_llegada": "string (HH:MM)",
  "transportista": "string",
  "condicion_fruta": "excelente|buena|regular",
  "numero_lote_interno": "string", // LI-YYYY-NNN
  "temperatura_llegada": "number (°C)",
  "numero_bins_recibidos": "number",
  "numero_guia_recepcion": "string", // GR-NNNNN
  "peso_total_recibido_kg": "number",
  "temp_fruta": "string", // Temperatura de la fruta
  "lote_transporte": "string", // Código de transporte
  "estado_contenedores": "string", // Estado de bins/contenedores
  "temp_final": "string", // Temperatura final
  "temp_inicial": "string", // Temperatura inicial
  "hidroenfriado": "string", // Si se aplicó hidroenfriado
  "estado": "string", // Estado general
  "preseleccion": "string" // Si hubo preselección
}
```

#### Validaciones SAG:
- ✅ Cadena de frío documentada
- ✅ Peso recibido vs enviado verificado
- ✅ Estado de contenedores registrado
- ✅ Transportista identificado
- ✅ Número de guía de recepción único

### 4. Selección
**Propósito**: Registrar el proceso de selección y clasificación de fruta
**Compatibilidad SAG**: ✅ Cumple clasificación y control de calidad

#### Datos Adicionales:
```json
{
  "turno": "mañana|tarde|noche",
  "operario_nombre": "string",
  "temperatura_ambiente": "number (°C)",
  "humedad_relativa": "number (%)",
  "observaciones": "string",
  "linea_seleccion": "string", // Línea A, B, C, etc.
  "criterios_seleccion": ["string"], // Array de criterios
  "porcentaje_descarte": "number",
  "defectos_principales": ["string"], // Array de defectos
  "peso_seleccionado_kg": "number",
  "personal_seleccionadores": "number",
  "velocidad_linea_cajas_hora": "number",
  "descarte": "string", // Porcentaje de descarte
  "operarios": "number", // Número de operarios
  "calibre_principal": "string", // Calibre predominante
  "calibre_L": "string", // Porcentaje calibre L
  "calibre_XL": "string", // Porcentaje calibre XL
  "export_rate": "string", // Porcentaje exportación
  "linea": "string", // Tipo de línea
  "velocidad": "string", // Velocidad de línea
  "efficiency": "string", // Eficiencia de línea
  "peso_entrada_kg": "number",
  "peso_descarte_kg": "number",
  "porcentaje_categoria_1": "number",
  "porcentaje_categoria_2": "number",
  "eficiencia_linea": "number",
  "operarios_seleccion": ["string"] // Array de operarios
}
```

#### Validaciones SAG:
- ✅ Criterios de selección documentados
- ✅ Porcentajes de cada categoría registrados
- ✅ Defectos principales identificados
- ✅ Trazabilidad de operarios de selección
- ✅ Velocidad y eficiencia de línea documentada

### 5. Empaque
**Propósito**: Registrar el empaque final de la fruta
**Compatibilidad SAG**: ✅ Cumple requerimientos de empaque y etiquetado

#### Datos Adicionales:
```json
{
  "turno": "mañana|tarde|noche",
  "operario_nombre": "string",
  "temperatura_ambiente": "number (°C)",
  "humedad_relativa": "number (%)",
  "observaciones": "string",
  "codigo_plu": "string", // Código PLU del producto
  "formato_caja": "string", // 500g, 1kg, etc.
  "tipo_empaque": "string", // cajas, bandejas, clamshells
  "linea_empaque": "string", // Línea de empaque
  "operarios_empaque": ["string"], // Array de operarios
  "etiquetas_utilizadas": ["string"], // Array de etiquetas
  "peso_promedio_caja_kg": "number",
  "cantidad_cajas_producidas": "number",
  "destino": "string", // Mercado destino
  "formato": "string", // Formato específico
  "cajas_producidas": "number",
  "encerado": "string" // Si se aplicó cera
}
```

#### Validaciones SAG:
- ✅ Código PLU válido registrado
- ✅ Formato de empaque documentado
- ✅ Etiquetas utilizadas identificadas
- ✅ Peso promedio por caja controlado
- ✅ Cantidad producida registrada
- ✅ Mercado destino identificado

### 6. Paletizado
**Propósito**: Registrar la formación de pallets (fin del ciclo de lote)
**Compatibilidad SAG**: ✅ Cumple trazabilidad de unidades de exportación

#### Datos Adicionales:
```json
{
  "turno": "mañana|tarde|noche",
  "operario_nombre": "string",
  "temperatura_ambiente": "number (°C)",
  "humedad_relativa": "number (%)",
  "observaciones": "string",
  "tipo_pallet": "madera|plastico",
  "pallet_mixto": "boolean", // Si contiene diferentes productos
  "numero_pallet": "string", // PAL-YYYY-CHIL-NNNNN
  "destino_inicial": "string", // Destino del pallet
  "resumen_pallets": [
    {
      "peso": "number",
      "cajas": "number",
      "mixto": "boolean",
      "codigo": "string"
    }
  ],
  "estado_etiquetado": "completo|pendiente",
  "pallets_generados": [
    {
      "pallet_mixto": "boolean",
      "numero_pallet": "string",
      "estado_etiquetado": "string",
      "cantidad_cajas_lote": "number",
      "peso_lote_en_pallet_kg": "number"
    }
  ],
  "cantidad_cajas_lote": "number",
  "peso_lote_en_pallet_kg": "number",
  "control_peso_verificado": "boolean",
  "observaciones_paletizado": "string",
  "cantidad_pallets_generados": "number",
  "codigo_pallet": "string", // Para compatibilidad
  "pallets_total": "number",
  "cajas_por_pallet": "number",
  "film": "string", // Si se aplicó film
  "pallets": "number" // Número total de pallets
}
```

#### Validaciones SAG:
- ✅ Códigos únicos de pallet generados
- ✅ Peso total verificado
- ✅ Número de cajas por pallet documentado
- ✅ Estado de etiquetado verificado
- ✅ Trazabilidad bidireccional lote ↔ pallets

## Eventos de Pallets (Post-Paletizado)

### 7. Enfriado
**Propósito**: Registrar el proceso de enfriamiento en cámara frigorífica
**Compatibilidad SAG**: ✅ Cumple cadena de frío y conservación

#### Datos Adicionales:
```json
{
  "turno": "mañana|tarde|noche",
  "operario_nombre": "string",
  "observaciones": "string",
  "sistema_control": "automatico|manual",
  "camara_frigorifica": "string", // CAM-XXX
  "responsable_camara": "string",
  "temperatura_inicial": "number (°C)",
  "temperatura_objetivo": "number (°C)",
  "tiempo_enfriado_horas": "number",
  "humedad_relativa_porcentaje": "number",
  "numero_registros_temperatura": "number",
  "temperatura_minima_alcanzada": "number (°C)",
  "temperatura_maxima_registrada": "number (°C)",
  "velocidad_aire_ms": "number", // Velocidad del aire m/s
  "humedad_relativa": "number" // Humedad relativa %
}
```

#### Validaciones SAG:
- ✅ Cámara frigorífica identificada
- ✅ Curva de enfriamiento documentada
- ✅ Responsable de cámara asignado
- ✅ Parámetros ambientales controlados
- ✅ Tiempo de enfriado registrado

### 8. Control Calidad
**Propósito**: Registrar inspección de calidad SAG/certificación
**Compatibilidad SAG**: ✅ Cumple certificación de exportación

#### Datos Adicionales:
```json
{
  "turno": "mañana|tarde|noche",
  "operario_nombre": "string",
  "observaciones": "string",
  "inspector_calidad": "string",
  "resultado_general": "aprobado|rechazado|condicional",
  "certificado_calidad": "string", // AA-YYYYMM
  "muestra_analizada_kg": "number",
  "parametros_evaluados": {
    "brix_grados": "number",
    "diametro_mm": "number",
    "firmeza_kg_cm2": "number",
    "peso_promedio_g": "number",
    "acidez_porcentaje": "number",
    "maduracion_escala": "number (1-10)",
    "defectos_externos_porcentaje": "number",
    "defectos_internos_porcentaje": "number"
  },
  "observaciones_tecnicas": "string",
  "certificacion_inspector": "string", // Número de certificación
  "tratamientos_requeridos": ["string"] // Array de tratamientos
}
```

#### Validaciones SAG:
- ✅ Inspector certificado identificado
- ✅ Parámetros físico-químicos medidos
- ✅ Certificado de calidad único
- ✅ Resultado de inspección documentado
- ✅ Tratamientos requeridos registrados

### 9. Despacho
**Propósito**: Registrar despacho y salida para exportación
**Compatibilidad SAG**: ✅ Cumple trazabilidad de exportación

#### Datos Adicionales:
```json
{
  "turno": "mañana|tarde|noche",
  "operario_nombre": "string",
  "observaciones": "string",
  "destino_pais": "string",
  "puerto_embarque": "string",
  "naviera_transporte": "string",
  "numero_contenedor": "string",
  "sello_sag": "string", // SELLO-SAG-NNNNN
  "temperatura_despacho": "number (°C)",
  "responsable_despacho": "string",
  "numero_guia_despacho": "string", // GD-NNNNN
  "peso_neto_despacho_kg": "number",
  "numero_documento_exportacion": "string",
  "fecha_estimada_llegada": "string (YYYY-MM-DD)",
  "condiciones_transporte": "string",
  "verificacion_contenedor": "string",
  "cliente_final": "string",
  "mercado_destino": "string"
}
```

#### Validaciones SAG:
- ✅ Sello SAG único generado
- ✅ Destino país identificado
- ✅ Puerto de embarque registrado
- ✅ Naviera/transportista documentado
- ✅ Número de contenedor único
- ✅ Documentos de exportación vinculados
- ✅ Condiciones de transporte verificadas

## Códigos y Formatos SAG

### Formatos de Códigos:
- **Lotes**: `LP-YYYY-CHIL-NNN` (ej: LP-2025-CHIL-001)
- **Pallets**: `PAL-YYYY-CHIL-NNNNN` (ej: PAL-2025-CHIL-00001)
- **Certificados**: `AA-YYYYMM` (ej: AA-202501)
- **Sellos SAG**: `SELLO-SAG-NNNNN` (ej: SELLO-SAG-00001)
- **Guías**: `GR-NNNNN` (recepción), `GD-NNNNN` (despacho)
- **Lotes Internos**: `LI-YYYY-NNN` (ej: LI-2025-001)

### Campos Obligatorios por Evento:

#### Eventos de Lote:
- `operario_nombre`: Operario responsable
- `turno`: Turno de trabajo
- `temperatura_ambiente`: Condiciones ambientales
- `humedad_relativa`: Humedad relativa

#### Eventos de Pallet:
- `operario_nombre`: Operario responsable  
- `turno`: Turno de trabajo
- Campos específicos según tipo de evento

### Trazabilidad Bidireccional:

```
Lote → Eventos Lote → Paletizado → Pallets → Eventos Pallet → Exportación
  ↑                                   ↓
  └─────────── Trazabilidad Completa ──────────┘
```

### Validaciones de Integridad:

1. **Secuencia de Eventos**: Cada evento debe seguir el orden lógico
2. **Códigos Únicos**: Ningún código puede duplicarse
3. **Referencias Válidas**: Todos los IDs deben existir
4. **Fechas Coherentes**: Las fechas deben ser secuenciales
5. **Campos Obligatorios**: Todos los campos requeridos por SAG deben estar presentes

### Reportes SAG Disponibles:

1. **Trazabilidad Completa**: Desde cosecha hasta exportación
2. **Certificados de Calidad**: Todos los certificados emitidos
3. **Cadena de Frío**: Historial de temperaturas
4. **Despachos**: Todos los despachos de exportación
5. **Defectos**: Análisis de defectos por lote/pallet 