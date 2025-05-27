import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

// Configuración de Supabase
const supabaseUrl = 'https://etmbspkgeofygcowsylp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0bWJzcGtnZW9meWdjb3dzeWxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyODczODIsImV4cCI6MjA2Mzg2MzM4Mn0.WU0DMnbx8Ro_AsQ3Y6SqhswLYp-mioLIqkW9rxkbv3M'

// Crear cliente de Supabase con types
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Servicios de datos específicos para KimunPulse
export const lotesService = {
  // Obtener todos los lotes con información completa
  async obtenerLotesCompletos() {
    const { data, error } = await supabase
      .from('v_lotes_completos')
      .select('*')
      .order('fecha_ultimo_evento', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Obtener un lote específico por ID
  async obtenerLotePorId(id: string) {
    const { data, error } = await supabase
      .from('v_lotes_completos')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Crear nuevo lote
  async crearLote(lote: {
    id: string
    cultivo_id: string
    variedad_id: string
    cuartel_id: string
    area: number
    observaciones?: string
  }) {
    const { data, error } = await supabase
      .from('lotes')
      .insert(lote)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

export const eventosService = {
  // Obtener historial de eventos de un lote
  async obtenerHistorialLote(loteId: string) {
    const { data, error } = await supabase
      .rpc('obtener_historial_lote', { lote_id_param: loteId })
    
    if (error) throw error
    return data
  },

  // Agregar nuevo evento de trazabilidad
  async agregarEvento(evento: {
    lote_id: string
    tipo: Database['public']['Enums']['tipo_evento']
    descripcion: string
    responsable_nombre: string
    datos_adicionales?: any
  }) {
    const { data, error } = await supabase
      .from('eventos_trazabilidad')
      .insert(evento)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Obtener eventos recientes
  async obtenerEventosRecientes(limite = 10) {
    const { data, error } = await supabase
      .from('v_eventos_recientes')
      .select('*')
      .limit(limite)
    
    if (error) throw error
    return data
  }
}

export const dashboardService = {
  // Obtener métricas del dashboard
  async obtenerMetricas() {
    const { data, error } = await supabase
      .rpc('obtener_metricas_dashboard')
      .single()
    
    if (error) throw error
    return data
  },

  // Generar reporte completo de un lote
  async generarReporteLote(loteId: string) {
    const { data, error } = await supabase
      .rpc('generar_reporte_lote', { lote_id_param: loteId })
      .single()
    
    if (error) throw error
    return data
  }
}

export const catalogosService = {
  // Obtener cultivos
  async obtenerCultivos() {
    const { data, error } = await supabase
      .from('cultivos')
      .select('*')
      .eq('activo', true)
      .order('nombre')
    
    if (error) throw error
    return data
  },

  // Obtener variedades por cultivo
  async obtenerVariedadesPorCultivo(cultivoId: string) {
    const { data, error } = await supabase
      .from('variedades')
      .select('*')
      .eq('cultivo_id', cultivoId)
      .eq('activo', true)
      .order('nombre')
    
    if (error) throw error
    return data
  },

  // Obtener cuarteles
  async obtenerCuarteles() {
    const { data, error } = await supabase
      .from('cuarteles')
      .select('*')
      .eq('activo', true)
      .order('nombre')
    
    if (error) throw error
    return data
  },

  // Obtener usuarios/responsables
  async obtenerUsuarios() {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('activo', true)
      .order('nombre')
    
    if (error) throw error
    return data
  }
} 