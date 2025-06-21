import { useState, useEffect } from 'react'
import { 
  lotesService, 
  eventosService, 
  catalogosService,
  codigosService
} from '../lib/supabase'
import type { 
  LoteCompleto, 
  HistorialEvento, 
  MetricasDashboard, 
  EventoReciente,
  TipoEvento 
} from '../types/database'
import gestionCamarasService from '../services/gestionCamarasService'
import palletsService from '../services/palletsService'

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
  const [eventosValidos, setEventosValidos] = useState<any>(null)
  const [progreso, setProgreso] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Función para determinar el siguiente evento probable basado en el estado actual
  const determinarSiguienteEvento = (estadoActual: string, eventos: HistorialEvento[]) => {
    const tiposEventosExistentes = eventos.map(e => e.tipo).filter(Boolean)
    
    // Secuencia estándar de eventos (con tipos seguros)
    const secuenciaEstandar: TipoEvento[] = [
      'Inicio Cosecha',
      'Cosecha Completa', 
      'Recepción Packing',
      'Selección',
      'Empaque',
      'Paletizado',
      'Enfriado',
      'Control Calidad',
      'Despacho'
    ]

    // Encontrar el siguiente evento que no se ha registrado
    for (const evento of secuenciaEstandar) {
      if (!tiposEventosExistentes.includes(evento)) {
        return {
          tipo: evento,
          sugerido: true,
          descripcion: obtenerDescripcionSugerida(evento),
          probabilidad: 'alta'
        }
      }
    }

    return null
  }

  const obtenerDescripcionSugerida = (tipoEvento: string) => {
    const descripciones: Record<string, string> = {
      'Inicio Cosecha': 'Inicio del proceso de cosecha manual en cuartel',
      'Cosecha Completa': 'Finalización de la cosecha del lote',
      'Recepción Packing': 'Recepción de la fruta en planta de packing',
      'Selección': 'Proceso de selección y clasificación de la fruta',
      'Empaque': 'Empaque de la fruta en contenedores finales',
      'Paletizado': 'Paletizado de cajas para almacenamiento',
      'Enfriado': 'Proceso de enfriamiento en cámara frigorífica',
      'Control Calidad': 'Control de calidad antes del despacho',
      'Despacho': 'Despacho para transporte al cliente final'
    }
    return descripciones[tipoEvento] || `Registro de evento: ${tipoEvento}`
  }

  const cargarLote = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const [loteData, eventosData, progresoData] = await Promise.all([
        lotesService.obtenerLotePorId(id),
        eventosService.obtenerHistorialLote(id),
        lotesService.obtenerProgresoLote(id)
      ])
      
      // Mapear eventos para asegurar que 'id' exista
      const eventosMapeados = eventosData?.map((e: any) => ({
        ...e,
        id: e.id || e.evento_id,
      })) || []

      setLote(loteData)
      setEventos(eventosMapeados)
      setProgreso(progresoData)

      // Determinar eventos válidos de manera inteligente
      if (loteData && eventosMapeados) {
        const siguienteEvento = determinarSiguienteEvento(loteData.estado || 'En Cosecha', eventosMapeados)
        const eventosCalculados = {
          eventos_validos: siguienteEvento ? [siguienteEvento.tipo] : [],
          proceso_completo: !siguienteEvento,
          siguiente_sugerido: siguienteEvento
        }
        setEventosValidos(eventosCalculados)
      }
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
      setEventosValidos(null)
      setProgreso(null)
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

  const agregarEventoValidado = async (
    tipo: TipoEvento, 
    descripcion: string, 
    responsable: string,
    datosAdicionales?: any
  ) => {
    if (!loteId) return

    try {
      // ✨ NUEVA INTEGRACIÓN: Procesar eventos especiales de cámaras ANTES del evento
      if (tipo === 'Enfriado' && datosAdicionales && lote && lote.estado) {
        try {
          await gestionCamarasService.procesarIngresoLoteCamara(
            loteId,
            datosAdicionales,
            lote.estado
          )
          console.log(`✅ Lote ${loteId} procesado para ingreso a cámara frigorífica`)
        } catch (camaraError) {
          console.warn('Error al procesar ingreso a cámara:', camaraError)
          // No bloqueamos el evento si falla la gestión de cámara
        }
      }

      if (tipo === 'Despacho' && datosAdicionales) {
        try {
          await gestionCamarasService.procesarSalidaLoteCamara(
            loteId,
            'despacho',
            undefined,
            'Despacho a cliente'
          )
          console.log(`✅ Lote ${loteId} procesado para salida de cámara frigorífica`)
        } catch (camaraError) {
          console.warn('Error al procesar salida de cámara:', camaraError)
          // No bloqueamos el evento si falla la gestión de cámara
        }
      }

      const resultado = await eventosService.agregarEventoValidado(
        loteId, 
        tipo, 
        descripcion, 
        responsable, 
        datosAdicionales
      )
      
      // Verificar que resultado es un objeto con las propiedades esperadas
      if (resultado && typeof resultado === 'object' && 'exito' in resultado) {
        const resultadoObj = resultado as { exito: boolean; error?: string; mensaje?: string }
        
        if (!resultadoObj.exito) {
          throw new Error(resultadoObj.error || 'Error de validación')
        }
        
        // Recargar datos
        await cargarLote(loteId)
        return resultado
      } else {
        throw new Error('Respuesta inválida del servidor')
      }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error al agregar evento validado')
    }
  }

  const validarEvento = async (tipo: TipoEvento) => {
    if (!loteId) return null

    try {
      return await eventosService.validarSecuenciaEvento(loteId, tipo)
    } catch (err) {
      console.error('Error al validar evento:', err)
      return null
    }
  }

  return {
    lote,
    eventos,
    eventosValidos,
    progreso,
    loading,
    error,
    agregarEvento,
    agregarEventoValidado,
    validarEvento,
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
      
      // Obtener lotes completos y eventos recientes
      const [lotesData, eventosData] = await Promise.all([
        lotesService.obtenerLotesCompletos(),
        eventosService.obtenerEventosRecientes(5)
      ])
      
      // Calcular métricas desde los lotes
      const lotes = lotesData || []
      
      // Lotes activos: todos excepto los despachados y eliminados
      const lotesActivos = lotes.filter(lote => 
        lote.estado !== 'Despachado' && lote.estado !== 'Eliminado'
      )
      
      const areaTotal = lotes.reduce((sum, lote) => sum + (Number(lote.area) || 0), 0)
      
      // Obtener eventos de hoy
      const hoy = new Date().toISOString().split('T')[0]
      const eventosHoy = (eventosData || []).filter(evento => 
        evento.fecha && evento.fecha.startsWith(hoy)
      ).length
      
      // Crear objeto de métricas compatible
      const metricasCalculadas: MetricasDashboard = {
        total_lotes: lotes.length,
        lotes_activos: lotesActivos.length,
        area_total: areaTotal,
        eventos_hoy: eventosHoy,
        lotes_por_estado: null,
        cultivos_activos: null
      }
      
      setMetricas(metricasCalculadas)
      setEventosRecientes(eventosData || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarDatos()
    
    // Refrescar cada 2 minutos
    // Solo si la pestaña está activa para no consumir recursos innecesarios
    const interval = setInterval(() => {
      if (!document.hidden) {
        cargarDatos()
      }
    }, 120000) // 2 minutos
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

// Hook para manejar códigos QR y códigos de barras
export function useCodigos() {
  const [actividadReciente, setActividadReciente] = useState<any[]>([])
  const [estadisticas, setEstadisticas] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cargarActividadReciente = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await codigosService.obtenerActividadReciente()
      setActividadReciente(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar actividad')
    } finally {
      setLoading(false)
    }
  }

  const cargarEstadisticas = async () => {
    try {
      const data = await codigosService.obtenerEstadisticas()
      setEstadisticas(data)
    } catch (err) {
      console.error('Error al cargar estadísticas:', err)
    }
  }

  const escanearCodigo = async (codigo: string, usuario: string, ubicacion?: string) => {
    try {
      setError(null)
      
      // Validar código
      const validacion = await codigosService.validarCodigoLote(codigo)
      
      if (!validacion.valido) {
        throw new Error('Código QR inválido')
      }

      // Registrar escaneo
      if (!validacion.loteId) {
        throw new Error('ID de lote no válido')
      }
      await codigosService.registrarEscaneo(validacion.loteId, usuario, ubicacion)
      
      // Actualizar datos
      await cargarActividadReciente()
      await cargarEstadisticas()
      
      return {
        exito: true,
        lote: validacion.lote,
        loteId: validacion.loteId
      }
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al escanear código'
      setError(mensaje)
      throw new Error(mensaje)
    }
  }

  const imprimirEtiquetas = async (
    loteIds: string[], 
    usuario: string, 
    formato: string = 'qr_texto', 
    cantidad: number = 1
  ) => {
    try {
      setError(null)
      
      // Registrar impresión para cada lote
      const resultados = await Promise.all(
        loteIds.map(loteId => 
          codigosService.registrarImpresion(loteId, usuario, cantidad, formato)
        )
      )
      
      // Actualizar datos
      await cargarActividadReciente()
      await cargarEstadisticas()
      
      return {
        exito: true,
        etiquetasGeneradas: resultados.length * cantidad,
        resultados
      }
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al imprimir etiquetas'
      setError(mensaje)
      throw new Error(mensaje)
    }
  }

  const obtenerHistorialLote = async (loteId: string) => {
    try {
      setError(null)
      const historial = await codigosService.obtenerHistorialLote(loteId)
      return historial
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al obtener historial'
      setError(mensaje)
      throw new Error(mensaje)
    }
  }

  const generarCodigoQR = (loteId: string, metadata?: any) => {
    return codigosService.generarCodigoQR(loteId, metadata)
  }

  const validarCodigo = async (codigo: string) => {
    try {
      setError(null)
      return await codigosService.validarCodigoLote(codigo)
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Código inválido'
      setError(mensaje)
      throw new Error(mensaje)
    }
  }

  useEffect(() => {
    cargarActividadReciente()
    cargarEstadisticas()
  }, [])

  return {
    actividadReciente,
    estadisticas,
    loading,
    error,
    escanearCodigo,
    imprimirEtiquetas,
    obtenerHistorialLote,
    generarCodigoQR,
    validarCodigo,
    refrescar: cargarActividadReciente
  }
}

// Hook para manejar un pallet específico  
export function usePallet(codigoPallet: string | null) {
  const [pallet, setPallet] = useState<any | null>(null)
  const [eventos, setEventos] = useState<any[]>([])
  const [eventosValidos, setEventosValidos] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cargarPallet = async (codigo: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const [palletData, eventosData, eventosValidosData] = await Promise.all([
        palletsService.obtenerPalletCompleto(codigo),
        eventosService.obtenerHistorialPallet(codigo),
        eventosService.obtenerEventosValidosPallet(codigo)
      ])
      
      setPallet(palletData)
      setEventos(eventosData || [])
      setEventosValidos(eventosValidosData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar pallet')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (codigoPallet) {
      cargarPallet(codigoPallet)
    } else {
      setPallet(null)
      setEventos([])
      setEventosValidos(null)
    }
  }, [codigoPallet])

  const agregarEventoPallet = async (
    tipo: TipoEvento, 
    descripcion: string, 
    responsable: string,
    datosAdicionales?: any
  ) => {
    if (!codigoPallet) return

    try {
      const resultado = await eventosService.agregarEventoPallet(
        codigoPallet,
        tipo,
        descripcion,
        responsable,
        datosAdicionales
      )
      
      if (resultado.success) {
        // Recargar datos del pallet
        await cargarPallet(codigoPallet)
        return resultado
      } else {
        throw new Error(resultado.error || 'Error al agregar evento')
      }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error al agregar evento al pallet')
    }
  }

  const obtenerSiguientePaso = () => {
    if (!eventosValidos) return null
    return eventosValidos.siguiente_sugerido?.tipo || null
  }

  return {
    pallet,
    eventos,
    eventosValidos,
    loading,
    error,
    refrescar: () => codigoPallet ? cargarPallet(codigoPallet) : null,
    agregarEvento: agregarEventoPallet,
    siguientePaso: obtenerSiguientePaso()
  }
} 