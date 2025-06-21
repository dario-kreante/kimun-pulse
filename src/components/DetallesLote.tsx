import React, { useState, useEffect } from 'react'
import { X, Package, Activity, AlertCircle, CheckCircle, Info, Printer } from 'lucide-react'
import { palletsService, eventosService } from '../lib/supabase'
import TrazabilidadTimeline from './TrazabilidadTimeline'
import ModalImprimirEtiquetas from './ModalImprimirEtiquetas'
import VistaPreviewEtiquetas from './VistaPreviewEtiquetas'
import { generarHTMLEtiquetas } from '../lib/qrUtils'

// Types
interface DetallesLoteProps {
  lote: {
    id: string
    ultimo_evento?: string
    estado?: string
    [key: string]: any
  } | null
  onClose: () => void
}

export default function DetallesLote({ lote, onClose }: DetallesLoteProps) {
  const [eventos, setEventos] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [pallets, setPallets] = useState<any[]>([])
  const [loadingPallets, setLoadingPallets] = useState(false)
  const [mostrarModalImprimir, setMostrarModalImprimir] = useState(false)
  const [mostrarVistaRapida, setMostrarVistaRapida] = useState(false)

  // DEBUG: Log del lote al abrir el modal
  console.log('--- RENDER DetallesLote ---', {
    loteId: lote?.id,
    estado: lote?.estado,
    eventosCount: eventos.length,
    loading,
    timestamp: new Date().toLocaleTimeString()
  });

  useEffect(() => {
    const cargarEventos = async () => {
      if (!lote?.id) return
      
      try {
        setLoading(true)
        const eventosData = await eventosService.obtenerHistorialLote(lote.id)
        
        // Mapear los datos de la función RPC para que coincidan con la interfaz de TrazabilidadTimeline
        const eventosMapeados = (eventosData || []).map((evento: any) => ({
          id: evento.evento_id,  // RPC devuelve evento_id, timeline espera id
          tipo: evento.tipo,
          descripcion: evento.descripcion,
          fecha: evento.fecha,
          responsable_nombre: evento.responsable,  // RPC devuelve responsable, timeline espera responsable_nombre
          datos_adicionales: evento.datos_adicionales
        }))
        
        setEventos(eventosMapeados)
      } catch (error) {
        console.error('Error cargando eventos:', error)
        setEventos([])
      } finally {
        setLoading(false)
      }
    }

    cargarEventos()
  }, [lote])

  // Load pallets for post-paletizado lotes
  useEffect(() => {
    const cargarPallets = async () => {
      if (!lote?.id) return
      
      // Only load pallets if lote has been paletizado
      const estadosPostPaletizado = ['Paletizado', 'En Cámara', 'Listo Despacho', 'Despachado']
      const fueEnmpacado = estadosPostPaletizado.includes(lote.estado || '') || 
                           (lote.ultimo_evento && ['Paletizado', 'Empaque'].includes(lote.ultimo_evento))
      
      if (!fueEnmpacado) return

      try {
        setLoadingPallets(true)
        const palletsData = await palletsService.obtenerPalletsPorLote(lote.id)
        setPallets(palletsData || [])
      } catch (error) {
        console.error('Error cargando pallets:', error)
        setPallets([])
      } finally {
        setLoadingPallets(false)
      }
    }

    cargarPallets()
  }, [lote?.id, lote?.estado, lote?.ultimo_evento])

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha)
    return date.toLocaleString('es-CL')
  }

  // Determine if lote has been paletizado
  const fuePaletizado = () => {
    const estadosPaletizados = ['Paletizado', 'En Cámara', 'Listo Despacho', 'Despachado']
    const eventosPaletizado = ['Paletizado', 'Empaque']
    
    const estadoCheck = estadosPaletizados.includes(lote?.estado || '')
    const eventoCheck = eventosPaletizado.includes(lote?.ultimo_evento || '')
    const eventosArrayCheck = eventos.some(e => eventosPaletizado.includes(e.tipo))
    
    console.log('🔍 DEBUG fuePaletizado:', {
      loteId: lote?.id,
      estado: lote?.estado,
      ultimoEvento: lote?.ultimo_evento,
      estadoCheck,
      eventoCheck,
      eventosArrayCheck,
      eventos: eventos.map(e => ({ tipo: e.tipo, id: e.id }))
    })
    
    return estadoCheck || eventoCheck || eventosArrayCheck
  }

  // Get next suggested action ONLY for non-paletizado lotes
  const getSiguienteAccionSugerida = () => {
    if (fuePaletizado()) {
      return null // NO hay siguiente acción para lotes paletizados
    }

    const ultimoEvento = lote?.ultimo_evento
    const secuenciaEventos = [
      'Inicio Cosecha',
      'Recepción Packing', 
      'Selección',
      'Empaque',
      'Paletizado'
    ]
    
    const indiceSiguiente = secuenciaEventos.findIndex(evento => evento === ultimoEvento) + 1
    return indiceSiguiente < secuenciaEventos.length ? secuenciaEventos[indiceSiguiente] : null
  }

  if (!lote) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Detalles del Lote {lote.codigo_lote}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Estado actual: <span className="font-medium">{lote.estado || 'Sin estado'}</span>
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMostrarVistaRapida(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Printer className="h-4 w-4" />
              <span>Imprimir Etiqueta</span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Cerrar modal"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {/* Información básica del lote */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Lote</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Código:</span>
                  <p className="text-sm text-gray-900 font-mono">{lote.codigo_lote}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Estado:</span>
                  <p className="text-sm text-gray-900">{lote.estado || 'Sin estado'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Último evento:</span>
                  <p className="text-sm text-gray-900">{lote.ultimo_evento || 'Ninguno'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Fecha creación:</span>
                  <p className="text-sm text-gray-900">
                    {lote.fecha_creacion ? formatearFecha(lote.fecha_creacion) : 'No registrada'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Estado Post-Paletizado */}
          {fuePaletizado() ? (
            <>
              {/* Lote Status: Finalizado */}
              <div className="mb-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-green-900">Lote Paletizado - Ciclo Completado</h4>
                      <p className="text-green-800 text-sm mt-1">
                        Este lote completó su ciclo individual. La trazabilidad continúa a nivel de 
                        <strong> pallets individuales</strong>. Los eventos futuros (Enfriado, Control de Calidad, 
                        Despacho) se registran por pallet, no por lote.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pallets Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Package className="h-5 w-5 mr-2 text-orange-600" />
                  Pallets Generados
              </h3>
              
              {loadingPallets ? (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600"></div>
                    <span className="text-gray-600">Cargando información de pallets...</span>
                  </div>
                </div>
                ) : pallets.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div className="flex-1">
                        <h4 className="font-medium text-yellow-900">Pallets No Registrados</h4>
                      <p className="text-yellow-800 text-sm mt-1">
                          Este lote fue paletizado pero no tiene pallets registrados en el sistema. 
                          Es necesario registrar los pallets para continuar la trazabilidad.
                      </p>
                      <div className="mt-3">
                        <button
                            onClick={() => {
                              // TODO: Implementar modal para registrar pallets manualmente
                              console.log('Abrir modal registrar pallets para lote:', lote.id)
                            }}
                          className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 text-sm font-medium"
                        >
                            Registrar Pallets Manualmente
                        </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Pallets Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pallets.map((pallet) => (
                      <div
                        key={pallet.codigo_pallet}
                          className="bg-white border border-gray-200 rounded-lg p-4 hover:border-orange-300 cursor-pointer transition-colors"
                          onClick={() => {
                            // TODO: Abrir detalles del pallet individual
                            console.log('Ver detalles pallet:', pallet.codigo_pallet)
                          }}
                      >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono text-sm font-semibold text-gray-900">
                            {pallet.codigo_pallet}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            pallet.estado === 'completo' ? 'bg-green-100 text-green-800' :
                            pallet.estado === 'en_camara' ? 'bg-blue-100 text-blue-800' :
                            pallet.estado === 'en_transito' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                              {pallet.estado?.replace('_', ' ') || 'Sin estado'}
                          </span>
                        </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex justify-between">
                              <span>Cajas:</span>
                              <span className="font-medium">{pallet.cantidad_cajas_total || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Peso:</span>
                              <span className="font-medium">{pallet.peso_total_kg || 0} kg</span>
                            </div>
                          {pallet.ubicacion_actual && (
                              <div className="text-xs text-blue-600 mt-2">
                              📍 {pallet.ubicacion_actual}
                              </div>
                            )}
                          </div>
                          
                          {/* Próximas acciones para este pallet */}
                          <div className="mt-3 pt-2 border-t border-gray-100">
                            <div className="flex items-center space-x-2">
                              <Activity className="h-3 w-3 text-indigo-500" />
                              <span className="text-xs text-indigo-600 font-medium">
                                Próximas acciones
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {['Enfriado', 'Control Calidad', 'Despacho'].map((accion, idx) => (
                                <span 
                                  key={accion}
                                  className="px-2 py-0.5 text-xs bg-indigo-50 text-indigo-700 rounded"
                                >
                                  {accion}
                                </span>
                              ))}
                            </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                    {/* Resumen */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h5 className="font-medium text-blue-900 mb-3">Resumen de Pallets</h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700 font-medium">Total Pallets:</span>
                          <div className="text-blue-900 font-semibold text-lg">{pallets.length}</div>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Total Cajas:</span>
                          <div className="text-blue-900 font-semibold text-lg">
                          {pallets.reduce((total, p) => total + (p.cantidad_cajas_total || 0), 0)}
                        </div>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Peso Total:</span>
                          <div className="text-blue-900 font-semibold text-lg">
                          {pallets.reduce((total, p) => total + (p.peso_total_kg || 0), 0).toFixed(1)} kg
                          </div>
                        </div>
                        <div>
                          <span className="text-blue-700 font-medium">En Proceso:</span>
                          <div className="text-blue-900 font-semibold text-lg">
                            {pallets.filter(p => p.estado && !['completo', 'despachado'].includes(p.estado)).length}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Información importante sobre trazabilidad */}
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <Info className="h-5 w-5 text-indigo-600 mt-0.5" />
                        <div className="flex-1">
                          <h5 className="font-medium text-indigo-900">Continuación de Trazabilidad</h5>
                          <p className="text-indigo-800 text-sm mt-1">
                            A partir de este punto, cada pallet sigue su propio flujo independiente:
                          </p>
                          <ul className="text-indigo-700 text-xs mt-2 space-y-1 ml-4">
                            <li>• <strong>Enfriado:</strong> Ingreso a cámara frigorífica específica</li>
                            <li>• <strong>Control de Calidad:</strong> Inspección individual por pallet</li>
                            <li>• <strong>Despacho:</strong> Asignación a contenedores/camiones</li>
                          </ul>
                          <div className="mt-3">
                            <button
                              onClick={() => {
                                // TODO: Abrir vista de gestión de pallets
                                console.log('Abrir gestión pallets')
                              }}
                              className="px-3 py-1.5 bg-indigo-600 text-white rounded text-xs font-medium hover:bg-indigo-700"
                            >
                              Gestionar Pallets Individuales
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                </div>
            </>
              ) : (
            /* Lote en Proceso - Mostrar siguiente paso */
            <>
              {/* Siguiente paso sugerido SOLO para lotes no paletizados */}
              {getSiguienteAccionSugerida() && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Siguiente Paso Sugerido</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <Activity className="h-6 w-6 text-blue-600" />
                      <div>
                        <h4 className="font-medium text-blue-900">{getSiguienteAccionSugerida()}</h4>
                        <p className="text-blue-800 text-sm">
                          Registrar el evento "{getSiguienteAccionSugerida()}" para continuar el flujo de trazabilidad
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Historial de eventos usando TrazabilidadTimeline */}
          <TrazabilidadTimeline
            eventos={eventos}
            loading={loading}
            titulo="Historial de Eventos del Lote"
            subtitulo="Trazabilidad completa pre-paletizado"
            entidadId={lote.codigo_lote}
            tipoEntidad="lote"
            mostrarBotonAgregar={false}
          />
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {/* Modal de impresión */}
      {mostrarModalImprimir && (
        <ModalImprimirEtiquetas
          isOpen={mostrarModalImprimir}
          onClose={() => setMostrarModalImprimir(false)}
        />
      )}

      {/* Vista previa de etiquetas */}
      {mostrarVistaRapida && lote && (
        <VistaPreviewEtiquetas
          entidades={[{ ...lote, id: lote.id!, tipo: 'lote' as const }]}
          qrDataStrings={[lote.id || '']}
          config={{ 
            formato: 'qr_texto' as const,
            tamaño: 'grande' as const, 
            incluirLogo: false,
            incluirTexto: true
          }}
          onClose={() => setMostrarVistaRapida(false)}
          onImprimir={() => {
            const entidadLote = { ...lote, id: lote.id!, tipo: 'lote' as const }
            const html = generarHTMLEtiquetas(
              [entidadLote], 
              { 
                formato: 'qr_texto' as const,
                tamaño: 'grande' as const, 
                incluirLogo: false,
                incluirTexto: true
              }, 
              [lote.id || '']
            )
            const ventana = window.open('', '_blank')
            if (ventana) {
              ventana.document.write(html)
              ventana.document.close()
              ventana.print()
            }
          }}
          onCambiarConfig={(config) => {
            // La configuración se maneja internamente
          }}
        />
      )}
    </div>
  )
}