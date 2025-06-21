import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { 
  FileText, 
  Download, 
  Filter, 
  Calendar, 
  Package, 
  Search, 
  MapPin, 
  TrendingUp,
  BarChart3,
  X,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface LoteReporte {
  id: string
  cultivo: string
  variedad: string
  cuartel: string
  area: number
  fecha_cosecha: string
  estado: string
  peso_estimado_kg: number
  total_eventos: number
  eventos_completados: number
  dias_activo: number
  responsable_nombre: string
  ubicacion_actual: string
  observaciones: string
  fecha_creacion: string
  fecha_ultima_actividad: string
}

interface FiltrosReporte {
  cultivo: string
  estado: string
  fechaInicio: string
  fechaFin: string
  cuartel: string
  responsable: string
}

interface ReporteLotesProps {
  onClose: () => void
}

export default function ReporteLotes({ onClose }: ReporteLotesProps) {
  const [lotes, setLotes] = useState<LoteReporte[]>([])
  const [lotesFiltrados, setLotesFiltrados] = useState<LoteReporte[]>([])
  const [loading, setLoading] = useState(true)
  const [filtros, setFiltros] = useState<FiltrosReporte>({
    cultivo: '',
    estado: '',
    fechaInicio: '',
    fechaFin: '',
    cuartel: '',
    responsable: ''
  })
  const [busqueda, setBusqueda] = useState('')
  const [mostrarFiltros, setMostrarFiltros] = useState(false)

  // Valores únicos para filtros
  const [cultivos, setCultivos] = useState<string[]>([])
  const [estados, setEstados] = useState<string[]>([])
  const [cuarteles, setCuarteles] = useState<string[]>([])
  const [responsables, setResponsables] = useState<string[]>([])

  useEffect(() => {
    cargarDatos()
  }, [])

  useEffect(() => {
    aplicarFiltros()
  }, [lotes, filtros, busqueda])

  const cargarDatos = async () => {
    setLoading(true)
    try {
      // Obtener lotes con información completa
      const { data: lotesData, error } = await supabase
        .from('v_lotes_completos')
        .select(`
          id,
          cultivo,
          variedad,
          cuartel_origen,
          area,
          estado,
          total_eventos,
          created_at,
          fecha_ultimo_evento_real,
          observaciones
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Procesar datos y calcular métricas adicionales
      const lotesConMetricas = await Promise.all((lotesData || []).map(async (lote) => {
        // Obtener eventos completados vs total posible
        const { data: eventosData } = await supabase
          .from('eventos_trazabilidad')
          .select('tipo')
          .eq('lote_id', lote.id || '')

        const eventosUnicos = new Set(eventosData?.map(e => e.tipo) || [])
        const eventosCompletados = eventosUnicos.size

        // Calcular días activo
        const fechaCreacion = new Date(lote.created_at || new Date())
        const fechaUltima = lote.fecha_ultimo_evento_real ? 
          new Date(lote.fecha_ultimo_evento_real) : 
          new Date()
        const diasActivo = Math.ceil((fechaUltima.getTime() - fechaCreacion.getTime()) / (1000 * 60 * 60 * 24))

        return {
          id: lote.id || '',
          cultivo: lote.cultivo || '',
          variedad: lote.variedad || '',
          cuartel: lote.cuartel_origen || '',
          area: lote.area || 0,
          estado: lote.estado || '',
          fecha_cosecha: lote.created_at || new Date().toISOString(),
          fecha_creacion: lote.created_at || new Date().toISOString(),
          peso_estimado_kg: Math.round((lote.area || 0) * 25000),
          total_eventos: Number(lote.total_eventos) || 0,
          responsable_nombre: 'Operador',
          observaciones: lote.observaciones || '',
          eventos_completados: eventosCompletados,
          dias_activo: diasActivo,
          ubicacion_actual: obtenerUbicacionActual(lote.estado || ''),
          fecha_ultima_actividad: lote.fecha_ultimo_evento_real || lote.created_at || new Date().toISOString()
        }
      }))

      setLotes(lotesConMetricas)

      // Extraer valores únicos para filtros
      const cultivosUnicos = Array.from(new Set(lotesConMetricas.map(l => l.cultivo).filter(Boolean)))
      const estadosUnicos = Array.from(new Set(lotesConMetricas.map(l => l.estado).filter(Boolean)))
      const cuartelesUnicos = Array.from(new Set(lotesConMetricas.map(l => l.cuartel).filter(Boolean)))
      const responsablesUnicos = Array.from(new Set(lotesConMetricas.map(l => l.responsable_nombre).filter(Boolean)))

      setCultivos(cultivosUnicos.sort())
      setEstados(estadosUnicos.sort())
      setCuarteles(cuartelesUnicos.sort())
      setResponsables(responsablesUnicos.sort())

    } catch (error) {
      console.error('Error cargando datos del reporte:', error)
    } finally {
      setLoading(false)
    }
  }

  const obtenerUbicacionActual = (estado: string): string => {
    const ubicaciones: Record<string, string> = {
      'Inicio Cosecha': 'Campo',
      'Cosecha Completa': 'Campo',
      'Recepción Packing': 'Packing - Recepción',
      'Selección': 'Packing - Línea Selección',
      'Empaque': 'Packing - Línea Empaque',
      'Paletizado': 'Packing - Área Paletizado',
      'Enfriado': 'Cámara Frigorífica',
      'Control Calidad': 'Laboratorio Calidad',
      'Despacho': 'Área Despacho'
    }
    return ubicaciones[estado] || 'Sin especificar'
  }

  const aplicarFiltros = () => {
    let resultado = [...lotes]

    // Filtro por búsqueda general
    if (busqueda.trim()) {
      const terminoBusqueda = busqueda.toLowerCase().trim()
      resultado = resultado.filter(lote =>
        lote.id.toLowerCase().includes(terminoBusqueda) ||
        lote.cultivo.toLowerCase().includes(terminoBusqueda) ||
        lote.variedad.toLowerCase().includes(terminoBusqueda) ||
        lote.cuartel.toLowerCase().includes(terminoBusqueda) ||
        lote.responsable_nombre.toLowerCase().includes(terminoBusqueda)
      )
    }

    // Aplicar filtros específicos
    if (filtros.cultivo) {
      resultado = resultado.filter(lote => lote.cultivo === filtros.cultivo)
    }
    if (filtros.estado) {
      resultado = resultado.filter(lote => lote.estado === filtros.estado)
    }
    if (filtros.cuartel) {
      resultado = resultado.filter(lote => lote.cuartel === filtros.cuartel)
    }
    if (filtros.responsable) {
      resultado = resultado.filter(lote => lote.responsable_nombre === filtros.responsable)
    }

    // Filtros de fecha
    if (filtros.fechaInicio) {
      resultado = resultado.filter(lote => 
        new Date(lote.fecha_creacion) >= new Date(filtros.fechaInicio)
      )
    }
    if (filtros.fechaFin) {
      resultado = resultado.filter(lote => 
        new Date(lote.fecha_creacion) <= new Date(filtros.fechaFin)
      )
    }

    setLotesFiltrados(resultado)
  }

  const limpiarFiltros = () => {
    setFiltros({
      cultivo: '',
      estado: '',
      fechaInicio: '',
      fechaFin: '',
      cuartel: '',
      responsable: ''
    })
    setBusqueda('')
  }

  const exportarCSV = () => {
    const headers = [
      'ID Lote',
      'Cultivo',
      'Variedad',
      'Cuartel',
      'Área (ha)',
      'Fecha Cosecha',
      'Estado Actual',
      'Peso Estimado (kg)',
      'Eventos Totales',
      'Eventos Completados',
      'Días Activo',
      'Responsable',
      'Ubicación Actual',
      'Última Actividad'
    ]

    const csvContent = [
      headers.join(','),
      ...lotesFiltrados.map(lote => [
        lote.id,
        lote.cultivo,
        lote.variedad,
        lote.cuartel,
        lote.area,
        format(new Date(lote.fecha_cosecha || lote.fecha_creacion), 'dd/MM/yyyy'),
        lote.estado,
        lote.peso_estimado_kg,
        lote.total_eventos,
        lote.eventos_completados,
        lote.dias_activo,
        lote.responsable_nombre,
        lote.ubicacion_actual,
        format(new Date(lote.fecha_ultima_actividad), 'dd/MM/yyyy HH:mm')
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `reporte_lotes_${format(new Date(), 'yyyy-MM-dd')}.csv`
    link.click()
  }

  const obtenerEstadisticas = () => {
    const total = lotesFiltrados.length
    const activos = lotesFiltrados.filter(l => !['Despachado', 'Eliminado'].includes(l.estado)).length
    const areaTotal = lotesFiltrados.reduce((sum, l) => sum + (l.area || 0), 0)
    const pesoTotal = lotesFiltrados.reduce((sum, l) => sum + (l.peso_estimado_kg || 0), 0)
    const promedioEventos = total > 0 ? 
      lotesFiltrados.reduce((sum, l) => sum + l.eventos_completados, 0) / total : 0

    return { total, activos, areaTotal, pesoTotal, promedioEventos }
  }

  const stats = obtenerEstadisticas()

  const obtenerColorEstado = (estado: string) => {
    const colores: Record<string, string> = {
      'Inicio Cosecha': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Cosecha Completa': 'bg-orange-100 text-orange-800 border-orange-200',
      'Recepción Packing': 'bg-blue-100 text-blue-800 border-blue-200',
      'Selección': 'bg-purple-100 text-purple-800 border-purple-200',
      'Empaque': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Paletizado': 'bg-cyan-100 text-cyan-800 border-cyan-200',
      'Enfriado': 'bg-teal-100 text-teal-800 border-teal-200',
      'Control Calidad': 'bg-pink-100 text-pink-800 border-pink-200',
      'Despacho': 'bg-green-100 text-green-800 border-green-200'
    }
    return colores[estado] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const obtenerIconoCompletitud = (completados: number, total: number) => {
    const porcentaje = total > 0 ? (completados / total) * 100 : 0
    if (porcentaje >= 80) return <CheckCircle className="h-4 w-4 text-green-500" />
    if (porcentaje >= 50) return <Clock className="h-4 w-4 text-yellow-500" />
    return <AlertTriangle className="h-4 w-4 text-red-500" />
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Reporte de Lotes</h2>
              <p className="text-gray-600">Información completa de todos los lotes de producción</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={exportarCSV}
              disabled={lotesFiltrados.length === 0}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Exportar CSV</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Cerrar ventana"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-blue-700">Total Lotes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.activos}</div>
              <div className="text-sm text-green-700">Lotes Activos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.areaTotal.toFixed(1)}ha</div>
              <div className="text-sm text-purple-700">Área Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{(stats.pesoTotal / 1000).toFixed(1)}t</div>
              <div className="text-sm text-orange-700">Peso Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-600">{stats.promedioEventos.toFixed(1)}</div>
              <div className="text-sm text-cyan-700">Eventos Promedio</div>
            </div>
          </div>
        </div>

        {/* Controles de filtrado */}
        <div className="p-6 border-b border-gray-200 bg-white">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Búsqueda general */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por ID, cultivo, variedad, cuartel o responsable..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Botones de control */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                  mostrarFiltros ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter className="h-4 w-4" />
                <span>Filtros</span>
              </button>
              <button
                onClick={cargarDatos}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Actualizar</span>
              </button>
            </div>
          </div>

          {/* Panel de filtros expandible */}
          {mostrarFiltros && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cultivo</label>
                  <select
                    value={filtros.cultivo}
                    onChange={(e) => setFiltros(prev => ({ ...prev, cultivo: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    aria-label="Filtrar por cultivo"
                  >
                    <option value="">Todos</option>
                    {cultivos.map(cultivo => (
                      <option key={cultivo} value={cultivo}>{cultivo}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <select
                    value={filtros.estado}
                    onChange={(e) => setFiltros(prev => ({ ...prev, estado: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    aria-label="Filtrar por estado"
                  >
                    <option value="">Todos</option>
                    {estados.map(estado => (
                      <option key={estado} value={estado}>{estado}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cuartel</label>
                  <select
                    value={filtros.cuartel}
                    onChange={(e) => setFiltros(prev => ({ ...prev, cuartel: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    aria-label="Filtrar por cuartel"
                  >
                    <option value="">Todos</option>
                    {cuarteles.map(cuartel => (
                      <option key={cuartel} value={cuartel}>{cuartel}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Responsable</label>
                  <select
                    value={filtros.responsable}
                    onChange={(e) => setFiltros(prev => ({ ...prev, responsable: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    aria-label="Filtrar por responsable"
                  >
                    <option value="">Todos</option>
                    {responsables.map(responsable => (
                      <option key={responsable} value={responsable}>{responsable}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
                  <input
                    type="date"
                    value={filtros.fechaInicio}
                    onChange={(e) => setFiltros(prev => ({ ...prev, fechaInicio: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    aria-label="Fecha de inicio para filtrar"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
                  <input
                    type="date"
                    value={filtros.fechaFin}
                    onChange={(e) => setFiltros(prev => ({ ...prev, fechaFin: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    aria-label="Fecha de fin para filtrar"
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={limpiarFiltros}
                  className="text-sm text-gray-600 hover:text-gray-800 underline"
                >
                  Limpiar todos los filtros
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tabla de resultados */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">Cargando datos...</span>
            </div>
          ) : lotesFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Package className="h-12 w-12 mb-4" />
              <p className="text-lg font-medium">No se encontraron lotes</p>
              <p className="text-sm">Ajusta los filtros o verifica los criterios de búsqueda</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lote</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cultivo/Variedad</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Área/Peso</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Eventos</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actividad</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsable</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {lotesFiltrados.map((lote) => (
                    <tr key={lote.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                              <Package className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{lote.id}</div>
                            <div className="text-sm text-gray-500">
                              {format(new Date(lote.fecha_creacion), 'dd/MM/yyyy', { locale: es })}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{lote.cultivo}</div>
                        <div className="text-sm text-gray-500">{lote.variedad}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                          {lote.cuartel}
                        </div>
                        <div className="text-sm text-gray-500">{lote.ubicacion_actual}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-lg border ${obtenerColorEstado(lote.estado)}`}>
                          {lote.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <TrendingUp className="h-4 w-4 text-gray-400 mr-1" />
                          <div>
                            <div>{lote.area}ha</div>
                            <div className="text-gray-500">{(lote.peso_estimado_kg / 1000).toFixed(1)}t</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {obtenerIconoCompletitud(lote.eventos_completados, 9)}
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">{lote.eventos_completados}/9</div>
                            <div className="text-gray-500">{lote.total_eventos} registros</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-400 mr-1" />
                          <div>
                            <div>{lote.dias_activo} días</div>
                            <div className="text-gray-500">
                              {format(new Date(lote.fecha_ultima_actividad), 'dd/MM HH:mm')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {lote.responsable_nombre || 'Sin asignar'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Mostrando {lotesFiltrados.length} de {lotes.length} lotes
          </div>
          <div className="text-sm text-gray-500">
            Reporte generado: {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}
          </div>
        </div>
      </div>
    </div>
  )
} 