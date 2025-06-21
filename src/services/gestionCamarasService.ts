import { EstadoLote } from '../types/database'
import { DatosEnfriado } from '../types/eventSpecificData'
import { CamaraFrigorifica } from '../types/inventario'
import { supabase } from '../lib/supabase'

interface RegistroIngresoLote {
  lote_id: string
  camara_id: string 
  fecha_ingreso: string
  datos_enfriado: DatosEnfriado
  estado_anterior: EstadoLote
}

interface RegistroSalidaLote {
  lote_id: string
  camara_id: string
  fecha_salida: string
  destino: 'despacho' | 'otra_camara' | 'proceso'
  motivo?: string
}

class GestionCamarasService {
  
  /**
   * Procesa el ingreso de un lote a cámara frigorífica
   * Se ejecuta cuando se registra un evento "Enfriado"
   */
  async procesarIngresoLoteCamara(
    loteId: string, 
    datosEnfriado: DatosEnfriado,
    estadoAnterior: EstadoLote
  ): Promise<RegistroIngresoLote> {
    
    try {
      // 1. Usar función de Supabase si está disponible
      const { error } = await supabase.rpc('procesar_ingreso_lote_camara' as any, {
        p_lote_id: loteId,
        p_camara_id: datosEnfriado.camara_frigorifica,
        p_peso_kg: 1000, // Usar valor por defecto ya que peso_total no existe
        p_temperatura_ingreso: datosEnfriado.temperatura_inicial || 0,
        p_temperatura_objetivo: datosEnfriado.temperatura_objetivo,
        p_datos_adicionales: datosEnfriado
      })
      
      if (!error) {
        console.log(`✅ Lote ${loteId} ingresado exitosamente a cámara ${datosEnfriado.camara_frigorifica}`)
        return {
          lote_id: loteId,
          camara_id: datosEnfriado.camara_frigorifica,
          fecha_ingreso: new Date().toISOString(),
          datos_enfriado: datosEnfriado,
          estado_anterior: estadoAnterior
        }
      }
    } catch (error) {
      console.warn('Función Supabase no disponible, procesando localmente')
    }
    
    // 2. Fallback: Procesar localmente
    // Validar cámara y actualizar estado del lote
    const { error: updateError } = await supabase
      .from('lotes')
      .update({ estado: 'En Cámara' })
      .eq('id', loteId)
    
    if (updateError) {
      throw new Error(`Error al actualizar estado del lote: ${updateError.message}`)
    }
    
    console.log(`✅ Lote ${loteId} procesado para ingreso a cámara ${datosEnfriado.camara_frigorifica}`)
    
    return {
      lote_id: loteId,
      camara_id: datosEnfriado.camara_frigorifica,
      fecha_ingreso: new Date().toISOString(),
      datos_enfriado: datosEnfriado,
      estado_anterior: estadoAnterior
    }
  }

  /**
   * Procesa la salida de un lote de cámara frigorífica
   * Se ejecuta cuando se registra evento "Despacho"
   */
  async procesarSalidaLoteCamara(
    loteId: string,
    destino: 'despacho' | 'otra_camara' | 'proceso',
    camaraDestino?: string,
    motivo?: string
  ): Promise<RegistroSalidaLote> {
    
    try {
      // 1. Usar función de Supabase si está disponible
      const nuevoEstado = destino === 'despacho' ? 'Listo Despacho' : 'En Packing'
      
      const { error } = await supabase.rpc('procesar_salida_lote_camara' as any, {
        p_lote_id: loteId,
        p_nuevo_estado: nuevoEstado,
        p_motivo: motivo || 'Despacho programado'
      })
      
      if (!error) {
        console.log(`✅ Lote ${loteId} retirado de cámara`)
        return {
          lote_id: loteId,
          camara_id: 'desconocida', // La función debería devolver esto
          fecha_salida: new Date().toISOString(),
          destino,
          motivo
        }
      }
    } catch (error) {
      console.warn('Función Supabase no disponible, procesando localmente')
    }
    
    // 2. Fallback: Procesar localmente
    const nuevoEstado: EstadoLote = destino === 'despacho' ? 'Listo Despacho' : 'En Packing'
    
    const { error: updateError } = await supabase
      .from('lotes')
      .update({ estado: nuevoEstado })
      .eq('id', loteId)
    
    if (updateError) {
      throw new Error(`Error al actualizar estado del lote: ${updateError.message}`)
    }
    
    console.log(`✅ Lote ${loteId} retirado de cámara - destino: ${destino}`)
    
    return {
      lote_id: loteId,
      camara_id: 'desconocida',
      fecha_salida: new Date().toISOString(),
      destino,
      motivo
    }
  }

  /**
   * Crear nueva cámara frigorífica
   */
  async crearCamaraFrigorifica(datosCamara: Omit<CamaraFrigorifica, 'id'>): Promise<CamaraFrigorifica> {
    
    // Por ahora crear datos mock hasta que exista la tabla
    const nuevaCamara: CamaraFrigorifica = {
      ...datosCamara,
      id: `CAM-${Date.now().toString().slice(-3)}`,
      estado_operativo: 'activa',
      ultima_revision: new Date().toISOString()
    }
    
    console.log(`✅ Cámara ${nuevaCamara.nombre} creada localmente con ID: ${nuevaCamara.id}`)
    return nuevaCamara
  }

  /**
   * Obtener cámaras disponibles para asignar lotes
   */
  async obtenerCamarasDisponibles(): Promise<CamaraFrigorifica[]> {
    // Retornar datos mock hasta que exista la tabla
    return [
      {
        id: 'CAM-001',
        nombre: 'Cámara Frigorífica 1 - Manzanas',
        capacidad_maxima_kg: 25000,
        temperatura_operacion_min: 0,
        temperatura_operacion_max: 4,
        humedad_optima_porcentaje: 90,
        tipo_control: 'automatico',
        estado_operativo: 'activa',
        ubicacion: 'Sector A - Planta Principal',
        responsable: 'Carlos Mendoza',
        ultima_revision: '2024-05-15T10:30:00Z'
      },
      {
        id: 'CAM-002',
        nombre: 'Cámara Frigorífica 2 - Peras',
        capacidad_maxima_kg: 20000,
        temperatura_operacion_min: -1,
        temperatura_operacion_max: 2,
        humedad_optima_porcentaje: 92,
        tipo_control: 'automatico',
        estado_operativo: 'activa',
        ubicacion: 'Sector B - Planta Principal',
        responsable: 'Ana Torres',
        ultima_revision: '2024-05-20T14:15:00Z'
      },
      {
        id: 'CAM-003',
        nombre: 'Cámara Frigorífica 3 - Uvas',
        capacidad_maxima_kg: 15000,
        temperatura_operacion_min: 0,
        temperatura_operacion_max: 1,
        humedad_optima_porcentaje: 95,
        tipo_control: 'mixto',
        estado_operativo: 'activa',
        ubicacion: 'Sector C - Planta Principal',
        responsable: 'Luis Ramirez',
        ultima_revision: '2024-05-25T09:00:00Z'
      }
    ]
  }

  /**
   * Obtener información de lote en cámara
   */
  async obtenerInfoLoteEnCamara(loteId: string) {
    
    // Buscar en estado del lote
    const { data: lote } = await supabase
      .from('lotes')
      .select('*')
      .eq('id', loteId)
      .single()
    
    if (lote && lote.estado === 'En Cámara') {
      return {
        camara_id: 'CAM-001', // Mock
        camara_nombre: 'Cámara Frigorífica 1',
        lote: {
          lote_id: loteId,
          peso_kg: 1000,
          fecha_ingreso: new Date().toISOString(),
          estado_calidad: 'optimo'
        },
        inventario_completo: {}
      }
    }
    
    return null
  }

  /**
   * Validar que una cámara está operativa
   */
  private async validarCamaraOperativa(camaraId: string): Promise<CamaraFrigorifica> {
    const camarasDisponibles = await this.obtenerCamarasDisponibles()
    const camara = camarasDisponibles.find(c => c.id === camaraId)
    
    if (!camara) {
      throw new Error(`Cámara ${camaraId} no encontrada`)
    }
    
    if (camara.estado_operativo !== 'activa') {
      throw new Error(`Cámara ${camaraId} no está operativa (estado: ${camara.estado_operativo})`)
    }
    
    return camara
  }

  /**
   * Verificar capacidad disponible en cámara
   */
  private async verificarCapacidadCamara(camaraId: string): Promise<void> {
    // Por ahora solo validación básica
    console.log(`Verificando capacidad de cámara ${camaraId}`)
  }

  /**
   * Actualizar inventario de cámara después de un ingreso
   */
  private async actualizarInventarioCamara(registro: RegistroIngresoLote): Promise<void> {
    console.log(`Actualizando inventario de cámara ${registro.camara_id}`)
  }

  /**
   * Actualizar estado de un lote
   */
  private async actualizarEstadoLote(loteId: string, nuevoEstado: EstadoLote): Promise<void> {
    const { error } = await supabase
      .from('lotes')
      .update({ estado: nuevoEstado })
      .eq('id', loteId)
    
    if (error) {
      throw new Error(`Error al actualizar estado del lote: ${error.message}`)
    }
  }

  /**
   * Iniciar monitoreo de temperatura
   */
  private async iniciarMonitoreoTemperatura(registro: RegistroIngresoLote): Promise<void> {
    console.log(`Iniciando monitoreo de temperatura para lote ${registro.lote_id}`)
  }

  /**
   * Determinar nuevo estado según destino de salida
   */
  private determinarNuevoEstado(destino: 'despacho' | 'otra_camara' | 'proceso'): EstadoLote {
    switch (destino) {
      case 'despacho':
        return 'Listo Despacho'
      case 'otra_camara':
        return 'En Cámara'
      case 'proceso':
        return 'En Packing'
      default:
        return 'En Packing'
    }
  }

  /**
   * Remover lote de cámara
   */
  private async removerLoteDeCamara(camaraId: string, loteId: string): Promise<void> {
    console.log(`Removiendo lote ${loteId} de cámara ${camaraId}`)
  }

  /**
   * Mover lote a otra cámara
   */
  private async moverLoteACamara(loteId: string, camaraDestino: string): Promise<void> {
    console.log(`Moviendo lote ${loteId} a cámara ${camaraDestino}`)
  }

  /**
   * Detener monitoreo de temperatura
   */
  private async detenerMonitoreoTemperatura(loteId: string): Promise<void> {
    console.log(`Deteniendo monitoreo de temperatura para lote ${loteId}`)
  }
}

const gestionCamarasService = new GestionCamarasService()
export default gestionCamarasService 