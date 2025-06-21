import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import {
  QrCode,
  Search,
  FileText,
  Download,
  Calendar,
  MapPin,
  User,
  Clock,
  AlertTriangle,
  CheckCircle,
  Package,
  X,
  RefreshCw,
  BarChart3,
  Eye,
  ArrowRight
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface EventoTrazabilidad {
  id: string
  tipo_evento: string
  descripcion: string
  fecha: string
  responsable_nombre: string
  observaciones?: string
  datos_adicionales?: any
  ubicacion?: string
  temperatura?: number
  humedad?: number
}

interface LoteTrazabilidad {
  id: string
  cultivo: string
  variedad: string
  cuartel: string
  area: number
  fecha_cosecha: string
  estado: string
  peso_estimado_kg: number
  responsable_nombre: string
  eventos: EventoTrazabilidad[]
  total_eventos: number
  fecha_creacion: string
  fecha_ultimo_evento: string
}

interface ReporteTrazabilidadProps {
  onClose: () => void
}

export default function ReporteTrazabilidad({ onClose }: ReporteTrazabilidadProps) {
  const [loteId, setLoteId] = useState('')
  const [loteData, setLoteData] = useState<LoteTrazabilidad | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sugerencias, setSugerencias] = useState<string[]>([])
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false)

  useEffect(() => {
    if (loteId.length >= 3) {
      buscarSugerencias()
    } else {
      setSugerencias([])
      setMostrarSugerencias(false)
    }
  }, [loteId])

  const buscarSugerencias = async () => {
    try {
      const { data, error } = await supabase
        .from('lotes')
        .select('id')
        .ilike('id', `%${loteId}%`)
        .limit(5)

      if (error) throw error
      
      const ids = data?.map(l => l.id) || []
      setSugerencias(ids)
      setMostrarSugerencias(ids.length > 0)
    } catch (error) {
      console.error('Error buscando sugerencias:', error)
    }
  }

  const consultarTrazabilidad = async (id?: string) => {
    const idConsulta = id || loteId
    if (!idConsulta.trim()) {
      setError('Ingresa un ID de lote válido')
      return
    }

    setLoading(true)
    setError('')
    setMostrarSugerencias(false)

    try {
      // Obtener información del lote
      const { data: loteInfo, error: loteError } = await supabase
        .from('v_lotes_completos')
        .select('*')
        .eq('id', idConsulta)
        .single()

      if (loteError) {
        if (loteError.code === 'PGRST116') {
          setError(`No se encontró el lote ${idConsulta}`)
        } else {
          throw loteError
        }
        return
      }

      // Obtener eventos de trazabilidad
      const { data: eventos, error: eventosError } = await supabase
        .from('eventos_trazabilidad')
        .select(`
          id,
          tipo,
          descripcion,
          fecha,
          responsable_nombre,
          datos_adicionales
        `)
        .eq('lote_id', idConsulta)
        .order('fecha', { ascending: true })

      if (eventosError) throw eventosError

      // Procesar eventos con información adicional
      const eventosConUbicacion = eventos?.map(evento => evento ? ({
        id: evento.id,
        tipo_evento: evento.tipo,
        descripcion: evento.descripcion || '',
        fecha: evento.fecha,
        responsable_nombre: evento.responsable_nombre || 'Sistema',
        ubicacion: obtenerUbicacionEvento(evento.tipo),
        temperatura: evento.datos_adicionales && typeof evento.datos_adicionales === 'object' && evento.datos_adicionales !== null ? 
                    (evento.datos_adicionales as any)?.temperatura_llegada || 
                    (evento.datos_adicionales as any)?.temperatura_inicial ||
                    (evento.datos_adicionales as any)?.temperatura_objetivo : undefined,
        humedad: evento.datos_adicionales && typeof evento.datos_adicionales === 'object' && evento.datos_adicionales !== null ?
                 (evento.datos_adicionales as any)?.humedad_relativa_porcentaje : undefined,
        datos_adicionales: evento.datos_adicionales
      }) : null).filter((evento): evento is NonNullable<typeof evento> => evento !== null) || []

      const loteCompleto: LoteTrazabilidad = {
        id: loteInfo.id || '',
        cultivo: loteInfo.cultivo || '',
        variedad: loteInfo.variedad || '',
        cuartel: loteInfo.cuartel_origen || '',
        area: loteInfo.area || 0,
        fecha_cosecha: loteInfo.created_at || new Date().toISOString(),
        estado: loteInfo.estado || 'Sin Estado',
        peso_estimado_kg: Math.round((loteInfo.area || 0) * 25000),
        responsable_nombre: 'Operador Principal',
        total_eventos: eventos?.length || 0,
        fecha_creacion: loteInfo.created_at || new Date().toISOString(),
        eventos: eventosConUbicacion,
        fecha_ultimo_evento: eventos?.length ? eventos[eventos.length - 1].fecha : loteInfo.created_at || new Date().toISOString()
      }

      setLoteData(loteCompleto)
      setLoteId(idConsulta)

    } catch (error) {
      console.error('Error consultando trazabilidad:', error)
      setError('Error al consultar la trazabilidad del lote')
    } finally {
      setLoading(false)
    }
  }

  const obtenerUbicacionEvento = (tipoEvento: string): string => {
    const ubicaciones: Record<string, string> = {
      'Inicio Cosecha': 'Campo - Inicio de Cosecha',
      'Cosecha Completa': 'Campo - Cosecha Finalizada',
      'Recepción Packing': 'Packing - Área de Recepción',
      'Selección': 'Packing - Línea de Selección',
      'Empaque': 'Packing - Línea de Empaque',
      'Paletizado': 'Packing - Área de Paletizado',
      'Enfriado': 'Cámara Frigorífica',
      'Control Calidad': 'Laboratorio de Calidad',
      'Despacho': 'Área de Despacho'
    }
    return ubicaciones[tipoEvento] || 'Ubicación no especificada'
  }

  const exportarPDF = () => {
    if (!loteData) return

    // Generar contenido del reporte
    const contenido = `
      REPORTE DE TRAZABILIDAD
      Lote: ${loteData.id}
      
      INFORMACIÓN DEL LOTE:
      - Cultivo: ${loteData.cultivo}
      - Variedad: ${loteData.variedad}
      - Cuartel: ${loteData.cuartel}
      - Área: ${loteData.area} ha
      - Peso Estimado: ${loteData.peso_estimado_kg} kg
      - Estado Actual: ${loteData.estado}
      - Responsable: ${loteData.responsable_nombre}
      
      HISTORIAL DE EVENTOS (${loteData.eventos.length}):
      ${loteData.eventos.map((evento, index) => `
      ${index + 1}. ${evento.tipo_evento}
         Fecha: ${format(new Date(evento.fecha), 'dd/MM/yyyy HH:mm')}
         Responsable: ${evento.responsable_nombre}
         Ubicación: ${evento.ubicacion}
         Descripción: ${evento.descripcion}
         ${evento.observaciones ? `Observaciones: ${evento.observaciones}` : ''}
      `).join('\n')}
      
      Reporte generado: ${format(new Date(), 'dd/MM/yyyy HH:mm')}
    `

    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `trazabilidad_${loteData.id}_${format(new Date(), 'yyyy-MM-dd')}.txt`
    link.click()
  }

  const obtenerIconoEvento = (tipo: string) => {
    const iconos: Record<string, React.ReactElement> = {
      'Inicio Cosecha': <Clock className="h-5 w-5 text-yellow-600" />,
      'Cosecha Completa': <CheckCircle className="h-5 w-5 text-orange-600" />,
      'Recepción Packing': <Package className="h-5 w-5 text-blue-600" />,
      'Selección': <Eye className="h-5 w-5 text-purple-600" />,
      'Empaque': <Package className="h-5 w-5 text-indigo-600" />,
      'Paletizado': <BarChart3 className="h-5 w-5 text-cyan-600" />,
      'Enfriado': <RefreshCw className="h-5 w-5 text-teal-600" />,
      'Control Calidad': <CheckCircle className="h-5 w-5 text-pink-600" />,
      'Despacho': <ArrowRight className="h-5 w-5 text-green-600" />
    }
    return iconos[tipo] || <AlertTriangle className="h-5 w-5 text-gray-600" />
  }

  const obtenerColorEvento = (tipo: string) => {
    const colores: Record<string, string> = {
      'Inicio Cosecha': 'border-yellow-200 bg-yellow-50',
      'Cosecha Completa': 'border-orange-200 bg-orange-50',
      'Recepción Packing': 'border-blue-200 bg-blue-50',
      'Selección': 'border-purple-200 bg-purple-50',
      'Empaque': 'border-indigo-200 bg-indigo-50',
      'Paletizado': 'border-cyan-200 bg-cyan-50',
      'Enfriado': 'border-teal-200 bg-teal-50',
      'Control Calidad': 'border-pink-200 bg-pink-50',
      'Despacho': 'border-green-200 bg-green-50'
    }
    return colores[tipo] || 'border-gray-200 bg-gray-50'
  }

  const calcularProgreso = () => {
    if (!loteData) return 0
    const eventosUnicos = new Set(loteData.eventos.map(e => e.tipo_evento))
    return Math.round((eventosUnicos.size / 9) * 100) // 9 eventos típicos en el flujo
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <QrCode className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Consulta de Trazabilidad</h2>
              <p className="text-gray-600">Historial completo de eventos por lote</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Cerrar ventana"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Búsqueda */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Ingresa el ID del lote (ej: LP-2025-CHIL-022)"
                value={loteId}
                onChange={(e) => setLoteId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && consultarTrazabilidad()}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              />
              
              {/* Sugerencias */}
              {mostrarSugerencias && sugerencias.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-10">
                  {sugerencias.map(id => (
                    <button
                      key={id}
                      onClick={() => {
                        setLoteId(id)
                        consultarTrazabilidad(id)
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <Package className="h-4 w-4 text-gray-400" />
                      <span>{id}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <button
              onClick={() => consultarTrazabilidad()}
              disabled={loading || !loteId.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              {loading ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                <Search className="h-5 w-5" />
              )}
              <span>Consultar</span>
            </button>
          </div>
          
          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="text-red-700">{error}</span>
            </div>
          )}
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-auto">
          {loteData ? (
            <div className="space-y-6 p-6">
              {/* Información del lote */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Package className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{loteData.id}</h3>
                      <p className="text-green-700">{loteData.cultivo} - {loteData.variedad}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Progreso de Trazabilidad</div>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${calcularProgreso()}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-green-600">{calcularProgreso()}%</span>
                      </div>
                    </div>
                    <button
                      onClick={exportarPDF}
                      className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      <span>Exportar</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <div className="bg-white rounded p-3 border">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="text-xs text-gray-500">Cuartel</div>
                        <div className="font-medium">{loteData.cuartel}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded p-3 border">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="text-xs text-gray-500">Área</div>
                        <div className="font-medium">{loteData.area} ha</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded p-3 border">
                    <div className="flex items-center space-x-2">
                      <Package className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="text-xs text-gray-500">Peso</div>
                        <div className="font-medium">{(loteData.peso_estimado_kg / 1000).toFixed(1)}t</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded p-3 border">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="text-xs text-gray-500">Estado</div>
                        <div className="font-medium">{loteData.estado}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded p-3 border">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="text-xs text-gray-500">Responsable</div>
                        <div className="font-medium">{loteData.responsable_nombre}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded p-3 border">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="text-xs text-gray-500">Eventos</div>
                        <div className="font-medium">{loteData.eventos.length}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline de eventos */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span>Historial de Trazabilidad ({loteData.eventos.length} eventos)</span>
                  </h3>
                </div>

                <div className="p-6">
                  {loteData.eventos.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No hay eventos de trazabilidad registrados para este lote</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {loteData.eventos.map((evento, index) => (
                        <div key={evento.id} className={`border rounded-lg p-4 ${obtenerColorEvento(evento.tipo_evento)}`}>
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                              <div className="flex items-center justify-center w-10 h-10 bg-white rounded-lg border-2 border-current">
                                {obtenerIconoEvento(evento.tipo_evento)}
                              </div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <h4 className="text-lg font-semibold text-gray-900">{evento.tipo_evento}</h4>
                                  <span className="text-sm text-gray-500">#{index + 1}</span>
                                </div>
                                <div className="text-sm text-gray-600">
                                  {format(new Date(evento.fecha), 'dd/MM/yyyy HH:mm', { locale: es })}
                                </div>
                              </div>
                              
                              <p className="text-gray-700 mt-1">{evento.descripcion}</p>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 text-sm">
                                <div className="flex items-center space-x-2">
                                  <MapPin className="h-4 w-4 text-gray-400" />
                                  <span className="text-gray-600">{evento.ubicacion}</span>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <User className="h-4 w-4 text-gray-400" />
                                  <span className="text-gray-600">{evento.responsable_nombre}</span>
                                </div>
                                
                                {(evento.temperatura || evento.humedad) && (
                                  <div className="flex items-center space-x-2">
                                    <RefreshCw className="h-4 w-4 text-gray-400" />
                                    <span className="text-gray-600">
                                      {evento.temperatura && `${evento.temperatura}°C`}
                                      {evento.temperatura && evento.humedad && ' • '}
                                      {evento.humedad && `${evento.humedad}% HR`}
                                    </span>
                                  </div>
                                )}
                              </div>
                              
                              {evento.observaciones && (
                                <div className="mt-3 p-3 bg-white border border-gray-200 rounded-lg">
                                  <p className="text-sm text-gray-700">
                                    <span className="font-medium">Observaciones:</span> {evento.observaciones}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <QrCode className="h-16 w-16 mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Consulta de Trazabilidad</h3>
              <p className="text-center max-w-md">
                Ingresa el ID de un lote para ver su historial completo de trazabilidad.
                Puedes usar códigos como LP-2025-CHIL-022, LP-2025-CHIL-023, etc.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {loteData && (
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Lote: {loteData.id} • {loteData.eventos.length} eventos registrados
            </div>
            <div className="text-sm text-gray-500">
              Última actividad: {format(new Date(loteData.fecha_ultimo_evento), 'dd/MM/yyyy HH:mm', { locale: es })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 