import React, { useState, useEffect } from 'react'
import { X, Printer, Settings, Download, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react'
import { generarHTMLEtiquetas, generarQRCode, type EtiquetaConfig } from '../lib/qrUtils'

// Definimos un tipo más genérico para las entidades que podemos imprimir
type EntidadImprimible = { 
  id: string; 
  tipo: 'lote' | 'pallet';
  [key: string]: any; // Permitir otras propiedades
};

interface VistaPreviewEtiquetasProps {
  entidades: EntidadImprimible[];
  qrDataStrings: string[];
  config: EtiquetaConfig;
  onClose: () => void;
  onImprimir: () => void;
  onCambiarConfig: (config: EtiquetaConfig) => void;
}

export default function VistaPreviewEtiquetas({
  entidades,
  qrDataStrings,
  config,
  onClose,
  onImprimir,
  onCambiarConfig
}: VistaPreviewEtiquetasProps) {
  const [mostrarConfiguracion, setMostrarConfiguracion] = useState(false)
  const [configTemporal, setConfigTemporal] = useState<EtiquetaConfig>(config)
  const [htmlPreview, setHtmlPreview] = useState('')
  const [isMobile, setIsMobile] = useState(false)
  const [etiquetaActual, setEtiquetaActual] = useState(0)
  const [vistaMovil, setVistaMovil] = useState(false)
  const [qrDataURLs, setQrDataURLs] = useState<string[]>([])
  const [loadingQRs, setLoadingQRs] = useState(true)

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768
      setIsMobile(mobile)
      setVistaMovil(mobile)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const generateQRs = async () => {
      setLoadingQRs(true)
      try {
        const urls = await Promise.all(
          qrDataStrings.map(data => generarQRCode(data))
        )
        setQrDataURLs(urls)
      } catch (error) {
        console.error("Error generating QR codes:", error)
        // Set empty strings on error to avoid breaking the map
        setQrDataURLs(qrDataStrings.map(() => ''))
      } finally {
        setLoadingQRs(false)
      }
    }

    if (qrDataStrings.length > 0) {
      generateQRs()
    } else {
      setLoadingQRs(false)
    }
  }, [qrDataStrings])

  useEffect(() => {
    if (!loadingQRs && qrDataURLs.length === entidades.length) {
      const html = generarHTMLEtiquetas(entidades, config, qrDataURLs)
      setHtmlPreview(html)
    }
  }, [entidades, config, qrDataURLs, loadingQRs])

  const manejarCambioConfig = (campo: keyof EtiquetaConfig, valor: any) => {
    const nuevaConfig = { ...configTemporal, [campo]: valor }
    setConfigTemporal(nuevaConfig)
  }

  const aplicarCambios = () => {
    onCambiarConfig(configTemporal)
    setMostrarConfiguracion(false)
  }

  const resetearConfig = () => {
    setConfigTemporal(config)
  }

  const descargarHTML = () => {
    const blob = new Blob([htmlPreview], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `etiquetas-${new Date().toISOString().split('T')[0]}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const navegarEtiqueta = (direccion: 'anterior' | 'siguiente') => {
    if (direccion === 'anterior' && etiquetaActual > 0) {
      setEtiquetaActual(etiquetaActual - 1)
    } else if (direccion === 'siguiente' && etiquetaActual < entidades.length - 1) {
      setEtiquetaActual(etiquetaActual + 1)
    }
  }

  const generarEtiquetaIndividual = (index: number) => {
    if (loadingQRs || !qrDataURLs[index]) {
      return '<div style="display:flex;align-items:center;justify-content:center;height:100%;font-family:sans-serif;color:#6b7280;">Generando QR...</div>'
    }
    return generarHTMLEtiquetas([entidades[index]], config, [qrDataURLs[index]])
  }

  // Vista móvil fullscreen tipo boarding pass
  if (vistaMovil) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-100 flex flex-col">
        {/* Header móvil */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            aria-label="Cerrar"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900">Etiqueta</h2>
            <p className="text-sm text-gray-600">
              {etiquetaActual + 1} de {entidades.length}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setMostrarConfiguracion(!mostrarConfiguracion)}
            className="p-2 -mr-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            aria-label="Configuración"
          >
            <Settings className="h-6 w-6" />
          </button>
        </div>

        {/* Configuración móvil (colapsible) */}
        {mostrarConfiguracion && (
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tamaño de Etiqueta
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'pequeño', label: 'Pequeño' },
                    { value: 'mediano', label: 'Mediano' },
                    { value: 'grande', label: 'Grande' }
                  ].map((tamaño) => (
                    <button
                      key={tamaño.value}
                      onClick={() => manejarCambioConfig('tamaño', tamaño.value)}
                      className={`p-2 text-sm rounded-lg border ${
                        configTemporal.tamaño === tamaño.value
                          ? 'bg-green-50 border-green-500 text-green-700'
                          : 'bg-white border-gray-300 text-gray-700'
                      }`}
                    >
                      {tamaño.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Incluir Logo
                </label>
                                 <button
                   onClick={() => manejarCambioConfig('incluirLogo', !configTemporal.incluirLogo)}
                   className={`w-12 h-6 rounded-full transition-colors ${
                     configTemporal.incluirLogo ? 'bg-green-500' : 'bg-gray-300'
                   }`}
                   aria-label="Alternar incluir logo"
                 >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                    configTemporal.incluirLogo ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              <button
                onClick={aplicarCambios}
                className="w-full py-2 bg-green-600 text-white rounded-lg font-medium"
              >
                Aplicar Cambios
              </button>
            </div>
          </div>
        )}

        {/* Contenido principal - Vista de etiqueta */}
        <div className="flex-1 flex flex-col bg-gray-100 p-4">
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-lg max-w-sm w-full">
              <iframe
                srcDoc={generarEtiquetaIndividual(etiquetaActual)}
                className="w-full h-[550px] border-0 rounded-2xl"
                title={`Etiqueta ${etiquetaActual + 1}`}
              />
            </div>
          </div>

          {/* Navegación entre etiquetas */}
          {entidades.length > 1 && (
            <div className="flex items-center justify-center mt-4 space-x-4">
                             <button
                 onClick={() => navegarEtiqueta('anterior')}
                 disabled={etiquetaActual === 0}
                 className="p-3 bg-white rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                 aria-label="Etiqueta anterior"
               >
                <ChevronLeft className="h-6 w-6 text-gray-600" />
              </button>
              
              <div className="flex space-x-2">
                                 {entidades.map((_, index) => (
                   <button
                     key={index}
                     onClick={() => setEtiquetaActual(index)}
                     className={`w-3 h-3 rounded-full ${
                       index === etiquetaActual ? 'bg-green-500' : 'bg-gray-300'
                     }`}
                     aria-label={`Ir a etiqueta ${index + 1}`}
                   />
                 ))}
              </div>
              
                             <button
                 onClick={() => navegarEtiqueta('siguiente')}
                 disabled={etiquetaActual === entidades.length - 1}
                 className="p-3 bg-white rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                 aria-label="Etiqueta siguiente"
               >
                <ChevronRight className="h-6 w-6 text-gray-600" />
              </button>
            </div>
          )}
        </div>

        {/* Acciones principales - Estilo boarding pass */}
        <div className="bg-white border-t border-gray-200 p-4 space-y-3">
          <button
            onClick={descargarHTML}
            className="w-full py-4 bg-gray-900 text-white rounded-xl font-semibold text-lg flex items-center justify-center space-x-3 shadow-lg"
          >
            <Download className="h-6 w-6" />
            <span>Descargar Etiquetas</span>
          </button>
          
          <button
            onClick={onImprimir}
            className="w-full py-3 bg-green-600 text-white rounded-xl font-medium flex items-center justify-center space-x-2"
          >
            <Printer className="h-5 w-5" />
            <span>Imprimir</span>
          </button>
        </div>
      </div>
    )
  }

  // Vista desktop original
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Vista Previa de Etiquetas</h2>
            <p className="text-sm text-gray-600 mt-1">
              {entidades.length} etiqueta(s) a generar • Tamaño: {config.tamaño}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMostrarConfiguracion(!mostrarConfiguracion)}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Settings className="h-4 w-4" />
              <span>Configurar</span>
            </button>
            
            <button
              onClick={descargarHTML}
              className="px-4 py-2 text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Descargar</span>
            </button>
            
            <button
              onClick={onImprimir}
              className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Printer className="h-4 w-4" />
              <span>Imprimir</span>
            </button>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Cerrar vista previa"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Panel de configuración (lateral) */}
          {mostrarConfiguracion && (
            <div className="w-80 border-r border-gray-200 p-6 overflow-y-auto bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración de Etiquetas</h3>
              
              {/* Tamaño */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tamaño de Etiqueta
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'pequeño', label: 'Pequeño', desc: 'Solo información crítica' },
                    { value: 'mediano', label: 'Mediano', desc: 'Información esencial' },
                    { value: 'grande', label: 'Grande', desc: 'Información completa' }
                  ].map((tamaño) => (
                    <label key={tamaño.value} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-white cursor-pointer">
                      <input
                        type="radio"
                        name="tamaño"
                        value={tamaño.value}
                        checked={configTemporal.tamaño === tamaño.value}
                        onChange={(e) => manejarCambioConfig('tamaño', e.target.value)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{tamaño.label}</div>
                        <div className="text-xs text-gray-500">{tamaño.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Opciones adicionales */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Opciones Adicionales
                </label>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={configTemporal.incluirLogo}
                      onChange={(e) => manejarCambioConfig('incluirLogo', e.target.checked)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Incluir Logo</div>
                      <div className="text-xs text-gray-500">Logo de KimunPulse</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex space-x-3">
                <button
                  onClick={aplicarCambios}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  Aplicar Cambios
                </button>
                <button
                  onClick={resetearConfig}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                  aria-label="Resetear configuración"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Vista previa */}
          <div className="flex-1 p-6 overflow-auto bg-gray-100">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-full p-4">
              <iframe
                srcDoc={htmlPreview}
                className="w-full h-full border-0"
                style={{ minHeight: '800px' }}
                title="Vista previa de etiquetas"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 