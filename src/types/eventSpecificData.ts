// Tipos para datos específicos de eventos según requerimientos SAG Chile
export interface DatosEventoBase {
  operario_id?: string
  operario_nombre: string
  turno?: 'mañana' | 'tarde' | 'noche'
  observaciones?: string
  temperatura_ambiente?: number
  humedad_relativa?: number
}

// Evento: Inicio Cosecha
export interface DatosInicioCosecha extends DatosEventoBase {
  cuadrilla_id?: string
  cuadrilla_asignada: string[]
  supervisor_campo: string
  hora_inicio: string
  condiciones_climaticas: 'soleado' | 'nublado' | 'parcialmente_nublado' | 'lluvia_ligera' | 'viento'
  sector_cosecha: string
  metodo_cosecha: 'manual' | 'mecanizado' | 'mixto'
  herramientas_utilizadas: string[]
}

// Evento: Cosecha Completa  
export interface DatosCosechaCompleta extends DatosEventoBase {
  hora_termino: string
  cantidad_cosechada_kg: number
  numero_bins_llenos: number
  merma_estimada_porcentaje: number
  calidad_visual: 'excelente' | 'buena' | 'regular' | 'deficiente'
}

// Evento: Recepción Packing
export interface DatosRecepcionPacking extends DatosEventoBase {
  numero_guia_recepcion: string
  transportista: string
  numero_bins_recibidos: number
  peso_total_recibido_kg: number
  temperatura_llegada: number
  hora_llegada: string
  condicion_fruta: 'excelente' | 'buena' | 'regular' | 'rechazada'
  numero_lote_interno?: string
}

// Evento: Selección
export interface DatosSeleccion extends DatosEventoBase {
  linea_seleccion: string
  velocidad_linea_cajas_hora: number
  personal_seleccionadores: number
  criterios_seleccion: string[]
  porcentaje_descarte: number
  defectos_principales: string[]
  peso_seleccionado_kg: number
}

// Evento: Empaque  
export interface DatosEmpaque extends DatosEventoBase {
  linea_empaque: string
  tipo_empaque: string
  formato_caja: string // ej: "caja 8.2kg", "bandeja 500g"
  etiquetas_utilizadas: string[]
  codigo_plu?: string
  cantidad_cajas_producidas: number
  peso_promedio_caja_kg: number
  operarios_empaque: string[]
}

// NUEVO: Estructura mejorada para Paletizado con trazabilidad completa
export interface DatosPaletizado extends DatosEventoBase {
  // Identificación del pallet principal (para compatibilidad)
  numero_pallet: string
  tipo_pallet: 'madera' | 'plastico' | 'carton' | 'mixto'
  
  // Contenido del pallet (específico para este lote)
  cantidad_cajas_lote: number // Cajas de ESTE lote específico en el pallet
  peso_lote_en_pallet_kg: number // Peso de ESTE lote en el pallet
  posicion_en_pallet?: string // ej: "filas 1-3, columnas A-D"
  
  // Información del pallet completo (consolidado)
  pallet_mixto: boolean // Si el pallet contiene múltiples lotes
  total_cajas_pallet?: number // Total de cajas en todo el pallet
  peso_total_pallet_kg?: number // Peso total del pallet completo
  lotes_consolidados?: string[] // IDs de otros lotes en el mismo pallet
  
  // Destino y documentación
  destino_inicial: string
  codigo_trazabilidad_pallet?: string
  folio_packing_list?: string
  
  // Control de calidad específico del paletizado
  estado_etiquetado: 'completo' | 'parcial' | 'pendiente'
  control_peso_verificado: boolean
  observaciones_paletizado?: string
  
  // NUEVO: Soporte para múltiples pallets
  pallets_generados?: Array<{
    numero_pallet: string
    cantidad_cajas_lote: number
    peso_lote_en_pallet_kg: number
    pallet_mixto: boolean
    total_cajas_pallet?: number
    peso_total_pallet_kg?: number
    lotes_consolidados?: string[]
    posicion_en_pallet?: string
    estado_etiquetado: string
    observaciones_pallet?: string
  }>
  cantidad_pallets_generados?: number
  resumen_pallets?: Array<{
    codigo: string
    cajas: number
    peso: number
    mixto: boolean
  }>
}

// Evento: Enfriado (CRÍTICO PARA SAG)
export interface DatosEnfriado extends DatosEventoBase {
  camara_frigorifica: string
  temperatura_inicial: number
  temperatura_objetivo: number
  tiempo_enfriado_horas: number
  humedad_relativa_porcentaje: number
  velocidad_aire_ms?: number
  sistema_control: string // ej: "automatico", "manual"
  alarmas_activadas?: string[]
  responsable_camara: string
  numero_registros_temperatura: number
  temperatura_minima_alcanzada: number
  temperatura_maxima_registrada: number
}

// Evento: Control Calidad
export interface DatosControlCalidad extends DatosEventoBase {
  inspector_calidad: string
  certificacion_inspector?: string
  muestra_analizada_kg: number
  parametros_evaluados: {
    firmeza_kg_cm2?: number
    brix_grados?: number
    acidez_porcentaje?: number
    peso_promedio_g?: number
    diametro_mm?: number
    defectos_externos_porcentaje?: number
    defectos_internos_porcentaje?: number
    maduracion_escala?: number // 1-10
  }
  resultado_general: 'aprobado' | 'condicionado' | 'rechazado'
  certificado_calidad?: string
  observaciones_tecnicas?: string
  tratamientos_requeridos?: string[]
}

// Evento: Despacho
export interface DatosDespacho extends DatosEventoBase {
  numero_factura: string
  numero_guia_despacho: string
  transportista: string
  patente_vehiculo: string
  conductor_nombre: string
  conductor_licencia: string
  destino_cliente: string
  cantidad_pallets_despachados: number
  peso_total_despacho_kg: number
  temperatura_despacho: number
  hora_despacho: string
  sello_seguridad?: string
  documentos_adjuntos: string[]
}

// New types for post-pallet events
export interface DatosEnfriadoPallet extends DatosEventoBase {
  codigo_pallet: string;
  temperatura_camara: number;
  numero_camara: string;
  posicion_camara: string;
  tiempo_enfriamiento_horas: number;
  responsable_camara: string;
  temperatura_llegada?: number;
  temperatura_objetivo: number;
}

export interface DatosControlCalidadPallet extends DatosEventoBase {
  codigo_pallet: string;
  estado_fruta: 'excelente' | 'bueno' | 'regular' | 'deficiente';
  muestras_inspeccionadas: number;
  defectos_encontrados: string[];
  supervisor_calidad: string;
  pallet_aprobado: boolean;
  fecha_vencimiento_estimada?: string;
  certificado_calidad?: string;
}

export interface DatosAlmacenamientoPallet extends DatosEventoBase {
  codigo_pallet: string;
  ubicacion_almacen: string;
  pasillo: string;
  nivel: number;
  posicion: number;
  temperatura_almacen: number;
  fecha_ingreso: string;
  dias_almacenamiento_estimados?: number;
}

export interface DatosConsolidacionPallet extends DatosEventoBase {
  pallets_consolidados: string[];
  contenedor_destino?: string;
  cliente_final: string;
  peso_total_consolidado: number;
  documentacion_exportacion: string[];
  responsable_consolidacion: string;
}

export interface DatosDespachoPallet extends DatosEventoBase {
  codigo_pallet: string;
  destino: string;
  numero_contenedor?: string;
  transportista: string;
  temperatura_transporte?: number;
  documentos_adjuntos: string[];
  cliente_final: string;
  puerto_destino?: string;
  fecha_embarque_estimada?: string;
  tracking_number?: string;
}

// Union type for all post-pallet event data
export type DatosEventoPallet = 
  | DatosEnfriadoPallet 
  | DatosControlCalidadPallet 
  | DatosAlmacenamientoPallet
  | DatosConsolidacionPallet
  | DatosDespachoPallet;

// Union type for all specific event data
export type DatosEventoEspecifico = 
  | DatosInicioCosecha
  | DatosCosechaCompleta  
  | DatosRecepcionPacking
  | DatosSeleccion
  | DatosEmpaque
  | DatosPaletizado
  | DatosEnfriado
  | DatosControlCalidad
  | DatosDespacho;

// Helper type for getting event data type based on event type
export type GetDatosEvento<T extends string> =
  T extends 'Inicio Cosecha' ? DatosInicioCosecha :
  T extends 'Cosecha Completa' ? DatosCosechaCompleta :
  T extends 'Recepción Packing' ? DatosRecepcionPacking :
  T extends 'Selección' ? DatosSeleccion :
  T extends 'Empaque' ? DatosEmpaque :
  T extends 'Paletizado' ? DatosPaletizado :
  T extends 'Enfriado' ? DatosEnfriado :
  T extends 'Control Calidad' ? DatosControlCalidad :
  T extends 'Despacho' ? DatosDespacho :
  DatosEventoBase 