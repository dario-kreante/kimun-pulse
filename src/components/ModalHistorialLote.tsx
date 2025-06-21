import React, { useState, useEffect } from 'react'
import { 
  X, 
  History, 
  Clock, 
  User, 
  MapPin, 
  Calendar,
  Info,
  CheckCircle,
  AlertCircle,
  Package,
  Truck,
  Factory,
  Snowflake,
  ShieldCheck,
  Scissors,
  Leaf,
  Download,
  Share2
} from 'lucide-react'
import { useLote, useCodigos } from '../hooks/useKimunPulse'
import { formatDistanceToNow, format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { HistorialEvento } from '../types/database'

interface ModalHistorialLoteProps {
  isOpen: boolean
  onClose: () => void
  loteId: string
}

export default function ModalHistorialLote({ isOpen, onClose, loteId }: ModalHistorialLoteProps) {
  const { lote, eventos, loading: loteLoading, error: loteError } = useLote(loteId)
  const { obtenerHistorialLote } = useCodigos()
  
  const [historialCompleto, setHistorialCompleto] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filtroEvento, setFiltroEvento] = useState<string>('todos')

  // Cargar historial completo incluyendo actividad de códigos
  useEffect(() => {
    if (isOpen && loteId) {
      cargarHistorialCompleto()
    }
  }, [isOpen, loteId])

  const cargarHistorialCompleto = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Obtener historial de códigos específico del lote
      const historialCodigos = await obtenerHistorialLote(loteId)
      
      // Combinar eventos de trazabilidad con actividad de códigos
      const eventosCombinados = [
        // Eventos de trazabilidad
        ...(eventos || []).map(evento => evento ? ({
          ...evento,
          tipo_actividad: 'evento_trazabilidad',
          icono: getEventoIcon(evento.tipo),
          color: getEventoColor(evento.tipo),
          titulo: evento.tipo,
          descripcion: evento.descripcion,
          fecha: evento.fecha,
          responsable: evento.responsable || 'Sistema',
          detalles: evento.datos_adicionales
        }) : null).filter(Boolean),
        // Actividad de códigos
        ...(historialCodigos || []).map((actividad: any) => ({
          id: `codigo_${actividad.id}`,
          tipo_actividad: actividad.tipo_actividad,
          icono: actividad.tipo_actividad === 'escaneo' ? CheckCircle : Factory,
          color: actividad.tipo_actividad === 'escaneo' ? 'text-blue-600' : 'text-green-600',
          titulo: actividad.tipo_actividad === 'escaneo' ? 'Código Escaneado' : 'Etiquetas Impresas',
          descripcion: actividad.tipo_actividad === 'escaneo' 
            ? `Código escaneado desde ${actividad.ubicacion || 'ubicación no especificada'}`
            : `${actividad.cantidad || 1} etiqueta(s) impresa(s) en formato ${actividad.formato || 'estándar'}`,
          fecha: actividad.fecha,
          responsable: actividad.usuario,
          detalles: {
            ubicacion: actividad.ubicacion,
            dispositivo: actividad.dispositivo,
            cantidad: actividad.cantidad,
            formato: actividad.formato
          }
        }))
      ]

      // Ordenar por fecha descendente
      eventosCombinados.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      
      setHistorialCompleto(eventosCombinados)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar historial')
    } finally {
      setLoading(false)
    }
  }

  const getEventoIcon = (tipo: string) => {
    switch (tipo) {
      case 'Inicio Cosecha': return Leaf
      case 'Cosecha Completa': return CheckCircle
      case 'Recepción Packing': return Package
      case 'Selección': return Scissors
      case 'Empaque': return Package
      case 'Paletizado': return Package
      case 'Enfriado': return Snowflake
      case 'Control Calidad': return ShieldCheck
      case 'Despacho': return Truck
      default: return Info
    }
  }

  const getEventoColor = (tipo: string) => {
    switch (tipo) {
      case 'Inicio Cosecha': return 'text-green-600'
      case 'Cosecha Completa': return 'text-green-700'
      case 'Recepción Packing': return 'text-blue-600'
      case 'Selección': return 'text-purple-600'
      case 'Empaque': return 'text-indigo-600'
      case 'Paletizado': return 'text-gray-600'
      case 'Enfriado': return 'text-cyan-600'
      case 'Control Calidad': return 'text-orange-600'
      case 'Despacho': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const filtrarEventos = () => {
    if (filtroEvento === 'todos') return historialCompleto
    return historialCompleto.filter(evento => {
      if (filtroEvento === 'trazabilidad') return evento.tipo_actividad === 'evento_trazabilidad'
      if (filtroEvento === 'codigos') return evento.tipo_actividad !== 'evento_trazabilidad'
      return true
    })
  }

  const exportarHistorial = () => {
    const datos = filtrarEventos().map(evento => ({
      Fecha: format(new Date(evento.fecha), 'dd/MM/yyyy HH:mm', { locale: es }),
      Tipo: evento.titulo,
      Descripción: evento.descripcion,
      Responsable: evento.responsable,
      Detalles: evento.detalles ? JSON.stringify(evento.detalles) : ''
    }))

    const csv = [
      ['Fecha', 'Tipo', 'Descripción', 'Responsable', 'Detalles'],
      ...datos.map(row => Object.values(row))
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `historial_lote_${loteId}_${format(new Date(), 'yyyy-MM-dd')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const compartirHistorial = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Historial - Lote ${loteId}`,
          text: `Historial de trazabilidad del lote ${loteId} con ${filtrarEventos().length} eventos registrados.`,
          url: window.location.href
        })
      } catch (err) {
        console.log('Error al compartir:', err)
      }
    } else {
      // Fallback para navegadores que no soportan Web Share API
      navigator.clipboard.writeText(`Historial del lote ${loteId}: ${window.location.href}`)
        .then(() => alert('Enlace copiado al portapapeles'))
        .catch(() => alert('No se pudo copiar el enlace'))
    }
  }

  if (!isOpen) return null

  const eventosFiltrados = filtrarEventos()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-90vh overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <History className="h-6 w-6 text-purple-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Historial del Lote</h2>
              <p className="text-sm text-gray-600">{loteId}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={exportarHistorial}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Exportar historial"
            >
              <Download className="h-5 w-5" />
            </button>
            <button
              onClick={compartirHistorial}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Compartir historial"
            >
              <Share2 className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Información del lote */}
        {lote && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Estado Actual:</span>
                <p className="text-gray-900">{lote.estado}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Cultivo:</span>
                <p className="text-gray-900">{lote.cultivo}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Variedad:</span>
                <p className="text-gray-900">{lote.variedad}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Área:</span>
                <p className="text-gray-900">{lote.area} ha</p>
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Filtrar por:</span>
            <div className="flex space-x-2">
              <button
                onClick={() => setFiltroEvento('todos')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filtroEvento === 'todos'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Todos ({historialCompleto.length})
              </button>
              <button
                onClick={() => setFiltroEvento('trazabilidad')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filtroEvento === 'trazabilidad'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Trazabilidad ({historialCompleto.filter(e => e.tipo_actividad === 'evento_trazabilidad').length})
              </button>
              <button
                onClick={() => setFiltroEvento('codigos')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filtroEvento === 'codigos'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Códigos ({historialCompleto.filter(e => e.tipo_actividad !== 'evento_trazabilidad').length})
              </button>
            </div>
          </div>
        </div>

        {/* Contenido del historial */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mr-3"></div>
              <span className="text-gray-600">Cargando historial...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
                <p className="text-red-700 font-medium">Error al cargar historial</p>
                <p className="text-red-600 text-sm">{error}</p>
                <button
                  onClick={cargarHistorialCompleto}
                  className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  Reintentar
                </button>
              </div>
            </div>
          ) : eventosFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <History className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No hay eventos registrados</p>
              <p className="text-gray-500 text-sm">Los eventos aparecerán aquí conforme se registren</p>
            </div>
          ) : (
            <div className="space-y-4">
              {eventosFiltrados.map((evento, index) => {
                const Icon = evento.icono
                const fechaEvento = new Date(evento.fecha)
                
                return (
                  <div key={evento.id || index} className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                    <div className="flex items-start space-x-4">
                      <div className={`flex-shrink-0 p-2 rounded-full bg-gray-50`}>
                        <Icon className={`h-5 w-5 ${evento.color}`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{evento.titulo}</h4>
                            <p className="text-gray-600 text-sm mt-1">{evento.descripcion}</p>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-sm text-gray-500 flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {format(fechaEvento, 'dd/MM/yyyy', { locale: es })}
                            </div>
                            <div className="text-xs text-gray-400 flex items-center mt-1">
                              <Clock className="h-3 w-3 mr-1" />
                              {format(fechaEvento, 'HH:mm', { locale: es })}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                          <div className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            <span>{evento.responsable}</span>
                          </div>
                          {evento.detalles?.ubicacion && (
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span>{evento.detalles.ubicacion}</span>
                            </div>
                          )}
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>
                              {formatDistanceToNow(fechaEvento, { 
                                addSuffix: true, 
                                locale: es 
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Detalles adicionales para actividad de códigos */}
                        {evento.detalles && evento.tipo_actividad !== 'evento_trazabilidad' && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {evento.detalles.cantidad && (
                                <div>
                                  <span className="font-medium text-gray-700">Cantidad:</span>
                                  <span className="ml-1 text-gray-600">{evento.detalles.cantidad}</span>
                                </div>
                              )}
                              {evento.detalles.formato && (
                                <div>
                                  <span className="font-medium text-gray-700">Formato:</span>
                                  <span className="ml-1 text-gray-600">{evento.detalles.formato}</span>
                                </div>
                              )}
                              {evento.detalles.dispositivo && (
                                <div className="col-span-2">
                                  <span className="font-medium text-gray-700">Dispositivo:</span>
                                  <span className="ml-1 text-gray-600">{evento.detalles.dispositivo}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer con estadísticas */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              <span className="font-medium">{eventosFiltrados.length}</span> eventos mostrados
            </div>
            <div>
              Última actualización: {new Date().toLocaleString('es-CL')}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 