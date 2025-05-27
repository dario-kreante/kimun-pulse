import { useState, useEffect } from 'react'
import { 
  lotesService, 
  eventosService, 
  dashboardService, 
  catalogosService 
} from '../lib/supabase'
import type { 
  LoteCompleto, 
  HistorialEvento, 
  MetricasDashboard, 
  EventoReciente,
  TipoEvento 
} from '../types/database'

// Hook para manejar los lotes
export function useLotes() {
  const [lotes, setLotes] = useState<LoteCompleto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cargarLotes = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await lotesService.obtenerLotesCompletos()
      setLotes(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar lotes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarLotes()
  }, [])

  return {
    lotes,
    loading,
    error,
    refrescar: cargarLotes
  }
}

// Hook para manejar un lote específico
export function useLote(loteId: string | null) {
  const [lote, setLote] = useState<LoteCompleto | null>(null)
  const [eventos, setEventos] = useState<HistorialEvento[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cargarLote = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const [loteData, eventosData] = await Promise.all([
        lotesService.obtenerLotePorId(id),
        eventosService.obtenerHistorialLote(id)
      ])
      
      setLote(loteData)
      setEventos(eventosData || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar lote')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (loteId) {
      cargarLote(loteId)
    } else {
      setLote(null)
      setEventos([])
    }
  }, [loteId])

  const agregarEvento = async (
    tipo: TipoEvento, 
    descripcion: string, 
    responsable: string,
    datosAdicionales?: any
  ) => {
    if (!loteId) return

    try {
      await eventosService.agregarEvento({
        lote_id: loteId,
        tipo,
        descripcion,
        responsable_nombre: responsable,
        datos_adicionales: datosAdicionales
      })
      
      // Recargar datos
      await cargarLote(loteId)
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error al agregar evento')
    }
  }

  return {
    lote,
    eventos,
    loading,
    error,
    agregarEvento,
    refrescar: () => loteId && cargarLote(loteId)
  }
}

// Hook para métricas del dashboard
export function useDashboard() {
  const [metricas, setMetricas] = useState<MetricasDashboard | null>(null)
  const [eventosRecientes, setEventosRecientes] = useState<EventoReciente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cargarDatos = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [metricasData, eventosData] = await Promise.all([
        dashboardService.obtenerMetricas(),
        eventosService.obtenerEventosRecientes(5)
      ])
      
      setMetricas(metricasData)
      setEventosRecientes(eventosData || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarDatos()
    
    // Refrescar cada 30 segundos
    const interval = setInterval(cargarDatos, 30000)
    return () => clearInterval(interval)
  }, [])

  return {
    metricas,
    eventosRecientes,
    loading,
    error,
    refrescar: cargarDatos
  }
}

// Hook para catálogos (cultivos, variedades, cuarteles, usuarios)
export function useCatalogos() {
  const [cultivos, setCultivos] = useState<any[]>([])
  const [variedades, setVariedades] = useState<any[]>([])
  const [cuarteles, setCuarteles] = useState<any[]>([])
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cargarCatalogos = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [cultivosData, cuartelesData, usuariosData] = await Promise.all([
        catalogosService.obtenerCultivos(),
        catalogosService.obtenerCuarteles(),
        catalogosService.obtenerUsuarios()
      ])
      
      setCultivos(cultivosData || [])
      setCuarteles(cuartelesData || [])
      setUsuarios(usuariosData || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar catálogos')
    } finally {
      setLoading(false)
    }
  }

  const cargarVariedadesPorCultivo = async (cultivoId: string) => {
    try {
      const data = await catalogosService.obtenerVariedadesPorCultivo(cultivoId)
      setVariedades(data || [])
    } catch (err) {
      console.error('Error al cargar variedades:', err)
    }
  }

  useEffect(() => {
    cargarCatalogos()
  }, [])

  return {
    cultivos,
    variedades,
    cuarteles,
    usuarios,
    loading,
    error,
    cargarVariedadesPorCultivo,
    refrescar: cargarCatalogos
  }
} 