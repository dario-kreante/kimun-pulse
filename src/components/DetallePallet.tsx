import React, { useState, useEffect } from 'react'
import { ArrowLeft, Package, Grid3X3, MapPin, Scale, Thermometer, Clock, Activity, Plus, Snowflake, ShieldCheck, Send, Printer } from 'lucide-react'
import TrazabilidadTimeline from './TrazabilidadTimeline'
import { eventosService, palletsService } from '../lib/supabase'
import ModalImprimirEtiquetas from './ModalImprimirEtiquetas'
import VistaPreviewEtiquetas from './VistaPreviewEtiquetas'
import { generarHTMLEtiquetas } from '../lib/qrUtils'

interface DetallePalletProps {
  codigoPallet: string
  onVolver: () => void
  onAgregarEvento?: (codigoPallet: string, tipoEvento: string) => void
}

interface PalletInfo {
  codigo_pallet: string
  estado: string
  fecha_creacion: string
  peso_total_kg: number
  cantidad_cajas_total: number
  ubicacion_actual?: string
  temperatura_objetivo?: number
  tipo_pallet?: string
  destino_inicial?: string
  observaciones?: string
  // Información del lote padre desde la base de datos
  lote_padre?: {
    codigo_lote: string
    estado: string
    cultivo: string
    variedad: string
    cuartel_origen: string
    fecha_cosecha?: string
    responsable?: string
    peso_original_kg?: number
    total_pallets_generados?: number
  }
}

export default function DetallePallet({ 
  codigoPallet, 
  onVolver, 
  onAgregarEvento 
}: DetallePalletProps) {
  const [pallet, setPallet] = useState<PalletInfo | null>(null)
  const [eventos, setEventos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingEventos, setLoadingEventos] = useState(true)
  const [mostrarModalImprimir, setMostrarModalImprimir] = useState(false)
  const [mostrarVistaRapida, setMostrarVistaRapida] = useState(false)

  // Cargar información del pallet
  useEffect(() => {
    const cargarPallet = async () => {
      try {
        setLoading(true)
        // Cargar datos reales del pallet desde Supabase
        const palletData = await palletsService.obtenerPalletCompleto(codigoPallet)
        
        if (palletData) {
          setPallet(palletData)
        }
      } catch (error) {
        console.error('Error cargando pallet:', error)
        setPallet(null)
      } finally {
        setLoading(false)
      }
    }

    cargarPallet()
  }, [codigoPallet])

  // Cargar eventos del pallet
  useEffect(() => {
    const cargarEventos = async () => {
      try {
        setLoadingEventos(true)
        // Cargar eventos reales del pallet desde Supabase
        const eventosData = await eventosService.obtenerHistorialPallet(codigoPallet)
        setEventos(eventosData || [])
      } catch (error) {
        console.error('Error cargando eventos del pallet:', error)
        setEventos([])
      } finally {
        setLoadingEventos(false)
      }
    }

    cargarEventos()
  }, [codigoPallet])

  // Obtener siguiente paso sugerido
  const getSiguientePaso = () => {
    if (!pallet) return null
    
    const eventosRealizados = eventos.map(e => e.tipo)
    const secuenciaPostPaletizado = ['Enfriado', 'Control Calidad', 'Despacho']
    
    for (const paso of secuenciaPostPaletizado) {
      if (!eventosRealizados.includes(paso)) {
        return paso
      }
    }
    
    return null // Proceso completo
  }

  // Renderizar estado del pallet
  const renderEstadoPallet = (estado: string) => {
    const estadoConfig = {
      'en_construccion': { color: 'bg-yellow-100 text-yellow-800', texto: 'En Construcción' },
      'completo': { color: 'bg-green-100 text-green-800', texto: 'Completo' },
      'en_camara': { color: 'bg-blue-100 text-blue-800', texto: 'En Cámara' },
      'en_transito': { color: 'bg-orange-100 text-orange-800', texto: 'En Tránsito' },
      'entregado': { color: 'bg-gray-100 text-gray-800', texto: 'Entregado' },
      'devuelto': { color: 'bg-red-100 text-red-800', texto: 'Devuelto' }
    }
    
    const config = estadoConfig[estado as keyof typeof estadoConfig] || estadoConfig.completo
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.texto}
      </span>
    )
  }

  // Manejar agregar evento
  const handleAgregarEvento = () => {
    const siguientePaso = getSiguientePaso()
    if (siguientePaso && onAgregarEvento) {
      onAgregarEvento(codigoPallet, siguientePaso)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header con loading */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onVolver}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Volver a la lista de pallets"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
        
        {/* Content loading */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-6 bg-gray-200 rounded w-24"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!pallet) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onVolver}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Volver a la lista de pallets"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Pallet no encontrado</h2>
            <p className="text-gray-600">El pallet {codigoPallet} no existe o no tienes permisos para verlo</p>
          </div>
        </div>
        
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Pallet no encontrado</h3>
          <p className="mt-1 text-sm text-gray-500">Verifica el código del pallet e intenta nuevamente.</p>
        </div>
      </div>
    )
  }

  const siguientePaso = getSiguientePaso()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onVolver}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Volver"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Pallet {pallet.codigo_pallet}</h2>
            <p className="text-gray-600">Trazabilidad individual del pallet</p>
          </div>
        </div>
        <button
          onClick={() => setMostrarVistaRapida(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Printer className="h-4 w-4" />
          <span>Imprimir Etiqueta</span>
        </button>
      </div>

      {/* Información del Lote Padre - CRÍTICO para trazabilidad SAG */}
      {pallet.lote_padre && (
        <div className="bg-white rounded-lg border border-blue-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Lote Padre</h3>
              <p className="text-sm text-gray-600">Origen de trazabilidad SAG</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs text-blue-600 font-medium mb-1">CÓDIGO LOTE</p>
              <p className="font-mono text-sm font-semibold text-blue-900">
                {pallet.lote_padre.codigo_lote}
              </p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-xs text-green-600 font-medium mb-1">CULTIVO</p>
              <p className="text-sm font-semibold text-green-900">
                {pallet.lote_padre.cultivo}
              </p>
              {pallet.lote_padre.variedad && (
                <p className="text-xs text-green-700 mt-1">
                  {pallet.lote_padre.variedad}
                </p>
              )}
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-3">
              <p className="text-xs text-yellow-600 font-medium mb-1">CUARTEL</p>
              <p className="text-sm font-semibold text-yellow-900">
                {pallet.lote_padre.cuartel_origen}
              </p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-3">
              <p className="text-xs text-purple-600 font-medium mb-1">ESTADO LOTE</p>
              <p className="text-sm font-semibold text-purple-900">
                {pallet.lote_padre.estado}
              </p>
            </div>
          </div>

          {/* Información adicional del lote */}
          <div className="border-t border-blue-100 pt-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              {pallet.lote_padre.fecha_cosecha && (
                <div>
                  <span className="text-gray-500">Fecha Cosecha:</span>
                  <p className="font-medium text-gray-900">
                    {new Date(pallet.lote_padre.fecha_cosecha).toLocaleDateString('es-CL')}
                  </p>
                </div>
              )}
              
              {pallet.lote_padre.responsable && (
                <div>
                  <span className="text-gray-500">Responsable:</span>
                  <p className="font-medium text-gray-900">{pallet.lote_padre.responsable}</p>
                </div>
              )}
              
              {pallet.lote_padre.peso_original_kg && (
                <div>
                  <span className="text-gray-500">Peso Original:</span>
                  <p className="font-medium text-gray-900">{pallet.lote_padre.peso_original_kg} kg</p>
                </div>
              )}
              
              {pallet.lote_padre.total_pallets_generados && (
                <div>
                  <span className="text-gray-500">Total Pallets:</span>
                  <p className="font-medium text-gray-900">{pallet.lote_padre.total_pallets_generados}</p>
                </div>
              )}
              
              <div>
                <span className="text-gray-500">Este Pallet:</span>
                <p className="font-medium text-gray-900">{pallet.codigo_pallet}</p>
              </div>
            </div>
          </div>

          {/* Botón para ver detalles completos del lote */}
          <div className="mt-4 pt-4 border-t border-blue-100">
            <button
              onClick={() => {
                // TODO: Implementar navegación al detalle del lote padre
                console.log('Ver detalles del lote padre:', pallet.lote_padre?.codigo_lote)
              }}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Package className="h-4 w-4 mr-2" />
              Ver Historial Completo del Lote
            </button>
          </div>
        </div>
      )}

      {/* Siguiente paso sugerido */}
      {siguientePaso && (
        <div className="bg-gradient-to-r from-cultivo-50 to-lima-50 border border-cultivo-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-cultivo-500 rounded-full flex items-center justify-center text-white">
                  <Activity className="h-6 w-6" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">Siguiente Paso Sugerido</h3>
                <p className="text-gray-600">
                  Registrar evento: <strong>{siguientePaso}</strong>
                </p>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <button
                onClick={handleAgregarEvento}
                className="bg-cultivo-600 hover:bg-cultivo-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 font-medium"
              >
                {siguientePaso === 'Enfriado' && <Snowflake className="h-5 w-5" />}
                {siguientePaso === 'Control Calidad' && <ShieldCheck className="h-5 w-5" />}
                {siguientePaso === 'Despacho' && <Send className="h-5 w-5" />}
                <span>Registrar {siguientePaso}</span>
              </button>
              <div className="text-center">
                <button
                  onClick={() => onAgregarEvento && onAgregarEvento(codigoPallet, 'personalizado')}
                  className="text-sm text-gray-500 hover:text-gray-700 underline transition-colors"
                >
                  ¿Necesitas registrar otro evento?
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Información del Pallet */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Pallet</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">Código</p>
            <p className="font-medium text-gray-900 font-mono">{pallet.codigo_pallet}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Estado</p>
            {renderEstadoPallet(pallet.estado)}
          </div>
          <div>
            <p className="text-sm text-gray-500">Peso Total</p>
            <p className="font-medium text-gray-900">{pallet.peso_total_kg} kg</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Cajas</p>
            <p className="font-medium text-gray-900">{pallet.cantidad_cajas_total}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Ubicación</p>
            <p className="font-medium text-gray-900 flex items-center space-x-1">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span>{pallet.ubicacion_actual || 'Sin ubicación'}</span>
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Temperatura Objetivo</p>
            <p className="font-medium text-gray-900 flex items-center space-x-1">
              <Thermometer className="h-4 w-4 text-gray-400" />
              <span>{pallet.temperatura_objetivo || '-'}°C</span>
            </p>
          </div>
                      <div>
              <p className="text-sm text-gray-500">Lotes Consolidados</p>
              <p className="font-medium text-gray-900">1</p>
            </div>
          <div>
            <p className="text-sm text-gray-500">Fecha Creación</p>
            <p className="font-medium text-gray-900">
              {new Date(pallet.fecha_creacion).toLocaleDateString('es-CL')}
            </p>
          </div>
        </div>
        
        {/* Información adicional */}
        {(pallet.lote_padre || pallet.destino_inicial) && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {pallet.lote_padre && (
                <div>
                  <p className="text-sm text-gray-500">Lote Padre</p>
                  <p className="font-medium text-gray-900">{pallet.lote_padre.codigo_lote}</p>
                </div>
              )}
              {pallet.destino_inicial && (
                <div>
                  <p className="text-sm text-gray-500">Destino</p>
                  <p className="font-medium text-gray-900">{pallet.destino_inicial}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Trazabilidad del Pallet */}
      <TrazabilidadTimeline
        eventos={eventos}
        loading={loadingEventos}
        titulo="Trazabilidad del Pallet"
        subtitulo="Seguimiento post-paletizado"
        entidadId={codigoPallet}
        tipoEntidad="pallet"
        onAgregarEvento={handleAgregarEvento}
        mostrarBotonAgregar={!!siguientePaso}
      />

      {/* Modal de impresión */}
      {mostrarModalImprimir && (
        <ModalImprimirEtiquetas
          isOpen={mostrarModalImprimir}
          onClose={() => setMostrarModalImprimir(false)}
        />
      )}

      {/* Vista previa de etiquetas */}
      {mostrarVistaRapida && pallet && (
        <VistaPreviewEtiquetas
          entidades={[{ ...pallet, id: pallet.codigo_pallet, tipo: 'pallet' as const }]}
          qrDataStrings={[pallet.codigo_pallet || '']}
          config={{ 
            formato: 'qr_texto' as const,
            tamaño: 'grande' as const, 
            incluirLogo: false,
            incluirTexto: true
          }}
          onClose={() => setMostrarVistaRapida(false)}
          onImprimir={() => {
            const entidadPallet = { ...pallet, id: pallet.codigo_pallet, tipo: 'pallet' as const }
            const html = generarHTMLEtiquetas(
              [entidadPallet], 
              { 
                formato: 'qr_texto' as const,
                tamaño: 'grande' as const, 
                incluirLogo: false,
                incluirTexto: true
              }, 
              [pallet.codigo_pallet || '']
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