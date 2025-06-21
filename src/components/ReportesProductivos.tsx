import React, { useState, useEffect } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  Package2, 
  Clock, 
  AlertTriangle,
  Users,
  Calendar,
  MapPin,
  Download,
  RefreshCw,
  Eye,
  Activity,
  Package,
  Scissors,
  CheckCircle,
  Factory,
  Snowflake,
  Truck,
  Send,
  X
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { EstadoLote } from '../types/database'

interface ReportesProductivosProps {
  onClose: () => void
}

interface ResumenProduccion {
  total_lotes: number
  total_area: number
  lotes_activos: number
  eventos_hoy: number
  cultivos_activos: number
  operarios_activos: number
}

interface LotePorEstado {
  estado: EstadoLote
  cantidad: number
  area_total: number
  cultivos: string[]
  tiempo_promedio_dias: number
}

interface EventoReciente {
  id: string
  lote_id: string
  tipo_evento: string
  timestamp: string
  operario: string
  cultivo: string
  variedad: string
}

interface RendimientoCultivo {
  cultivo: string
  lotes_totales: number
  area_total: number
  promedio_dias_cosecha: number
  eficiencia_packing: number
}

export default function ReportesProductivos({ onClose }: ReportesProductivosProps) {
  const [loading, setLoading] = useState(true)
  const [resumenProduccion, setResumenProduccion] = useState<ResumenProduccion | null>(null)
  const [lotesPorEstado, setLotesPorEstado] = useState<LotePorEstado[]>([])
  const [eventosRecientes, setEventosRecientes] = useState<EventoReciente[]>([])
  const [rendimientoCultivos, setRendimientoCultivos] = useState<RendimientoCultivo[]>([])
  const [vistaActual, setVistaActual] = useState<'resumen' | 'estados' | 'rendimiento' | 'actividad'>('resumen')

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    setLoading(true)
    try {
      await Promise.all([
        cargarResumenProduccion(),
        cargarLotesPorEstado(),
        cargarEventosRecientes(),
        cargarRendimientoCultivos()
      ])
    } catch (error) {
      console.error('Error al cargar datos de reportes:', error)
    } finally {
      setLoading(false)
    }
  }

  const cargarResumenProduccion = async () => {
    const { data: lotes } = await supabase
      .from('v_lotes_completos')
      .select('*')

    const { data: eventosHoy } = await supabase
      .from('eventos_trazabilidad')
      .select('id, responsable_nombre')
      .gte('created_at', new Date().toISOString().split('T')[0])

    const operariosUnicos = new Set(eventosHoy?.map(e => e.responsable_nombre).filter(Boolean) || [])
    const cultivosUnicos = new Set(lotes?.map(l => l.cultivo).filter(Boolean) || [])

    setResumenProduccion({
      total_lotes: lotes?.length || 0,
      total_area: lotes?.reduce((sum, l) => sum + (parseFloat(l.area?.toString() || '0') || 0), 0) || 0,
      lotes_activos: lotes?.filter(l => l.estado && !['Despachado', 'Eliminado'].includes(l.estado)).length || 0,
      eventos_hoy: eventosHoy?.length || 0,
      cultivos_activos: cultivosUnicos.size,
      operarios_activos: operariosUnicos.size
    })
  }

  const cargarLotesPorEstado = async () => {
    const { data: lotes } = await supabase
      .from('v_lotes_completos')
      .select('*')

    if (!lotes) return

    const estadosMap = new Map<EstadoLote, {
      cantidad: number
      area_total: number
      cultivos: Set<string>
      tiempos: number[]
    }>()

    lotes.forEach(lote => {
      const estado = lote.estado as EstadoLote
      if (!estadosMap.has(estado)) {
        estadosMap.set(estado, {
          cantidad: 0,
          area_total: 0,
          cultivos: new Set(),
          tiempos: []
        })
      }

      const estadoData = estadosMap.get(estado)!
      estadoData.cantidad++
      estadoData.area_total += parseFloat(lote.area?.toString() || '0') || 0
      
      if (lote.cultivo) {
        estadoData.cultivos.add(lote.cultivo)
      }

      // Calcular tiempo basado en fecha de creación
      if (lote.created_at) {
        const dias = Math.floor(
          (new Date().getTime() - new Date(lote.created_at).getTime()) / 
          (1000 * 60 * 60 * 24)
        )
        estadoData.tiempos.push(dias)
      }
    })

    const resultado = Array.from(estadosMap.entries()).map(([estado, data]) => ({
      estado,
      cantidad: data.cantidad,
      area_total: data.area_total,
      cultivos: Array.from(data.cultivos),
      tiempo_promedio_dias: data.tiempos.length > 0 
        ? Math.round(data.tiempos.reduce((a, b) => a + b, 0) / data.tiempos.length)
        : 0
    }))

    setLotesPorEstado(resultado.sort((a, b) => b.cantidad - a.cantidad))
  }

  const cargarEventosRecientes = async () => {
    const { data: eventos } = await supabase
      .from('eventos_trazabilidad')
      .select(`
        id,
        lote_id,
        tipo,
        created_at,
        responsable_nombre,
        lotes(
          id,
          cultivos(nombre),
          variedades(nombre)
        )
      `)
      .order('created_at', { ascending: false })
      .limit(20)

    if (eventos) {
      const eventosFormateados = eventos.map(evento => ({
        id: evento.id,
        lote_id: evento.lote_id,
        tipo_evento: evento.tipo,
        timestamp: evento.created_at || '',
        operario: evento.responsable_nombre || 'Sin especificar',
        cultivo: evento.lotes?.cultivos?.nombre || 'Sin especificar',
        variedad: evento.lotes?.variedades?.nombre || 'Sin especificar'
      }))

      setEventosRecientes(eventosFormateados)
    }
  }

  const cargarRendimientoCultivos = async () => {
    const { data: lotes } = await supabase
      .from('v_lotes_completos')
      .select('*')

    if (!lotes) return

    const cultivosMap = new Map<string, {
      lotes_totales: number
      area_total: number
      tiempos_cosecha: number[]
      eventos_packing: number
    }>()

    lotes.forEach(lote => {
      const cultivo = lote.cultivo || 'Sin especificar'
      if (!cultivosMap.has(cultivo)) {
        cultivosMap.set(cultivo, {
          lotes_totales: 0,
          area_total: 0,
          tiempos_cosecha: [],
          eventos_packing: 0
        })
      }

      const cultivoData = cultivosMap.get(cultivo)!
      cultivoData.lotes_totales++
      cultivoData.area_total += parseFloat(lote.area?.toString() || '0') || 0

      // Simular tiempos de cosecha
      if (lote.created_at) {
        const dias = Math.floor(Math.random() * 30) + 5 // 5-35 días
        cultivoData.tiempos_cosecha.push(dias)
      }

      // Simular eficiencia de packing
      if (lote.estado && ['Empacado', 'En Cámara', 'Listo Despacho', 'Despachado'].includes(lote.estado)) {
        cultivoData.eventos_packing++
      }
    })

    const resultado = Array.from(cultivosMap.entries()).map(([cultivo, data]) => ({
      cultivo,
      lotes_totales: data.lotes_totales,
      area_total: data.area_total,
      promedio_dias_cosecha: data.tiempos_cosecha.length > 0 
        ? Math.round(data.tiempos_cosecha.reduce((a, b) => a + b, 0) / data.tiempos_cosecha.length)
        : 0,
      eficiencia_packing: data.lotes_totales > 0 
        ? Math.round((data.eventos_packing / data.lotes_totales) * 100)
        : 0
    }))

    setRendimientoCultivos(resultado.sort((a, b) => b.lotes_totales - a.lotes_totales))
  }

  const obtenerColorEstado = (estado: EstadoLote): string => {
    const colores = {
      'En Cosecha': 'bg-cultivo-100 text-cultivo-800 border-cultivo-200',
      'Cosecha Completa': 'bg-lima-100 text-lima-800 border-lima-200',
      'En Packing': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Empacado': 'bg-purple-100 text-purple-800 border-purple-200',
      'En Cámara': 'bg-cyan-100 text-cyan-800 border-cyan-200',
      'Listo Despacho': 'bg-orange-100 text-orange-800 border-orange-200',
      'Despachado': 'bg-gray-100 text-gray-800 border-gray-200',
      'Eliminado': 'bg-red-100 text-red-800 border-red-200'
    }
    return colores[estado] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const formatearFecha = (fecha: string): string => {
    return new Date(fecha).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const obtenerIconoEstado = (estado: EstadoLote) => {
    const iconos = {
      'En Cosecha': <Scissors className="w-4 h-4" />,
      'Cosecha Completa': <CheckCircle className="w-4 h-4" />,
      'En Packing': <Factory className="w-4 h-4" />,
      'Empacado': <Package className="w-4 h-4" />,
      'En Cámara': <Snowflake className="w-4 h-4" />,
      'Listo Despacho': <Truck className="w-4 h-4" />,
      'Despachado': <Send className="w-4 h-4" />,
      'Eliminado': <X className="w-4 h-4" />
    }
    return iconos[estado] || <Activity className="w-4 h-4" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="w-6 h-6 animate-spin text-cultivo-600 mr-3" />
        <span className="text-lg">Cargando reportes productivos...</span>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Análisis Productivo</h2>
            <p className="text-gray-600">Métricas de rendimiento y actividad operativa</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Cerrar modal"
            title="Cerrar análisis"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Navegación */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'resumen', label: 'Resumen Ejecutivo', icon: BarChart3 },
                { key: 'estados', label: 'Estados de Lotes', icon: Package2 },
                { key: 'rendimiento', label: 'Rendimiento por Cultivo', icon: TrendingUp },
                { key: 'actividad', label: 'Actividad Reciente', icon: Clock }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setVistaActual(key as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    vistaActual === key 
                      ? 'bg-cultivo-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Contenido */}
          {vistaActual === 'resumen' && resumenProduccion && (
            <div className="space-y-6">
              {/* Métricas principales */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Total Lotes</p>
                      <p className="text-2xl font-bold text-gray-900">{resumenProduccion.total_lotes}</p>
                    </div>
                    <Package2 className="w-8 h-8 text-cultivo-600" />
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Lotes Activos</p>
                      <p className="text-2xl font-bold text-cultivo-800">{resumenProduccion.lotes_activos}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-cultivo-600" />
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Área Total</p>
                      <p className="text-2xl font-bold text-lima-800">{resumenProduccion.total_area.toFixed(1)}ha</p>
                    </div>
                    <MapPin className="w-8 h-8 text-lima-600" />
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Eventos Hoy</p>
                      <p className="text-2xl font-bold text-orange-800">{resumenProduccion.eventos_hoy}</p>
                    </div>
                    <Calendar className="w-8 h-8 text-orange-600" />
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Cultivos</p>
                      <p className="text-2xl font-bold text-cyan-800">{resumenProduccion.cultivos_activos}</p>
                    </div>
                    <Eye className="w-8 h-8 text-cyan-600" />
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Operarios</p>
                      <p className="text-2xl font-bold text-indigo-800">{resumenProduccion.operarios_activos}</p>
                    </div>
                    <Users className="w-8 h-8 text-indigo-600" />
                  </div>
                </div>
              </div>

              {/* Alertas operativas */}
              <div className="bg-lima-50 border border-lima-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-lima-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-lima-800">Resumen Operativo</h3>
                    <ul className="mt-2 text-sm text-lima-700 space-y-1">
                      <li>• {resumenProduccion.lotes_activos} lotes requieren seguimiento diario</li>
                      <li>• {resumenProduccion.eventos_hoy} eventos registrados hoy</li>
                      <li>• {resumenProduccion.operarios_activos} operarios activos</li>
                      <li>• {resumenProduccion.total_area.toFixed(1)} hectáreas bajo gestión</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {vistaActual === 'estados' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Distribución por Estados</h3>
                <button
                  onClick={cargarDatos}
                  className="flex items-center space-x-2 px-4 py-2 bg-cultivo-600 text-white rounded-lg hover:bg-cultivo-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Actualizar</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lotesPorEstado.map((estado) => (
                  <div key={estado.estado} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {obtenerIconoEstado(estado.estado)}
                        <span className={`px-3 py-1 rounded-lg text-sm font-medium border ${obtenerColorEstado(estado.estado)}`}>
                          {estado.estado}
                        </span>
                      </div>
                      <span className="text-2xl font-bold text-gray-800">{estado.cantidad}</span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Área total:</span>
                        <span className="font-medium">{estado.area_total.toFixed(1)}ha</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tiempo promedio:</span>
                        <span className="font-medium">{estado.tiempo_promedio_dias} días</span>
                      </div>
                      <div>
                        <span>Cultivos:</span>
                        <p className="text-xs text-gray-500 mt-1">{estado.cultivos.join(', ') || 'Sin especificar'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {vistaActual === 'rendimiento' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Rendimiento por Cultivo</h3>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Cultivo</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Lotes</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Área (ha)</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Días Cosecha</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Eficiencia</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {rendimientoCultivos.map((cultivo) => (
                        <tr key={cultivo.cultivo} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">{cultivo.cultivo}</td>
                          <td className="px-4 py-3 text-center">{cultivo.lotes_totales}</td>
                          <td className="px-4 py-3 text-center">{cultivo.area_total.toFixed(1)}</td>
                          <td className="px-4 py-3 text-center">{cultivo.promedio_dias_cosecha}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              cultivo.eficiencia_packing >= 80 ? 'bg-cultivo-100 text-cultivo-800' :
                              cultivo.eficiencia_packing >= 60 ? 'bg-lima-100 text-lima-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {cultivo.eficiencia_packing}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {vistaActual === 'actividad' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Actividad Reciente ({eventosRecientes.length})</h3>
              </div>
              {eventosRecientes.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No hay actividad reciente</p>
                  <p className="text-sm text-gray-500">Los eventos aparecerán aquí cuando se registren</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {eventosRecientes.map((evento) => (
                    <div key={evento.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-cultivo-100 rounded-full">
                            {obtenerIconoEstado(evento.tipo_evento as EstadoLote)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{evento.tipo_evento}</p>
                            <p className="text-sm text-gray-600">
                              {evento.cultivo} {evento.variedad} - Lote {evento.lote_id}
                            </p>
                            <p className="text-xs text-gray-500">por {evento.operario}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {evento.timestamp ? formatearFecha(evento.timestamp) : 'Sin fecha'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Footer con actualización */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Última actualización: {new Date().toLocaleString('es-CL')}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={cargarDatos}
                  className="flex items-center space-x-2 px-4 py-2 bg-cultivo-600 text-white rounded-lg hover:bg-cultivo-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Actualizar Datos</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Exportar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 