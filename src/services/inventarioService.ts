// Servicio para gestión de inventarios y cámaras frigoríficas

import { 
  CamaraFrigorifica, 
  InventarioCamara, 
  ReporteInventarioEstado,
  ReporteInventarioConsolidado,
  FiltrosInventario,
  AlertaCamara,
  LoteEnCamara,
  MetricasEficienciaCamara
} from '../types/inventario'
import { EstadoLote } from '../types/database'
import { supabase } from '../lib/supabase'

// Datos mock de cámaras frigoríficas para demo
const CAMARAS_MOCK: CamaraFrigorifica[] = [
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
  },
  {
    id: 'CAM-004',
    nombre: 'Cámara Frigorífica 4 - Multiuso',
    capacidad_maxima_kg: 30000,
    temperatura_operacion_min: -2,
    temperatura_operacion_max: 4,
    humedad_optima_porcentaje: 88,
    tipo_control: 'automatico',
    estado_operativo: 'mantenimiento',
    ubicacion: 'Sector D - Planta Secundaria',
    responsable: 'Patricia Silva',
    ultima_revision: '2024-05-10T16:45:00Z'
  }
]

class InventarioService {
  
  // Obtener todas las cámaras frigoríficas
  async obtenerCamaras(): Promise<CamaraFrigorifica[]> {
    try {
      // 1. Intentar obtener desde Supabase usando any para evitar errores de tipos
      const response = await (supabase as any)
        .from('camaras_frigorificas')
        .select('*')
        .eq('activo', true)
        .order('nombre')
      
      if (!response.error && response.data && response.data.length > 0) {
        return response.data as CamaraFrigorifica[]
      }
    } catch (error) {
      console.warn('Tabla camaras_frigorificas no disponible, usando datos mock')
    }
    
    // 2. Fallback: usar datos mock
    await new Promise(resolve => setTimeout(resolve, 300))
    return CAMARAS_MOCK
  }

  // Obtener inventario de una cámara específica
  async obtenerInventarioCamara(camaraId: string): Promise<InventarioCamara> {
    try {
      // 1. Intentar usar función de Supabase
      const { data, error } = await supabase
        .rpc('obtener_inventario_camara' as any, { p_camara_id: camaraId })
      
      if (!error && data) {
        return data
      }
    } catch (error) {
      console.warn('Función obtener_inventario_camara no disponible, usando datos mock')
    }
    
    // 2. Fallback: generar datos mock
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const camara = CAMARAS_MOCK.find(c => c.id === camaraId)
    if (!camara) {
      throw new Error(`Cámara ${camaraId} no encontrada`)
    }

    // Generar datos mock de lotes en cámara
    const lotesEnCamara: LoteEnCamara[] = this.generarLotesMockEnCamara(camaraId)
    const pesoTotal = lotesEnCamara.reduce((sum, lote) => sum + lote.peso_kg, 0)
    const capacidadUtilizada = (pesoTotal / camara.capacidad_maxima_kg) * 100
    
    return {
      camara_id: camaraId,
      camara_nombre: camara.nombre,
      lotes_almacenados: lotesEnCamara,
      peso_total_actual_kg: pesoTotal,
      capacidad_utilizada_porcentaje: Math.round(capacidadUtilizada * 100) / 100,
      temperatura_actual: this.generarTemperaturaActual(camara),
      humedad_actual: camara.humedad_optima_porcentaje + (Math.random() - 0.5) * 4,
      fecha_actualizacion: new Date().toISOString(),
      alertas_activas: this.generarAlertasMock(camaraId, capacidadUtilizada)
    }
  }

  // Obtener reporte de inventario por estado
  async obtenerInventarioPorEstado(estado: EstadoLote): Promise<ReporteInventarioEstado> {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    try {
      // Obtener lotes por estado desde Supabase
      const { data: lotes, error } = await supabase
        .from('v_lotes_completos')
        .select('*')
        .eq('estado', estado)
      
      if (!error && lotes) {
        const totalLotes = lotes.length
        const areaTotal = lotes.reduce((sum, lote) => sum + (lote.area || 0), 0)
        const pesoEstimado = areaTotal * 50000 // Estimación: 50 ton por hectárea
        
        return {
          estado,
          cantidad_lotes: totalLotes,
          total_lotes: totalLotes,
          peso_total_kg: pesoEstimado,
          area_total_hectareas: areaTotal,
          cultivos_involucrados: [],
          fecha_generacion: new Date().toISOString(),
          fecha_actualizacion: new Date().toISOString(),
          lotes_detalle: lotes.map(lote => ({
            lote_id: lote.id || '',
            cultivo: lote.cultivo || '',
            variedad: lote.variedad || '',
            cuartel: lote.cuartel_origen || '',
            area_hectareas: lote.area || 0,
            peso_estimado_kg: (lote.area || 0) * 50000,
            fecha_ultimo_evento: lote.fecha_ultimo_evento || new Date().toISOString(),
            dias_en_estado_actual: this.calcularDiasEnEstado(lote.fecha_ultimo_evento || undefined),
            ubicacion_actual: estado === 'En Cámara' ? 'Cámara Frigorífica' : undefined,
            temperatura_actual: estado === 'En Cámara' ? 2.5 : undefined
          }))
        }
      }
    } catch (error) {
      console.warn('Error al obtener lotes desde Supabase, usando datos mock')
    }
    
    // Fallback: generar datos mock
    return this.generarReporteMockPorEstado(estado)
  }

  // Generar reporte consolidado de inventarios
  async generarReporteConsolidado(filtros?: FiltrosInventario): Promise<ReporteInventarioConsolidado> {
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const camaras = await this.obtenerCamaras()
    const estados: EstadoLote[] = [
      'En Cosecha', 'Cosecha Completa', 'En Packing', 
      'Empacado', 'En Cámara', 'Listo Despacho', 'Despachado'
    ]
    
    // Obtener inventarios por estado
    const inventariosPorEstado = await Promise.all(
      estados.map(estado => this.obtenerInventarioPorEstado(estado))
    )
    
    // Obtener inventarios de cámaras activas
    const camarasActivas = camaras.filter(c => c.estado_operativo === 'activa')
    const inventariosCamaras = await Promise.all(
      camarasActivas.map(camara => this.obtenerInventarioCamara(camara.id))
    )
    
    // Calcular métricas globales
    const totalLotes = inventariosPorEstado.reduce((sum, inv) => sum + inv.total_lotes, 0)
    const pesoTotal = inventariosPorEstado.reduce((sum, inv) => sum + inv.peso_total_kg, 0)
    const areaTotal = inventariosPorEstado.reduce((sum, inv) => sum + inv.area_total_hectareas, 0)
    const capacidadFrigorificaTotal = camaras.reduce((sum, cam) => sum + cam.capacidad_maxima_kg, 0)
    const capacidadFrigorificaUtilizada = inventariosCamaras.reduce((sum, inv) => sum + inv.peso_total_actual_kg, 0)
    
    // Generar alertas globales
    const todasLasAlertas = inventariosCamaras.flatMap(inv => inv.alertas_activas)
    
    return {
      fecha_generacion: new Date().toISOString(),
      resumen_global: {
        total_lotes: totalLotes,
        peso_total_kg: pesoTotal,
        area_total_hectareas: areaTotal,
        capacidad_frigorifica_total: capacidadFrigorificaTotal,
        capacidad_frigorifica_utilizada: capacidadFrigorificaUtilizada,
        eficiencia_operativa: capacidadFrigorificaTotal > 0 
          ? Math.round((capacidadFrigorificaUtilizada / capacidadFrigorificaTotal) * 100 * 100) / 100
          : 0
      },
      inventario_por_estado: inventariosPorEstado,
      inventario_camaras: inventariosCamaras,
      alertas_activas: todasLasAlertas,
      recomendaciones: this.generarRecomendaciones(inventariosCamaras, todasLasAlertas)
    }
  }

  // Obtener métricas de eficiencia de una cámara
  async obtenerMetricasEficiencia(camaraId: string, diasAtras: number = 30): Promise<MetricasEficienciaCamara> {
    try {
      // 1. Intentar usar función de Supabase
      const { data, error } = await supabase
        .rpc('obtener_metricas_eficiencia_camara' as any, {
          p_camara_id: camaraId,
          p_dias_atras: diasAtras
        })
      
      if (!error && data) {
        return data
      }
    } catch (error) {
      console.warn('Función obtener_metricas_eficiencia_camara no disponible, usando datos mock')
    }
    
    // 2. Fallback: generar datos mock
    await new Promise(resolve => setTimeout(resolve, 300))
    
    return {
      camara_id: camaraId,
      periodo_dias: diasAtras,
      utilizacion_promedio_porcentaje: 65 + Math.random() * 25,
      tiempo_promedio_almacenaje_dias: 5 + Math.random() * 10,
      rotacion_inventario: 2 + Math.random() * 2,
      temperatura_estabilidad_porcentaje: 95 + Math.random() * 4,
      incidencias_temperatura: Math.floor(Math.random() * 3),
      energia_consumida_kwh: 1500 + Math.random() * 500,
      costo_operativo_periodo: 250000 + Math.random() * 100000
    }
  }

  // Métodos auxiliares privados
  
  private generarLotesMockEnCamara(camaraId: string): LoteEnCamara[] {
    const tiposProducto = {
      'CAM-001': { base: 'L-2024-0', cultivo: 'Manzana', variedad: 'Gala' },
      'CAM-002': { base: 'L-2024-1', cultivo: 'Pera', variedad: 'Packham' },
      'CAM-003': { base: 'L-2024-2', cultivo: 'Uva', variedad: 'Red Globe' },
      'CAM-004': { base: 'L-2024-3', cultivo: 'Cereza', variedad: 'Bing' }
    }
    
    const config = tiposProducto[camaraId as keyof typeof tiposProducto] || tiposProducto['CAM-001']
    const numLotes = Math.floor(Math.random() * 5) + 2 // 2-6 lotes por cámara
    
    return Array.from({ length: numLotes }, (_, i) => {
      const diasEnCamara = Math.floor(Math.random() * 15) + 1
      const fechaIngreso = new Date()
      fechaIngreso.setDate(fechaIngreso.getDate() - diasEnCamara)
      
      return {
        lote_id: `${config.base}${String(i + 1).padStart(2, '0')}`,
        cultivo: config.cultivo,
        variedad: config.variedad,
        peso_kg: Math.floor(Math.random() * 3000) + 1000,
        fecha_ingreso: fechaIngreso.toISOString(),
        dias_en_camara: diasEnCamara,
        temperatura_ingreso: -1 + Math.random() * 6,
        temperatura_objetivo: 0 + Math.random() * 3,
        estado_calidad: ['optimo', 'bueno', 'en_observacion'][Math.floor(Math.random() * 3)] as any,
        fecha_vencimiento_estimado: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    })
  }
  
  private generarTemperaturaActual(camara: CamaraFrigorifica): number {
    const rango = camara.temperatura_operacion_max - camara.temperatura_operacion_min
    return camara.temperatura_operacion_min + (Math.random() * rango) + (Math.random() - 0.5) * 0.5
  }
  
  private generarAlertasMock(camaraId: string, capacidadUtilizada: number): AlertaCamara[] {
    const alertas: AlertaCamara[] = []
    
    // Alerta de capacidad si está muy llena
    if (capacidadUtilizada > 85) {
      alertas.push({
        id: `alert_${camaraId}_capacity`,
        tipo: 'capacidad',
        nivel: capacidadUtilizada > 95 ? 'critical' : 'warning',
        mensaje: `Cámara al ${capacidadUtilizada.toFixed(1)}% de capacidad`,
        fecha_creacion: new Date().toISOString(),
        resuelto: false
      })
    }
    
    // Alerta de temperatura ocasional
    if (Math.random() < 0.3) {
      alertas.push({
        id: `alert_${camaraId}_temp`,
        tipo: 'temperatura',
        nivel: Math.random() < 0.5 ? 'warning' : 'info',
        mensaje: 'Fluctuación de temperatura detectada',
        fecha_creacion: new Date().toISOString(),
        resuelto: false
      })
    }
    
    return alertas
  }
  
  private calcularDiasEnEstado(fechaUltimoEvento?: string): number {
    if (!fechaUltimoEvento) return 0
    const ahora = new Date()
    const fechaEvento = new Date(fechaUltimoEvento)
    const diferencia = ahora.getTime() - fechaEvento.getTime()
    return Math.floor(diferencia / (1000 * 60 * 60 * 24))
  }
  
  private generarReporteMockPorEstado(estado: EstadoLote): ReporteInventarioEstado {
    // Generar datos mock basados en el estado
    const numLotes = Math.floor(Math.random() * 10) + 5
    const areaTotal = numLotes * (2 + Math.random() * 3) // 2-5 ha por lote
    const pesoTotal = areaTotal * 50000 // 50 ton por hectárea estimado
    
    return {
      estado,
      cantidad_lotes: numLotes,
      total_lotes: numLotes,
      peso_total_kg: pesoTotal,
      area_total_hectareas: areaTotal,
      cultivos_involucrados: [],
      fecha_generacion: new Date().toISOString(),
      fecha_actualizacion: new Date().toISOString(),
      lotes_detalle: Array.from({ length: numLotes }, (_, i) => ({
        lote_id: `L-2024-${String(i + 1).padStart(3, '0')}`,
        cultivo: ['Manzana', 'Pera', 'Uva', 'Cereza'][Math.floor(Math.random() * 4)],
        variedad: ['Gala', 'Fuji', 'Packham', 'Red Globe'][Math.floor(Math.random() * 4)],
        cuartel: `Cuartel ${String.fromCharCode(65 + Math.floor(Math.random() * 5))}`,
        area_hectareas: 2 + Math.random() * 3,
        peso_estimado_kg: (2 + Math.random() * 3) * 50000,
        fecha_ultimo_evento: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        dias_en_estado_actual: Math.floor(Math.random() * 7) + 1,
        ubicacion_actual: estado === 'En Cámara' ? `Cámara ${Math.ceil(Math.random() * 4)}` : undefined,
        temperatura_actual: estado === 'En Cámara' ? 0 + Math.random() * 4 : undefined
      }))
    }
  }
  
  private generarRecomendaciones(inventariosCamaras: InventarioCamara[], alertas: AlertaCamara[]): string[] {
    const recomendaciones: string[] = []
    
    // Recomendaciones basadas en capacidad
    const camarasLlenas = inventariosCamaras.filter(inv => inv.capacidad_utilizada_porcentaje > 85)
    if (camarasLlenas.length > 0) {
      recomendaciones.push(`${camarasLlenas.length} cámara(s) con alta ocupación. Considerar despachos prioritarios.`)
    }
    
    // Recomendaciones basadas en alertas críticas
    const alertasCriticas = alertas.filter(a => a.nivel === 'critical')
    if (alertasCriticas.length > 0) {
      recomendaciones.push(`${alertasCriticas.length} alerta(s) crítica(s) requieren atención inmediata.`)
    }
    
    // Recomendaciones de eficiencia
    const capacidadPromedioUtilizada = inventariosCamaras.reduce((sum, inv) => sum + inv.capacidad_utilizada_porcentaje, 0) / inventariosCamaras.length
    if (capacidadPromedioUtilizada < 60) {
      recomendaciones.push('Capacidad frigorífica subutilizada. Evaluar optimización de espacios.')
    }
    
    if (recomendaciones.length === 0) {
      recomendaciones.push('Operación dentro de parámetros normales.')
    }
    
    return recomendaciones
  }
}

const inventarioService = new InventarioService()
export default inventarioService 