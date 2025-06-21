import React, { useState, useEffect } from 'react'
import { X, Factory, Package, Eye, Printer, Download, Truck } from 'lucide-react'
import { useLotes, useCodigos } from '../hooks/useKimunPulse'
import { useAuth } from '../hooks/useAuth'
import { generarQRCode, generarHTMLEtiquetas, generarCodigoQRCompleto, type EtiquetaConfig } from '../lib/qrUtils'
import { codigosService } from '../lib/supabase'
import { palletsService } from '../services/palletsService'
import VistaPreviewEtiquetas from './VistaPreviewEtiquetas'

interface ModalImprimirEtiquetasProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (resultado: any) => void
}

export default function ModalImprimirEtiquetas({ isOpen, onClose, onSuccess }: ModalImprimirEtiquetasProps) {
  const [tipoEntidad, setTipoEntidad] = useState<'lotes' | 'pallets'>('lotes')
  const [paso, setPaso] = useState<'seleccion' | 'vista-previa'>('seleccion')
  const [entidadesSeleccionadas, setEntidadesSeleccionadas] = useState<any[]>([])
  
  const [configuracion, setConfiguracion] = useState<EtiquetaConfig>({
    formato: 'qr_texto',
    tamaño: 'mediano',
    incluirTexto: true,
    incluirLogo: true
  })

  const [qrDataStrings, setQrDataStrings] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [pallets, setPallets] = useState<any[]>([])
  const [loadingPallets, setLoadingPallets] = useState(false)

  const { lotes: todosLosLotes, loading: loadingLotes } = useLotes()
  const { usuario } = useAuth()
  const { imprimirEtiquetas } = useCodigos()

  useEffect(() => {
    if (isOpen) {
      setPaso('seleccion')
      setTipoEntidad('lotes')
      setEntidadesSeleccionadas([])
      setError(null)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && tipoEntidad === 'pallets') {
      cargarPallets()
    }
  }, [isOpen, tipoEntidad])

  const cargarPallets = async () => {
    setLoadingPallets(true)
    try {
      const palletsData = await palletsService.obtenerPallets({
        activo: true,
        limite: 100
      })
      
      setPallets(palletsData)
    } catch (err) {
      setError('Error al cargar pallets')
    } finally {
      setLoadingPallets(false)
    }
  }

  const generarYMostrarVistaPrevia = async () => {
    if (entidadesSeleccionadas.length === 0) {
      setError("Seleccione al menos una entidad.")
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const dataStrings = entidadesSeleccionadas.map(entidad => {
        const id = tipoEntidad === 'lotes' ? entidad.id : entidad.codigo_pallet
        return generarCodigoQRCompleto(id, tipoEntidad.slice(0, -1) as 'lote' | 'pallet')
      })

      setQrDataStrings(dataStrings)
      setPaso('vista-previa')

    } catch (err) {
      setError("Error al preparar los datos para los códigos QR.")
    } finally {
      setLoading(false)
    }
  }

  const manejarSeleccionEntidad = (entidad: any) => {
    const id = tipoEntidad === 'lotes' ? entidad.id : entidad.codigo_pallet
    const yaSeleccionado = entidadesSeleccionadas.some(e => (tipoEntidad === 'lotes' ? e.id : e.codigo_pallet) === id)

    if (yaSeleccionado) {
      setEntidadesSeleccionadas(prev => prev.filter(e => (tipoEntidad === 'lotes' ? e.id : e.codigo_pallet) !== id))
    } else {
      setEntidadesSeleccionadas(prev => [...prev, { ...entidad, tipo: tipoEntidad.slice(0, -1) }])
    }
  }

  const procesarImpresionFinal = (html: string) => {
    imprimirEtiquetas(
      entidadesSeleccionadas.map(e => tipoEntidad === 'lotes' ? e.id : e.codigo_pallet),
      usuario?.nombre || 'N/A',
      configuracion.formato,
      1 // Cantidad ahora es 1 por etiqueta
    )
    
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(html)
      printWindow.document.close()
      printWindow.focus()
    }
  }
  
  if (!isOpen) return null

  if (paso === 'vista-previa') {
    return (
      <VistaPreviewEtiquetas
        entidades={entidadesSeleccionadas}
        qrDataStrings={qrDataStrings}
        config={configuracion}
        onClose={() => setPaso('seleccion')}
        onImprimir={() => {
          const generarHtmlParaImprimir = async () => {
            const qrUrls = await Promise.all(
              qrDataStrings.map(data => generarQRCode(data))
            )
            const html = generarHTMLEtiquetas(entidadesSeleccionadas, configuracion, qrUrls)
            procesarImpresionFinal(html)
          }
          generarHtmlParaImprimir()
        }}
        onCambiarConfig={setConfiguracion}
      />
    )
  }
  
  const entidadesDisponibles = tipoEntidad === 'lotes' ? todosLosLotes : pallets
  const isLoading = tipoEntidad === 'lotes' ? loadingLotes : loadingPallets
  
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Imprimir Etiquetas</h2>
          <button 
            onClick={onClose} 
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            aria-label="Cerrar modal de impresión"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto" style={{ maxHeight: '75vh' }}>
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-3">1. Seleccione el tipo de entidad</h3>
            <div className="flex space-x-3 bg-gray-100 p-1 rounded-lg">
              <button 
                onClick={() => setTipoEntidad('lotes')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${tipoEntidad === 'lotes' ? 'bg-white shadow text-green-700' : 'text-gray-600 hover:bg-gray-200'}`}
              >
                Lotes
              </button>
              <button 
                onClick={() => setTipoEntidad('pallets')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${tipoEntidad === 'pallets' ? 'bg-white shadow text-green-700' : 'text-gray-600 hover:bg-gray-200'}`}
              >
                Pallets
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">2. Seleccione las entidades</h3>
            <div className="border border-gray-200 rounded-lg h-96 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-full text-gray-500">Cargando...</div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {entidadesDisponibles.map(entidad => {
                    const id = tipoEntidad === 'lotes' ? entidad.id : entidad.codigo_pallet;
                    const isSelected = entidadesSeleccionadas.some(e => (tipoEntidad === 'lotes' ? e.id : e.codigo_pallet) === id);
                    return (
                      <li 
                        key={id} 
                        onClick={() => manejarSeleccionEntidad(entidad)}
                        className={`p-4 flex justify-between items-center cursor-pointer transition-colors ${isSelected ? 'bg-green-50' : 'hover:bg-gray-50'}`}
                      >
                        <div>
                          <p className={`font-medium ${isSelected ? 'text-green-800' : 'text-gray-900'}`}>{id}</p>
                          <p className="text-sm text-gray-600">
                            {tipoEntidad === 'lotes' 
                              ? `${entidad.cultivo} - ${entidad.variedad}` 
                              : `Lote Padre: ${entidad.lote_padre_id || 'N/A'}`}
                          </p>
                        </div>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${isSelected ? 'bg-green-600 border-green-600' : 'border-gray-300'}`}>
                          {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <div>
            <span className="text-sm font-medium text-gray-700">
              {entidadesSeleccionadas.length} seleccionada(s)
            </span>
          </div>
          <button
            onClick={generarYMostrarVistaPrevia}
            disabled={loading || entidadesSeleccionadas.length === 0}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? 'Generando...' : 'Ver Vista Previa'}
          </button>
        </div>
      </div>
    </div>
  )
} 