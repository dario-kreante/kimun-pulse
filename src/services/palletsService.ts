import { supabase } from '../lib/supabase'

// Tipos para manejo de pallets
export interface Pallet {
  codigo_pallet: string
  fecha_creacion: string
  estado: 'en_construccion' | 'completo' | 'en_camara' | 'en_transito' | 'entregado' | 'devuelto'
  tipo_pallet: string
  peso_total_kg?: number
  cantidad_cajas_total: number
  destino_inicial?: string
  ubicacion_actual?: string
  temperatura_objetivo?: number
  observaciones?: string
  activo: boolean
  created_at: string
  updated_at: string
}

export interface PalletCompleto extends Pallet {
  lotes_asociados: number
  cajas_calculadas: number
  peso_calculado: number
  lotes_ids: string[]
  cultivos: string
  variedades: string
}

export interface PalletLote {
  id: string
  codigo_pallet: string
  lote_id: string
  cantidad_cajas_lote: number
  peso_lote_kg: number
  posicion_en_pallet?: number
  fecha_agregado: string
}

export interface TrazabilidadLote {
  lote_id: string
  lote_info: any
  pallet_actual: {
    codigo_pallet: string
    estado: string
    ubicacion_actual?: string
    fecha_agregado: string
    cantidad_cajas_en_pallet: number
    peso_en_pallet: number
    posicion_en_pallet?: number
  } | null
  historial_pallets: Array<{
    codigo_pallet: string
    estado: string
    fecha_agregado: string
    cantidad_cajas: number
    peso_kg: number
  }>
}

// Servicio de pallets
export const palletsService = {
  // Validar formato de código de pallet
  validarCodigoPallet(codigo: string): boolean {
    const pattern = /^PAL-\d{4}-CHIL-\d{5}$/
    return pattern.test(codigo)
  },

  // Extraer año del código de pallet
  extraerAñoDeCodigo(codigo: string): number | null {
    const match = codigo.match(/^PAL-(\d{4})-CHIL-\d{5}$/)
    return match ? parseInt(match[1]) : null
  },

  // Generar siguiente código de pallet
  async generarSiguienteCodigo(año?: number): Promise<string> {
    try {
      const { data, error } = await supabase
        .rpc('generar_siguiente_codigo_pallet' as any, { año_param: año })
      
      if (error) throw error
      return data as string
    } catch (error) {
      console.error('Error generando código de pallet:', error)
      // Fallback: generar localmente
      const añoActual = año || new Date().getFullYear()
      const timestamp = Date.now().toString().slice(-5)
      return `PAL-${añoActual}-CHIL-${timestamp}`
    }
  },

  // Crear nuevo pallet
  async crearPallet(datos: {
    tipo_pallet?: string
    destino_inicial?: string
    observaciones?: string
  }): Promise<string> {
    try {
      const { data, error } = await supabase
        .rpc('crear_pallet' as any, {
          p_tipo_pallet: datos.tipo_pallet || 'madera',
          p_destino_inicial: datos.destino_inicial,
          p_observaciones: datos.observaciones
        })
      
      if (error) throw error
      return data as string
    } catch (error) {
      console.error('Error creando pallet:', error)
      throw new Error('No se pudo crear el pallet')
    }
  },

  // Obtener pallet por código
  async obtenerPallet(codigo: string): Promise<Pallet | null> {
    try {
      const { data, error } = await supabase
        .from('pallets' as any)
        .select('*')
        .eq('codigo_pallet', codigo)
        .eq('activo', true)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') return null // No encontrado
        throw error
      }
      
      return data as unknown as Pallet
    } catch (error) {
      console.error('Error obteniendo pallet:', error)
      return null
    }
  },

  // Obtener pallet completo con información de lotes
  async obtenerPalletCompleto(codigo: string): Promise<PalletCompleto | null> {
    try {
      const { data, error } = await supabase
        .from('v_pallets_completos' as any)
        .select('*')
        .eq('codigo_pallet', codigo)
        .eq('activo', true)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') return null // No encontrado
        throw error
      }
      
      return data as unknown as PalletCompleto
    } catch (error) {
      console.error('Error obteniendo pallet completo:', error)
      return null
    }
  },

  // Obtener todos los pallets con filtros
  async obtenerPallets(filtros?: {
    estado?: string
    año?: number
    activo?: boolean
    limite?: number
  }): Promise<PalletCompleto[]> {
    try {
      let query = supabase
        .from('v_pallets_completos' as any)
        .select('*')
        .order('fecha_creacion', { ascending: false })
      
      if (filtros?.activo !== undefined) {
        query = query.eq('activo', filtros.activo)
      } else {
        query = query.eq('activo', true) // Por defecto solo activos
      }
      
      if (filtros?.estado) {
        query = query.eq('estado', filtros.estado)
      }
      
      if (filtros?.año) {
        query = query.like('codigo_pallet', `PAL-${filtros.año}-CHIL-%`)
      }
      
      if (filtros?.limite) {
        query = query.limit(filtros.limite)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      return (data || []) as unknown as PalletCompleto[]
    } catch (error) {
      console.error('Error obteniendo pallets:', error)
      return []
    }
  },

  // Agregar lote a pallet
  async agregarLoteAPallet(
    codigoPallet: string,
    loteId: string,
    cantidadCajas: number,
    pesoKg: number,
    posicion?: number
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('agregar_lote_a_pallet' as any, {
          p_codigo_pallet: codigoPallet,
          p_lote_id: loteId,
          p_cantidad_cajas: cantidadCajas,
          p_peso_kg: pesoKg,
          p_posicion: posicion
        })
      
      if (error) throw error
      return Boolean(data)
    } catch (error) {
      console.error('Error agregando lote a pallet:', error)
      throw new Error('No se pudo agregar el lote al pallet')
    }
  },

  // Remover lote de pallet
  async removerLoteDePallet(codigoPallet: string, loteId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('pallet_lotes' as any)
        .delete()
        .eq('codigo_pallet', codigoPallet)
        .eq('lote_id', loteId)
      
      if (error) throw error
      return true
    } catch (error) {
      console.error('Error removiendo lote de pallet:', error)
      return false
    }
  },

  // Obtener lotes de un pallet
  async obtenerLotesDePallet(codigoPallet: string): Promise<PalletLote[]> {
    try {
      const { data, error } = await supabase
        .from('pallet_lotes' as any)
        .select(`
          *,
          lotes:lote_id (
            id,
            cultivo_id,
            variedad_id,
            estado,
            area
          )
        `)
        .eq('codigo_pallet', codigoPallet)
        .order('fecha_agregado', { ascending: true })
      
      if (error) throw error
      return (data || []) as unknown as PalletLote[]
    } catch (error) {
      console.error('Error obteniendo lotes de pallet:', error)
      return []
    }
  },

  // Actualizar estado del pallet
  async actualizarEstado(
    codigoPallet: string, 
    nuevoEstado: Pallet['estado'],
    ubicacion?: string
  ): Promise<boolean> {
    try {
      const updates: any = {
        estado: nuevoEstado,
        updated_at: new Date().toISOString()
      }
      
      if (ubicacion) {
        updates.ubicacion_actual = ubicacion
      }
      
      const { error } = await supabase
        .from('pallets' as any)
        .update(updates)
        .eq('codigo_pallet', codigoPallet)
      
      if (error) throw error
      return true
    } catch (error) {
      console.error('Error actualizando estado del pallet:', error)
      return false
    }
  },

  // Obtener trazabilidad completa de un lote
  async obtenerTrazabilidadLote(loteId: string): Promise<TrazabilidadLote | null> {
    try {
      const { data, error } = await supabase
        .rpc('obtener_trazabilidad_lote' as any, { p_lote_id: loteId })
      
      if (error) throw error
      return data as TrazabilidadLote
    } catch (error) {
      console.error('Error obteniendo trazabilidad del lote:', error)
      return null
    }
  },

  // Buscar pallets que contengan un lote específico
  async buscarPalletsPorLote(loteId: string): Promise<PalletCompleto[]> {
    try {
      const { data, error } = await supabase
        .from('v_pallets_completos' as any)
        .select('*')
        .contains('lotes_ids', [loteId])
        .eq('activo', true)
        .order('fecha_creacion', { ascending: false })
      
      if (error) throw error
      return (data || []) as unknown as PalletCompleto[]
    } catch (error) {
      console.error('Error buscando pallets por lote:', error)
      return []
    }
  },

  // Validar que un lote puede ser agregado a un pallet
  async validarLoteParaPallet(loteId: string, codigoPallet: string): Promise<{
    valido: boolean
    razon?: string
  }> {
    try {
      // Verificar que el lote existe y está activo
      const { data: lote, error: errorLote } = await supabase
        .from('lotes')
        .select('id, estado, activo')
        .eq('id', loteId)
        .eq('activo', true)
        .single()
      
      if (errorLote || !lote) {
        return {
          valido: false,
          razon: 'Lote no encontrado o inactivo'
        }
      }
      
      // Verificar que el pallet existe y está activo
      const { data: pallet, error: errorPallet } = await supabase
        .from('pallets' as any)
        .select('codigo_pallet, estado, activo')
        .eq('codigo_pallet', codigoPallet)
        .eq('activo', true)
        .single()
      
      if (errorPallet || !pallet) {
        return {
          valido: false,
          razon: 'Pallet no encontrado o inactivo'
        }
      }
      
      // Verificar que el lote no esté ya en el pallet
      const { data: relacion } = await supabase
        .from('pallet_lotes' as any)
        .select('id')
        .eq('codigo_pallet', codigoPallet)
        .eq('lote_id', loteId)
        .single()
      
      if (relacion) {
        return {
          valido: false,
          razon: 'El lote ya está en este pallet'
        }
      }
      
      // Verificar que el pallet no esté en estado final
      const palletData = pallet as any
      if (palletData.estado === 'entregado' || palletData.estado === 'devuelto') {
        return {
          valido: false,
          razon: `No se pueden agregar lotes a pallets en estado ${palletData.estado}`
        }
      }
      
      return { valido: true }
    } catch (error) {
      console.error('Error validando lote para pallet:', error)
      return {
        valido: false,
        razon: 'Error de validación'
      }
    }
  },

  // Completar pallet (cambiar estado a completo)
  async completarPallet(codigoPallet: string): Promise<boolean> {
    try {
      // Verificar que tiene al menos un lote
      const { data: lotes, error: errorLotes } = await supabase
        .from('pallet_lotes' as any)
        .select('id')
        .eq('codigo_pallet', codigoPallet)
      
      if (errorLotes) throw errorLotes
      
      if (!lotes || lotes.length === 0) {
        throw new Error('No se puede completar un pallet sin lotes')
      }
      
      return this.actualizarEstado(codigoPallet, 'completo')
    } catch (error) {
      console.error('Error completando pallet:', error)
      return false
    }
  },

  // Obtener estadísticas de pallets
  async obtenerEstadisticas(año?: number): Promise<{
    total: number
    por_estado: Record<string, number>
    cajas_total: number
    peso_total: number
  }> {
    try {
      let query = supabase
        .from('v_pallets_completos' as any)
        .select('estado, cantidad_cajas_total, peso_total_kg')
        .eq('activo', true)
      
      if (año) {
        query = query.like('codigo_pallet', `PAL-${año}-CHIL-%`)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      const estadisticas = {
        total: data?.length || 0,
        por_estado: {} as Record<string, number>,
        cajas_total: 0,
        peso_total: 0
      }
      
      data?.forEach((pallet: any) => {
        // Contar por estado
        const estado = pallet?.estado || 'desconocido'
        estadisticas.por_estado[estado] = 
          (estadisticas.por_estado[estado] || 0) + 1
        
        // Sumar totales
        estadisticas.cajas_total += pallet?.cantidad_cajas_total || 0
        estadisticas.peso_total += pallet?.peso_total_kg || 0
      })
      
      return estadisticas
    } catch (error) {
      console.error('Error obteniendo estadísticas de pallets:', error)
      return {
        total: 0,
        por_estado: {},
        cajas_total: 0,
        peso_total: 0
      }
    }
  }
}

export default palletsService 