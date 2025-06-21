// Tipos para gestión de inventarios y cámaras frigoríficas

import { EstadoLote, LoteCompleto } from './database'

// Definición de cámaras frigoríficas
export interface CamaraFrigorifica {
  id: string
  nombre: string
  capacidad_maxima_kg: number
  temperatura_operacion_min: number
  temperatura_operacion_max: number
  humedad_optima_porcentaje: number
  tipo_control: 'automatico' | 'manual' | 'mixto'
  estado_operativo: 'activa' | 'mantenimiento' | 'fuera_servicio'
  ubicacion: string
  responsable: string
  ultima_revision: string
  created_at?: string
  updated_at?: string
}

// Inventario de una cámara específica
export interface InventarioCamara {
  camara_id: string
  camara_nombre: string
  lotes_almacenados: LoteEnCamara[]
  peso_total_actual_kg: number
  capacidad_utilizada_porcentaje: number
  temperatura_actual: number
  humedad_actual: number
  fecha_actualizacion: string
  alertas_activas: AlertaCamara[]
}

// Lote dentro de una cámara
export interface LoteEnCamara {
  lote_id: string
  cultivo: string
  variedad: string
  peso_kg: number
  fecha_ingreso: string
  dias_en_camara: number
  temperatura_ingreso: number
  temperatura_objetivo: number
  estado_calidad: 'optimo' | 'bueno' | 'en_observacion' | 'critico'
  fecha_vencimiento_estimado?: string
}

// Alertas de cámara
export interface AlertaCamara {
  id: string
  tipo: 'temperatura' | 'humedad' | 'capacidad' | 'tiempo_almacenaje' | 'mantenimiento'
  nivel: 'info' | 'warning' | 'critical'
  mensaje: string
  fecha_creacion: string
  resuelto: boolean
  fecha_resolucion?: string
}

// Reporte de inventario por estado
export interface ReporteInventarioEstado {
  estado: EstadoLote
  cantidad_lotes: number
  total_lotes: number
  peso_total_kg: number
  area_total_hectareas: number
  cultivos_involucrados: CultivoInventario[]
  fecha_generacion: string
  fecha_actualizacion: string
  lotes_detalle: LoteInventario[]
}

// Inventario por cultivo
export interface CultivoInventario {
  cultivo_id: string
  cultivo_nombre: string
  variedades: VariedadInventario[]
  cantidad_lotes: number
  peso_total_kg: number
  area_total_hectareas: number
}

// Inventario por variedad
export interface VariedadInventario {
  variedad_id: string
  variedad_nombre: string
  cantidad_lotes: number
  peso_total_kg: number
  area_total_hectareas: number
  fecha_cosecha_promedio?: string
  dias_promedio_proceso: number
}

// Detalle de lote en inventario
export interface LoteInventario {
  lote_id: string
  cultivo: string
  variedad: string
  cuartel: string
  area_hectareas: number
  peso_estimado_kg: number
  fecha_ultimo_evento: string
  dias_en_estado_actual: number
  ubicacion_actual?: string // Cámara frigorífica, línea de empaque, etc.
  temperatura_actual?: number
  observaciones?: string
}

// Reporte consolidado de inventarios
export interface ReporteInventarioConsolidado {
  fecha_generacion: string
  resumen_global: {
    total_lotes: number
    peso_total_kg: number
    area_total_hectareas: number
    capacidad_frigorifica_total: number
    capacidad_frigorifica_utilizada: number
    eficiencia_operativa: number // porcentaje
  }
  inventario_por_estado: ReporteInventarioEstado[]
  inventario_camaras: InventarioCamara[]
  alertas_activas: AlertaCamara[]
  recomendaciones: string[]
}

// Filtros para consultas de inventario
export interface FiltrosInventario {
  estados?: EstadoLote[]
  cultivos?: string[]
  variedades?: string[]
  camaras?: string[]
  fecha_desde?: string
  fecha_hasta?: string
  incluir_alertas?: boolean
  solo_activos?: boolean
}

// Métricas de eficiencia de cámaras
export interface MetricasEficienciaCamara {
  camara_id: string
  periodo_dias: number
  utilizacion_promedio_porcentaje: number
  tiempo_promedio_almacenaje_dias: number
  rotacion_inventario: number // veces por período
  temperatura_estabilidad_porcentaje: number
  incidencias_temperatura: number
  energia_consumida_kwh?: number
  costo_operativo_periodo?: number
}

// Predicciones de inventario
export interface PrediccionInventario {
  fecha_prediccion: string
  horizonte_dias: number
  lotes_listos_despacho: number
  peso_disponible_despacho_kg: number
  camaras_liberadas: string[]
  necesidad_espacio_adicional_kg: number
  recomendaciones_logistica: string[]
} 