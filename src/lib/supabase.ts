import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'
import { config } from '../config/environments'

// Configuración de Supabase desde archivo de ambientes
const supabaseUrl = config.supabase.url
const supabaseAnonKey = config.supabase.anonKey

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be provided in environment configuration.')
}

// Para desarrollo local en localhost, usamos el proxy para evitar problemas de CORS con ngrok.
// Cuando se accede desde ngrok, usamos directamente Supabase ya que ngrok maneja CORS.
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const isLocalDev = process.env.NODE_ENV === 'development' && isLocalhost;
const finalSupabaseUrl = isLocalDev ? 'http://localhost:3001' : supabaseUrl;

// Crear cliente de Supabase con types y configuración del ambiente actual
export const supabase = createClient<Database>(finalSupabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'X-Environment': config.name,
      'X-App-Version': config.app.version,
    },
  },
})

// Log de configuración en desarrollo
console.log('🔗 Inicializando Supabase...', {
  url: finalSupabaseUrl,
  hasAnonKey: !!supabaseAnonKey,
  environment: config.name,
  debug: config.app.debug,
})

if (config.app.debug) {
  console.log('🔗 Supabase conectado:', {
    url: finalSupabaseUrl,
    environment: config.name,
    features: config.features,
  })
}

// Test de conectividad básico
supabase.auth.getSession()
  .then(({ data, error }) => {
    if (error) {
      console.error('🔗 Error al conectar con Supabase:', error)
    } else {
      console.log('🔗 Conexión con Supabase exitosa')
    }
  })
  .catch(error => {
    console.error('🔗 Error crítico al conectar con Supabase:', error)
  })

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
  },

  // Eliminar lote lógicamente
  async eliminarLote(loteId: string, motivo = 'Eliminación manual') {
    const { data, error } = await supabase
      .rpc('eliminar_lote_logico', { 
        lote_id_param: loteId, 
        motivo: motivo 
      })
    
    if (error) throw error
    return data
  },

  // Restaurar lote eliminado
  async restaurarLote(loteId: string) {
    const { data, error } = await supabase
      .rpc('restaurar_lote', { lote_id_param: loteId })
    
    if (error) throw error
    return data
  },

  // Obtener progreso del lote
  async obtenerProgresoLote(loteId: string) {
    const { data, error } = await supabase
      .rpc('obtener_progreso_lote', { lote_id_param: loteId })
    
    if (error) throw error
    return data
  },

  // Obtener lotes activos (excluye eliminados y despachados)
  async obtenerLotesActivos() {
    const { data, error } = await supabase
      .from('v_lotes_completos')
      .select('*')
      .not('estado', 'in', '("Despachado","Eliminado")')
      .order('fecha_ultimo_evento', { ascending: false })
    
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

  // Agregar nuevo evento de trazabilidad (método tradicional - mantener para compatibilidad)
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

  // Agregar evento con validación de secuencia
  async agregarEventoValidado(
    loteId: string,
    tipo: Database['public']['Enums']['tipo_evento'],
    descripcion: string,
    responsable?: string,
    datosAdicionales?: any
  ) {
    // Extraer nombre del operario de los datos adicionales si no se proporciona responsable
    const nombreResponsable = responsable || 
                              datosAdicionales?.operario_nombre || 
                              datosAdicionales?.responsable_nombre || 
                              'Usuario Actual'
    const { data, error } = await supabase
      .rpc('agregar_evento_validado', {
        lote_id_param: loteId,
        tipo_param: tipo,
        descripcion_param: descripcion,
        responsable_param: nombreResponsable,
        datos_adicionales_param: datosAdicionales
      })
    
    if (error) throw error
    return data
  },

  // Validar secuencia de evento antes de agregarlo
  async validarSecuenciaEvento(loteId: string, tipoEvento: Database['public']['Enums']['tipo_evento']) {
    const { data, error } = await supabase
      .rpc('validar_secuencia_evento', {
        lote_id_param: loteId,
        nuevo_tipo_evento: tipoEvento
      })
    
    if (error) throw error
    return data
  },

  // Obtener eventos válidos para un lote
  async obtenerEventosValidos(loteId: string) {
    const { data, error } = await supabase
      .rpc('obtener_eventos_validos', { lote_id_param: loteId })
    
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
  },

  // NUEVAS FUNCIONES PARA EVENTOS DE PALLETS
  
  // Agregar evento específico a un pallet
  async agregarEventoPallet(
    codigoPallet: string,
    tipo: Database['public']['Enums']['tipo_evento'],
    descripcion: string,
    responsable?: string,
    datosAdicionales?: any
  ) {
    // Extraer nombre del operario de los datos adicionales si no se proporciona responsable
    const nombreResponsable = responsable || 
                              datosAdicionales?.operario_nombre || 
                              datosAdicionales?.responsable_nombre || 
                              'Usuario Actual'
    try {
      // Validar que sea un evento válido para pallets
      const eventosValidosPallet = ['Enfriado', 'Control Calidad', 'Despacho']
      if (!eventosValidosPallet.includes(tipo)) {
        throw new Error(`Tipo de evento '${tipo}' no válido para pallets`)
      }

      // Insertar evento directamente en la tabla
      const { data, error } = await supabase
        .from('eventos_pallet')
        .insert({
          codigo_pallet: codigoPallet,
          tipo: tipo,
          descripcion: descripcion,
          responsable_nombre: nombreResponsable,
          datos_adicionales: datosAdicionales,
          fecha: new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) throw error
      
      // Actualizar estado del pallet según el evento
      await this.actualizarEstadoPallet(codigoPallet, tipo, datosAdicionales)
      
      return { success: true, message: 'Evento agregado correctamente al pallet', data }
    } catch (error) {
      console.error('Error agregando evento a pallet:', error)
      return { success: false, error: (error as Error).message }
    }
  },

  // Función auxiliar para actualizar estado del pallet
  async actualizarEstadoPallet(codigoPallet: string, tipoEvento: string, datosAdicionales?: any) {
    try {
      let nuevoEstado: string | undefined
      let nuevaUbicacion: string | undefined

      switch (tipoEvento) {
        case 'Enfriado':
          nuevoEstado = 'en_camara'
          nuevaUbicacion = datosAdicionales?.camara_asignada || 'Cámara Frigorífica'
          break
        case 'Control Calidad':
          // Mantener en cámara hasta despacho
          break
        case 'Despacho':
          nuevoEstado = 'en_transito'
          break
      }

      if (nuevoEstado || nuevaUbicacion) {
        const updateData: any = {}
        if (nuevoEstado) updateData.estado = nuevoEstado
        if (nuevaUbicacion) updateData.ubicacion_actual = nuevaUbicacion

        const { error } = await supabase
          .from('pallets')
          .update(updateData)
          .eq('codigo_pallet', codigoPallet)

        if (error) {
          console.warn('Error actualizando estado del pallet:', error)
        }
      }
    } catch (error) {
      console.warn('Error en actualizarEstadoPallet:', error)
    }
  },

  // Obtener historial de eventos de un pallet específico
  async obtenerHistorialPallet(codigoPallet: string) {
    try {
      const { data, error } = await supabase
        .from('eventos_pallet')
        .select('*')
        .eq('codigo_pallet', codigoPallet)
        .order('fecha', { ascending: false })
      
      if (error) {
        console.warn('Error consultando eventos_pallet:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('Error obteniendo historial de pallet:', error)
      return []
    }
  },

  // Obtener eventos válidos para un pallet (post-paletizado)
  async obtenerEventosValidosPallet(codigoPallet: string) {
    try {
      // Obtener eventos existentes del pallet ordenados por fecha DESC (más reciente primero)
      const eventosExistentes = await this.obtenerHistorialPallet(codigoPallet)
      const tiposEventosExistentes = eventosExistentes.map((e: any) => e.tipo)
      
      // Secuencia post-paletizado en orden cronológico
      const secuenciaPostPaletizado: Database['public']['Enums']['tipo_evento'][] = [
        'Enfriado',
        'Control Calidad', 
        'Despacho'
      ]

      // Encontrar el siguiente evento que no se ha registrado siguiendo la secuencia
      let siguienteEvento: Database['public']['Enums']['tipo_evento'] | null = null
      
      for (const evento of secuenciaPostPaletizado) {
        if (!tiposEventosExistentes.includes(evento)) {
          siguienteEvento = evento
          break
        }
      }
      
      // Determinar el último evento registrado (más reciente)
      const ultimoEvento = eventosExistentes.length > 0 ? eventosExistentes[0].tipo : null
      
      return {
        eventos_validos: siguienteEvento ? [siguienteEvento] : [],
        proceso_completo: !siguienteEvento,
        siguiente_sugerido: siguienteEvento ? {
          tipo: siguienteEvento,
          descripcion: this.obtenerDescripcionSugeridaPallet(siguienteEvento)
        } : null,
        ultimo_evento: ultimoEvento,
        total_eventos: eventosExistentes.length
      }
    } catch (error) {
      console.error('Error obteniendo eventos válidos para pallet:', error)
      return {
        eventos_validos: ['Enfriado'],
        proceso_completo: false,
        siguiente_sugerido: {
          tipo: 'Enfriado',
          descripcion: 'Proceso de enfriamiento en cámara frigorífica'
        },
        ultimo_evento: null,
        total_eventos: 0
      }
    }
  },

  // Función auxiliar para descripciones de eventos de pallet
  obtenerDescripcionSugeridaPallet(tipoEvento: string) {
    const descripciones: Record<string, string> = {
      'Enfriado': 'Proceso de enfriamiento en cámara frigorífica',
      'Control Calidad': 'Control de calidad antes del despacho',
      'Despacho': 'Despacho para transporte al cliente final'
    }
    return descripciones[tipoEvento] || `Registro de evento: ${tipoEvento}`
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

export const codigosService = {
  // TEMPORAL: Datos en memoria hasta que se ejecute la migración SQL
  _actividadTemporal: [] as any[],

  // Inicializar con algunos datos de prueba
  _inicializarDatosPrueba: function() {
    if (this._actividadTemporal.length === 0) {
      const datosPrueba = [
        {
          id: 'scan_1',
          lote_id: 'LP-2024-CHIL-001',
          tipo_actividad: 'escaneo',
          usuario: 'Juan Pérez',
          ubicacion: 'Campo Norte',
          fecha: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // hace 30 min
          datos_adicionales: { dispositivo: 'iPhone 12' }
        },
        {
          id: 'print_1',
          lote_id: 'LP-2024-CHIL-001',
          tipo_actividad: 'impresion',
          usuario: 'María López',
          cantidad_etiquetas: 5,
          formato_codigo: 'qr_texto',
          fecha: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // hace 2 horas
          datos_adicionales: { impresora: 'Zebra ZT230' }
        },
        {
          id: 'scan_2',
          lote_id: 'LP-2024-CHIL-002',
          tipo_actividad: 'escaneo',
          usuario: 'Carlos González',
          ubicacion: 'Packing',
          fecha: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // hace 1 hora
          datos_adicionales: { dispositivo: 'Android' }
        }
      ]
      this._actividadTemporal = datosPrueba
    }
  },

  // Registrar escaneo de código QR
  async registrarEscaneo(loteId: string, usuario: string, ubicacion?: string, datos?: any) {
    const { data, error } = await (supabase as any)
      .rpc('registrar_evento_codigo_qr', {
        p_lote_id: loteId,
        p_tipo_actividad: 'escaneo',
        p_usuario: usuario,
        p_ubicacion: ubicacion,
        p_cantidad_etiquetas: 1,
        p_formato_codigo: 'qr_texto',
        p_datos_adicionales: datos
      })
    
    if (error) throw error
    return data
  },

  // Registrar impresión de etiquetas
  async registrarImpresion(loteId: string, usuario: string, cantidad: number, formato: string, datos?: any) {
    const { data, error } = await (supabase as any)
      .rpc('registrar_evento_codigo_qr', {
        p_lote_id: loteId,
        p_tipo_actividad: 'impresion',
        p_usuario: usuario,
        p_cantidad_etiquetas: cantidad,
        p_formato_codigo: formato,
        p_datos_adicionales: datos
      })
    
    if (error) throw error
    return data
  },

  // Obtener historial de códigos de un lote
  async obtenerHistorialLote(loteId: string) {
    try {
      const { data, error } = await (supabase as any)
        .from('v_actividad_codigos_completa')
        .select('*')
        .eq('lote_id', loteId)
        .order('fecha_evento', { ascending: false })
      
      if (error) {
        console.warn('Vista v_actividad_codigos_completa no disponible para historial de lote')
        return []
      }
      
      return data || []
    } catch (err) {
      console.warn('Error al obtener historial de códigos:', err)
      return []
    }
  },

  // Obtener actividad reciente de códigos
  async obtenerActividadReciente(limite = 50) {
    try {
      // Intentar usar la vista si existe
      const { data, error } = await (supabase as any)
        .from('v_actividad_codigos_completa')
        .select('*')
        .order('fecha_evento', { ascending: false })
        .limit(limite)
      
      if (error) {
        // Si la vista no existe, usar datos mock
        console.warn('Vista v_actividad_codigos_completa no disponible, usando datos demo')
        return []
      }
      
      return data?.map((item: any) => ({
        id: item.id,
        lote_id: item.lote_id,
        tipo_actividad: item.tipo_actividad,
        usuario: item.usuario,
        ubicacion: item.ubicacion,
        cantidad_etiquetas: item.cantidad_etiquetas,
        formato_codigo: item.formato_codigo,
        fecha: item.fecha_evento,
        cultivo: item.cultivo,
        variedad: item.variedad,
        cuartel_origen: item.cuartel_origen
      })) || []
    } catch (err) {
      console.warn('Error al obtener actividad de códigos, usando datos demo:', err)
      return []
    }
  },

  // Validar código de lote
  async validarCodigoLote(codigo: string) {
    try {
      const loteId = this.extraerLoteIdDeCodigo(codigo)
      
      const { data: lote, error } = await supabase
        .from('v_lotes_completos')
        .select('*')
        .eq('id', loteId)
        .single()
      
      if (error || !lote) {
        return { valido: false, loteId: null, lote: null }
      }
      
      return {
        valido: true,
        loteId: loteId,
        lote: lote
      }
    } catch (error) {
      return { valido: false, loteId: null, lote: null }
    }
  },

  // Generar código QR para un lote
  generarCodigoQR(loteId: string, metadata?: any) {
    const baseUrl = `${window.location.origin}/lote`
    const codigoCompleto = `${baseUrl}/${loteId}`
    
    if (metadata) {
      const params = new URLSearchParams()
      Object.entries(metadata).forEach(([key, value]) => {
        params.append(key, String(value))
      })
      return `${codigoCompleto}?${params.toString()}`
    }
    
    return codigoCompleto
  },

  // Extraer ID de lote desde código
  extraerLoteIdDeCodigo(codigo: string): string {
    try {
      const url = new URL(codigo)
      const pathParts = url.pathname.split('/')
      const loteIndex = pathParts.findIndex(part => part === 'lote')
      
      if (loteIndex !== -1 && loteIndex + 1 < pathParts.length) {
        return pathParts[loteIndex + 1]
      }
      
      // Fallback: asumir que es solo el ID del lote
      return codigo.replace(/[^a-zA-Z0-9-]/g, '')
    } catch {
      // Si no es una URL válida, asumir que es el ID directo
      return codigo.replace(/[^a-zA-Z0-9-]/g, '')
    }
  },

  // Obtener estadísticas generales
  async obtenerEstadisticas() {
    try {
      const { data, error } = await (supabase as any)
        .rpc('obtener_estadisticas_codigos_generales')
      
      if (error) {
        console.warn('Función obtener_estadisticas_codigos_generales no disponible, usando datos demo')
        return {
          total_escaneos: 0,
          total_impresiones: 0,
          total_etiquetas_impresas: 0,
          lotes_con_actividad: 0,
          actividad_hoy: 0,
          actividad_semana: 0,
          usuarios_activos: 0
        }
      }
      
      return data
    } catch (err) {
      console.warn('Error al obtener estadísticas de códigos:', err)
      return {
        total_escaneos: 0,
        total_impresiones: 0,
        total_etiquetas_impresas: 0,
        lotes_con_actividad: 0,
        actividad_hoy: 0,
        actividad_semana: 0,
        usuarios_activos: 0
      }
    }
  },

  // Obtener estadísticas de un lote específico
  async obtenerEstadisticasLote(loteId: string) {
    const { data, error } = await (supabase as any)
      .rpc('obtener_estadisticas_codigo_lote', { p_lote_id: loteId })
    
    if (error) throw error
    return data
  }
}

// Servicios de pallets
export const palletsService = {
  // Obtener pallets asociados a un lote
  async obtenerPalletsPorLote(loteId: string) {
    try {
      // Usamos directamente la consulta a la vista, que es más robusta
      const { data, error } = await supabase
        .from('v_pallets_completos')
        .select('*')
        .eq('lote_origen_id', loteId) // Asumiendo que la vista tiene esta columna
        .order('fecha_creacion', { ascending: false });

      if (error) {
        // Si la columna no es 'lote_origen_id', probamos un filtro en el array de lotes_ids
        if (error.code === '42703') { // 'undefined_column'
          const { data: dataAlternativo, error: errorAlternativo } = await supabase
            .from('v_pallets_completos')
            .select('*')
            .contains('lotes_ids', [loteId])
            .order('fecha_creacion', { ascending: false });
          
          if (errorAlternativo) throw errorAlternativo;
          return dataAlternativo;
        }
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error obteniendo pallets por lote:', error)
      return []
    }
  },

  // Crear un nuevo pallet y asociarlo a un lote
  async crearPallet(datosPallet: {
    lote_id: string
    cantidad_cajas: number
    peso_kg: number
    destino_inicial?: string
    temperatura_objetivo?: number
  }) {
    try {
      const { data, error } = await (supabase as any)
        .rpc('crear_pallet_para_lote', {
          p_lote_id: datosPallet.lote_id,
          p_cantidad_cajas: datosPallet.cantidad_cajas,
          p_peso_kg: datosPallet.peso_kg,
          p_destino: datosPallet.destino_inicial,
          p_temperatura: datosPallet.temperatura_objetivo
        })
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creando pallet:', error)
      throw error
    }
  },

  // Obtener información completa de un pallet específico
  async obtenerPalletCompleto(codigoPallet: string) {
    try {
      // Intentar usar función RPC si existe
      const { data: rpcData, error: rpcError } = await (supabase as any)
         .rpc('obtener_pallet_completo', { p_codigo_pallet: codigoPallet })
      
      if (!rpcError && rpcData) {
        return rpcData
      }
      
      // Fallback: usar consulta SQL directa si la función RPC no existe
      console.warn('Función obtener_pallet_completo no disponible, usando consulta SQL directa')
      
      // Obtener datos del pallet desde la base de datos
      const { data: palletData, error: palletError } = await (supabase as any)
        .from('pallets')
        .select('*')
        .eq('codigo_pallet', codigoPallet)
        .single()
      
      if (palletError || !palletData) {
        console.error('Pallet no encontrado en base de datos:', palletError)
        return null
      }
      
      // Obtener información del lote padre desde pallet_lotes
      const { data: palletLotes, error: palletLotesError } = await (supabase as any)
        .from('pallet_lotes')
        .select('lote_id, cantidad_cajas_lote, peso_lote_kg')
        .eq('codigo_pallet', codigoPallet)
        .single()
      
      let lote_padre = null
      if (!palletLotesError && palletLotes) {
        // Obtener datos completos del lote padre
        const { data: loteData, error: loteError } = await (supabase as any)
          .from('lotes')
          .select(`
            id,
            estado,
            observaciones,
            area,
            cultivos(nombre),
            variedades(nombre),
            cuarteles(nombre)
          `)
          .eq('id', palletLotes.lote_id)
          .single()
        
        if (!loteError && loteData) {
          lote_padre = {
            codigo_lote: loteData.id,
            estado: loteData.estado,
            cultivo: loteData.cultivos?.nombre || 'No especificado',
            variedad: loteData.variedades?.nombre || 'No especificado',
            cuartel_origen: loteData.cuarteles?.nombre || 'No especificado',
            fecha_cosecha: null, // Este campo debería agregarse a la tabla lotes
            responsable: 'No especificado', // Este campo debería agregarse a la tabla lotes
            peso_original_kg: loteData.area ? loteData.area * 1000 : 0, // Estimación basada en área
            total_pallets_generados: 1 // Podríamos contar esto con una consulta adicional
          }
        }
      }
      
      return {
        ...palletData,
        lote_padre
      }
    } catch (error) {
      console.error('Error obteniendo pallet completo:', error)
      return null
    }
  }
}

// Servicios de cámaras frigoríficas e inventarios
export const camarasService = {
  // Obtener todas las cámaras frigoríficas
  async obtenerTodasCamaras() {
    try {
      const { data, error } = await (supabase as any)
        .from('camaras_frigorificas')
        .select('*')
        .eq('activo', true)
        .order('nombre')
      
      if (error) throw error
      return data
    } catch (error) {
      console.warn('Tabla camaras_frigorificas no disponible, usando datos mock')
      return []
    }
  },

  // Obtener cámaras disponibles (activas con capacidad)
  async obtenerCamarasDisponibles() {
    try {
      const { data, error } = await (supabase as any)
        .from('v_inventario_camaras')
        .select('*')
        .eq('estado_operativo', 'activa')
        .lt('capacidad_utilizada_porcentaje', 95)
        .order('capacidad_utilizada_porcentaje')
      
      if (error) throw error
      return data?.map((item: any) => ({
        id: item.camara_id,
        nombre: item.camara_nombre,
        capacidad_maxima_kg: item.capacidad_maxima_kg,
        temperatura_operacion_min: item.temperatura_operacion_min,
        temperatura_operacion_max: item.temperatura_operacion_max,
        humedad_optima_porcentaje: item.humedad_optima_porcentaje,
        tipo_control: item.tipo_control,
        estado_operativo: item.estado_operativo,
        ubicacion: item.ubicacion,
        responsable: item.responsable,
        ultima_revision: item.fecha_actualizacion
      })) || []
    } catch (error) {
      console.warn('Vista v_inventario_camaras no disponible, usando datos mock')
      return []
    }
  },

  // Crear nueva cámara frigorífica
  async crearCamaraFrigorifica(datoCamara: {
    nombre: string
    capacidad_maxima_kg: number
    temperatura_operacion_min: number
    temperatura_operacion_max: number
    humedad_optima_porcentaje: number
    tipo_control: 'automatico' | 'manual' | 'mixto'
    ubicacion: string
    responsable: string
  }) {
    // Generar ID automático
    const { data: ultimaCamara } = await (supabase as any)
      .from('camaras_frigorificas')
      .select('id')
      .order('id', { ascending: false })
      .limit(1)

    let nuevoId = 'CAM-001'
    if (ultimaCamara && ultimaCamara.length > 0) {
      const ultimoNumero = parseInt(ultimaCamara[0].id.split('-')[1])
      nuevoId = `CAM-${String(ultimoNumero + 1).padStart(3, '0')}`
    }

    const { data, error } = await (supabase as any)
      .from('camaras_frigorificas')
      .insert({
        id: nuevoId,
        ...datoCamara,
        estado_operativo: 'activa',
        ultima_revision: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Procesar ingreso de lote a cámara
  async procesarIngresoLoteCamara(
    loteId: string,
    camaraId: string,
    pesoKg: number,
    temperaturaIngreso?: number,
    temperaturaObjetivo?: number,
    datosAdicionales?: any
  ) {
    const { data, error } = await (supabase as any)
      .rpc('procesar_ingreso_lote_camara', {
        p_lote_id: loteId,
        p_camara_id: camaraId,
        p_peso_kg: pesoKg,
        p_temperatura_ingreso: temperaturaIngreso,
        p_temperatura_objetivo: temperaturaObjetivo,
        p_datos_adicionales: datosAdicionales
      })
    
    if (error) throw error
    return data
  },

  // Procesar salida de lote de cámara
  async procesarSalidaLoteCamara(
    loteId: string,
    nuevoEstado: string = 'Listo Despacho',
    motivo: string = 'Despacho programado'
  ) {
    const { data, error } = await (supabase as any)
      .rpc('procesar_salida_lote_camara', {
        p_lote_id: loteId,
        p_nuevo_estado: nuevoEstado,
        p_motivo: motivo
      })
    
    if (error) throw error
    return data
  },

  // Obtener inventario de una cámara
  async obtenerInventarioCamara(camaraId: string) {
    const { data, error } = await (supabase as any)
      .rpc('obtener_inventario_camara', { p_camara_id: camaraId })
    
    if (error) throw error
    return data
  },

  // Obtener información de lote en cámara
  async obtenerInfoLoteEnCamara(loteId: string) {
    const { data, error } = await (supabase as any)
      .from('lotes_en_camara')
      .select(`
        *,
        camara:camaras_frigorificas(id, nombre)
      `)
      .eq('lote_id', loteId)
      .eq('activo', true)
      .is('fecha_salida', null)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data ? {
      camara_id: (data as any).camara_id,
      camara_nombre: (data as any).camara?.nombre,
      lote: data,
      inventario_completo: await this.obtenerInventarioCamara((data as any).camara_id)
    } : null
  },

  // Obtener métricas de eficiencia
  async obtenerMetricasEficiencia(camaraId: string, diasAtras: number = 30) {
    try {
      const { data, error } = await (supabase as any)
        .rpc('obtener_metricas_eficiencia_camara', {
          p_camara_id: camaraId,
          p_dias_atras: diasAtras
        })
      
      if (error) throw error
      return data
    } catch (error) {
      console.warn('Función obtener_metricas_eficiencia_camara no disponible, usando datos mock')
      return null
    }
  },

  // Obtener alertas activas
  async obtenerAlertasActivas(camaraId?: string) {
    try {
      let query = (supabase as any)
        .from('v_alertas_criticas_camaras')
        .select('*')

      if (camaraId) {
        query = query.eq('camara_id', camaraId)
      }

      const { data, error } = await query.order('fecha_alerta', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.warn('Vista v_alertas_criticas_camaras no disponible, retornando array vacío')
      return []
    }
  },

  // Resolver alerta
  async resolverAlerta(alertaId: string, usuarioResolucion: string, notasResolucion?: string) {
    try {
      const { data, error } = await (supabase as any)
        .from('alertas_camaras')
        .update({
          resuelto: true,
          fecha_resolucion: new Date().toISOString(),
          usuario_resolucion: usuarioResolucion,
          notas_resolucion: notasResolucion
        })
        .eq('id', alertaId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.warn('Tabla alertas_camaras no disponible')
      throw error
    }
  }
} 