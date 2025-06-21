import React, { useState, useEffect, useRef } from 'react'
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode'
import { X, QrCode, CheckCircle, AlertCircle, Camera, Upload, Edit3, Plus, Eye, History } from 'lucide-react'
import { useCodigos } from '../hooks/useKimunPulse'
import { useAuth } from '../hooks/useAuth'
import QuickAction from './QuickAction'
import { validarFormatoQR, detectarTipoCodigo } from '../lib/qrUtils'
import { supabase } from '../lib/supabase'
import { palletsService } from '../services/palletsService'

interface ModalEscanearQRProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (resultado: any) => void
  onNavigateToDetail?: (id: string, tipo: 'lote' | 'pallet') => void
  onNavigateToHistory?: (id: string, tipo: 'lote' | 'pallet') => void
  onAddEvent?: (id: string, tipo: 'lote' | 'pallet') => void
}

export default function ModalEscanearQR({ 
  isOpen, 
  onClose, 
  onSuccess,
  onNavigateToDetail,
  onNavigateToHistory,
  onAddEvent
}: ModalEscanearQRProps) {
  const [modoEscaneo, setModoEscaneo] = useState<'camara' | 'archivo' | 'manual'>('camara')
  const [escaneando, setEscaneando] = useState(false)
  const [resultado, setResultado] = useState<any>(null)
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [codigoManual, setCodigoManual] = useState('')
  
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const readerRef = useRef<string>('qr-reader')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const html5QrCodeRef = useRef<any>(null)
  
  const { escanearCodigo } = useCodigos()
  const { usuario } = useAuth()

  // Limpiar escáner al cambiar de modo o cerrar modal
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error)
        scannerRef.current = null
      }
    }
  }, [isOpen, modoEscaneo])

  // Limpiar errores y estados cuando cambia el modo
  useEffect(() => {
    setError('')
    setResultado(null)
    setLoading(false)
    setEscaneando(false)
    
    // Limpiar escáner si existe
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error)
      scannerRef.current = null
    }
  }, [modoEscaneo])

  // Limpiar estados cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setError('')
      setResultado(null)
      setLoading(false)
      setEscaneando(false)
      setCodigoManual('')
      setModoEscaneo('camara')
    }
  }, [isOpen])

  const iniciarEscaner = async () => {
    try {
      setEscaneando(true)
      setError('')
      
      // Configuración del escáner
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        disableFlip: false,
        rememberLastUsedCamera: true
      }

      // Crear escáner
      scannerRef.current = new Html5QrcodeScanner(
        'qr-reader',
        config,
        false // verbose
      )

      // Iniciar escáner
      scannerRef.current.render(
        (decodedText, decodedResult) => {
          procesarCodigoEscaneado(decodedText)
        },
        (errorMessage) => {
          // Silenciar errores de escáner en progreso
          if (!errorMessage.includes('NotFoundError')) {
            console.log('Error de escáner:', errorMessage)
          }
        }
      )
    } catch (err) {
      setError('Error al inicializar la cámara. Verifica los permisos.')
      setEscaneando(false)
    }
  }

  const procesarCodigoEscaneado = async (codigo: string) => {
    setLoading(true)
    setError('')
    
    try {
      console.log('🔍 Procesando código:', codigo)
      
      // Validar formato del código QR
      const validacion = validarFormatoQR(codigo)
      
      if (!validacion.valido) {
        throw new Error(validacion.error || 'Código QR inválido')
      }
      
      const { data: qrData, tipo } = validacion
      
      if (!qrData || !tipo) {
        throw new Error('Datos del código QR incompletos')
      }
      
      console.log(`✅ Código válido detectado - Tipo: ${tipo}, ID: ${qrData.id}`)
      
      // Buscar en la base de datos según el tipo
      let entidadData = null
      
      if (tipo === 'lote') {
        // Buscar lote
        const { data, error } = await supabase
          .from('lotes')
          .select(`
            *,
            eventos_trazabilidad (
              id,
              tipo,
              fecha,
              descripcion
            )
          `)
          .eq('id', qrData.id)
          .single()
        
        if (error) {
          if (error.code === 'PGRST116') {
            throw new Error(`Lote ${qrData.id} no encontrado en la base de datos`)
          }
          throw error
        }
        
        entidadData = {
          ...data,
          tipo: 'lote',
          eventos_count: data.eventos_trazabilidad?.length || 0
        }
      } else if (tipo === 'pallet') {
        // Buscar pallet
        const palletCompleto = await palletsService.obtenerPalletCompleto(qrData.id)
        
        if (!palletCompleto) {
          throw new Error(`Pallet ${qrData.id} no encontrado en la base de datos`)
        }
        
        entidadData = {
          ...palletCompleto,
          tipo: 'pallet',
          id: palletCompleto.codigo_pallet
        }
      }
      
      if (!entidadData) {
        throw new Error('No se pudo obtener información de la entidad')
      }
      
      const resultadoFinal = {
        ...entidadData,
        qr_data: qrData,
        procesado_en: new Date().toISOString(),
        tipo
      }
      
      console.log('📋 Resultado final:', resultadoFinal)
      
      setResultado(resultadoFinal)
      
      // Navegar automáticamente al detalle de la entidad encontrada
      if (onNavigateToDetail) {
        console.log(`🔄 Navegando automáticamente al detalle del ${tipo}: ${resultadoFinal.id}`)
        setTimeout(() => {
          onNavigateToDetail(resultadoFinal.id, tipo)
        }, 1000) // Dar tiempo para que el usuario vea el resultado
      }
      
      if (onSuccess) {
        onSuccess(resultadoFinal)
      }
      
    } catch (error) {
      console.error('❌ Error procesando código:', error)
      const mensajeError = error instanceof Error ? error.message : 'Error desconocido al procesar el código'
      setError(mensajeError)
    } finally {
      setLoading(false)
    }
  }

  const manejarArchivoSubido = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setLoading(true)
      setError('')

      // Usar Html5Qrcode para leer archivo
      const html5QrCode = new Html5Qrcode('file-reader')
      const decodedText = await html5QrCode.scanFile(file, true)
      
      await procesarCodigoEscaneado(decodedText)
    } catch (err) {
      setError('No se pudo leer el código QR del archivo')
    } finally {
      setLoading(false)
    }
  }

  // Funciones para input manual
  const formatearCodigo = (valor: string): string => {
    // Limpiar input: solo letras, números y guiones
    let cleaned = valor.toUpperCase().replace(/[^A-Z0-9-]/g, '')
    
    // Detectar si es formato de lote (LP) o pallet (PAL)
    if (cleaned.startsWith('L') && !cleaned.startsWith('LP') && !cleaned.startsWith('PAL')) {
      cleaned = 'LP' + cleaned.substring(1)
    }
    if (cleaned.startsWith('P') && !cleaned.startsWith('PAL')) {
      cleaned = 'PAL' + cleaned.substring(1)
    }
    
    // Formatear según el tipo detectado
    if (cleaned.startsWith('LP')) {
      return formatearLote(cleaned)
    } else if (cleaned.startsWith('PAL')) {
      return formatearPallet(cleaned)
    }
    
    return cleaned
  }

  const formatearLote = (valor: string): string => {
    // Remover todos los guiones para reconstruir
    const sinGuiones = valor.replace(/-/g, '')
    
    // Extraer partes: LP + YYYY + números
    const partes = sinGuiones.match(/^LP(\d{0,4})(\d*)$/)
    if (!partes) return valor.slice(0, 16)
    
    const [, year, numeros] = partes
    
    // Construir formato LP-YYYY-CHIL-NNN
    let formatted = 'LP'
    if (year) {
      formatted += '-' + year
      if (year.length === 4) {
        formatted += '-CHIL'
        if (numeros) {
          formatted += '-' + numeros.slice(0, 3)
        }
      }
    }
    
    return formatted.slice(0, 16)
  }

  const formatearPallet = (valor: string): string => {
    // Remover todos los guiones para reconstruir
    const sinGuiones = valor.replace(/-/g, '')
    
    // Extraer partes: PAL + YYYY + números
    const partes = sinGuiones.match(/^PAL(\d{0,4})(\d*)$/)
    if (!partes) return valor.slice(0, 18)
    
    const [, year, numeros] = partes
    
    // Construir formato PAL-YYYY-CHIL-NNNNN
    let formatted = 'PAL'
    if (year) {
      formatted += '-' + year
      if (year.length === 4) {
        formatted += '-CHIL'
        if (numeros) {
          formatted += '-' + numeros.slice(0, 5)
        }
      }
    }
    
    return formatted.slice(0, 18)
  }

  const validarCodigoManual = (codigo: string): boolean => {
    const tipo = detectarTipoCodigo(codigo)
    return tipo !== 'desconocido'
  }

  const manejarInputManual = (event: React.ChangeEvent<HTMLInputElement>) => {
    const valorFormateado = formatearCodigo(event.target.value)
    setCodigoManual(valorFormateado)
    
    // Auto-submit cuando el formato es válido
    if (validarCodigoManual(valorFormateado)) {
      procesarCodigoManual(valorFormateado)
    }
  }

  const procesarCodigoManual = async (codigo: string) => {
    if (validarCodigoManual(codigo)) {
      await procesarCodigoEscaneado(codigo)
    }
  }

  const reiniciarEscaner = () => {
    setResultado(null)
    setError('')
    setEscaneando(false)
    setCodigoManual('')
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error)
      scannerRef.current = null
    }
  }

  const cerrarModal = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error)
    }
    setEscaneando(false)
    setResultado(null)
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Escanear Código QR</h2>
          <button type="button" onClick={cerrarModal} className="text-gray-500 hover:text-gray-700" title="Cerrar modal">
            <X className="h-6 w-6" />
          </button>
        </div>

          {/* Selector de modo */}
        <div className="mb-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setModoEscaneo('camara')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                modoEscaneo === 'camara'
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Camera className="h-4 w-4 mx-auto mb-1" />
              Cámara
            </button>
            <button
              onClick={() => setModoEscaneo('archivo')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                modoEscaneo === 'archivo'
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Upload className="h-4 w-4 mx-auto mb-1" />
              Archivo
            </button>
            <button
              onClick={() => setModoEscaneo('manual')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                modoEscaneo === 'manual'
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Edit3 className="h-4 w-4 mx-auto mb-1" />
              Manual
            </button>
          </div>
          </div>

            <div className="space-y-4">
          {/* Mostrar resultado */}
          {resultado && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-800">
                    {resultado.tipo === 'lote' ? '🌱 Lote Encontrado' : '📦 Pallet Encontrado'}
                  </h3>
                  <p className="text-sm text-green-700">Código procesado exitosamente</p>
                </div>
                </div>
                
                <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium text-green-800">
                    {resultado.tipo === 'lote' ? 'ID Lote:' : 'Código Pallet:'}
                    </span>
                  <span className="font-mono text-green-900">{resultado.id}</span>
                  </div>
                  
                {resultado.tipo === 'lote' && (
                  <>
                    {resultado.cultivo && (
                      <div className="flex justify-between">
                        <span className="font-medium text-green-800">Cultivo:</span>
                        <span className="text-green-900">{resultado.cultivo}</span>
                      </div>
                    )}
                    {resultado.variedad && (
                      <div className="flex justify-between">
                        <span className="font-medium text-green-800">Variedad:</span>
                        <span className="text-green-900">{resultado.variedad}</span>
                      </div>
                    )}
                    {resultado.estado && (
                      <div className="flex justify-between">
                        <span className="font-medium text-green-800">Estado:</span>
                        <span className="text-green-900">{resultado.estado}</span>
                      </div>
                    )}
                    {resultado.eventos_count !== undefined && (
                      <div className="flex justify-between">
                        <span className="font-medium text-green-800">Eventos:</span>
                        <span className="text-green-900">{resultado.eventos_count}</span>
                      </div>
                    )}
                  </>
                )}
                
                {resultado.tipo === 'pallet' && (
                  <>
                    {resultado.estado && (
                      <div className="flex justify-between">
                        <span className="font-medium text-green-800">Estado:</span>
                        <span className="text-green-900">{resultado.estado}</span>
                      </div>
                    )}
                    {resultado.cantidad_cajas_total && (
                      <div className="flex justify-between">
                        <span className="font-medium text-green-800">Cajas:</span>
                        <span className="text-green-900">{resultado.cantidad_cajas_total}</span>
                      </div>
                    )}
                    {resultado.peso_total_kg && (
                      <div className="flex justify-between">
                        <span className="font-medium text-green-800">Peso:</span>
                        <span className="text-green-900">{resultado.peso_total_kg} kg</span>
                      </div>
                    )}
                    {resultado.lotes_asociados && (
                      <div className="flex justify-between">
                        <span className="font-medium text-green-800">Lotes:</span>
                        <span className="text-green-900">{resultado.lotes_asociados}</span>
                      </div>
                    )}
                    </>
                  )}
                
                {resultado.procesado_en && (
                  <div className="flex justify-between">
                    <span className="font-medium text-green-800">Procesado:</span>
                    <span className="ml-2">
                      {new Date(resultado.procesado_en).toLocaleString('es-CL')}
                    </span>
                </div>
                )}
              </div>
            </div>
          )}

              {/* Acciones rápidas */}
          {resultado && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">Acciones rápidas:</h4>
                <div className="grid grid-cols-2 gap-3">
                  <QuickAction
                    icon={Plus}
                  label={resultado.tipo === 'lote' ? 'Agregar Evento' : 'Gestionar Pallet'}
                    color="blue"
                    onClick={() => {
                      if (onAddEvent) {
                      onAddEvent(resultado.id, resultado.tipo)
                        onClose()
                      }
                    }}
                  />
                  <QuickAction
                    icon={Eye}
                    label="Ver Detalle"
                    color="gray"
                    onClick={() => {
                      if (onNavigateToDetail) {
                      onNavigateToDetail(resultado.id, resultado.tipo)
                        onClose()
                      }
                    }}
                  />
                  <QuickAction
                    icon={History}
                    label="Historial"
                    color="purple"
                    onClick={() => {
                      if (onNavigateToHistory) {
                      onNavigateToHistory(resultado.id, resultado.tipo)
                        onClose()
                      }
                    }}
                  />
                  <QuickAction
                    icon={QrCode}
                    label="Escanear Otro"
                    color="green"
                    onClick={reiniciarEscaner}
                  />
                </div>
              </div>
          )}

          {/* Área de escáner de cámara */}
          {modoEscaneo === 'camara' && !resultado && (
            <div className="space-y-4">
              <div className="text-center">
                      <Camera className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">Usa tu cámara para escanear códigos QR</p>
                
                {!escaneando ? (
                      <button
                        onClick={iniciarEscaner}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <Camera className="h-5 w-5" />
                    <span>Iniciar Escáner</span>
                  </button>
                                 ) : (
                   <div className="space-y-4">
                     <div id="qr-reader" className="w-full"></div>
                     <button
                      onClick={() => {
                        setEscaneando(false)
                        if (scannerRef.current) {
                          scannerRef.current.clear().catch(console.error)
                          scannerRef.current = null
                        }
                      }}
                      className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                    >
                      Detener Escáner
                      </button>
                    </div>
                  )}
              </div>
                </div>
              )}

          {/* Área de carga de archivo */}
          {modoEscaneo === 'archivo' && !resultado && (
            <div className="space-y-4">
              <div className="text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">Selecciona una imagen con código QR</p>
                
                  <div id="file-reader" style={{ display: 'none' }}></div>
                
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={manejarArchivoSubido}
                      className="hidden"
                  aria-label="Seleccionar imagen con código QR"
                  title="Seleccionar imagen con código QR"
                />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <Upload className="h-5 w-5" />
                  <span>Seleccionar Imagen</span>
                </button>
                
                <p className="text-xs text-gray-500 mt-2">
                  Formatos soportados: JPG, PNG, GIF
                </p>
                  </div>
                </div>
              )}

              {/* Área de input manual */}
              {modoEscaneo === 'manual' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <Edit3 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">Ingresa el código del lote o pallet manualmente</p>
                    
                    {/* Input de código */}
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={codigoManual}
                        onChange={manejarInputManual}
                    placeholder="LP-2024-CHIL-001 o PAL-2024-CHIL-00001"
                        className={`
                      w-full text-xl font-mono text-center py-4 px-6 
                          border-2 rounded-lg transition-all duration-200
                          ${validarCodigoManual(codigoManual) 
                            ? 'border-green-500 bg-green-50 text-green-700' 
                            : codigoManual.length > 0 
                              ? 'border-orange-300 bg-orange-50 text-orange-700'
                              : 'border-gray-300 bg-white text-gray-900'
                          }
                          focus:outline-none focus:ring-2 focus:ring-blue-500
                        `}
                        autoCapitalize="characters"
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck={false}
                    maxLength={20}
                    aria-label="Código de lote o pallet"
                    title="Formato: LP-YYYY-CHIL-NNN (lote) o PAL-YYYY-CHIL-NNNNN (pallet)"
                      />
                      
                      {/* Indicador de formato */}
                      <div className="flex items-center justify-center space-x-2 text-sm">
                        {validarCodigoManual(codigoManual) ? (
                          <div className="flex items-center text-green-600">
                            <CheckCircle className="h-4 w-4 mr-1" />
                        <span>Formato válido ({detectarTipoCodigo(codigoManual)})</span>
                          </div>
                        ) : codigoManual.length > 0 ? (
                          <div className="flex items-center text-orange-600">
                            <AlertCircle className="h-4 w-4 mr-1" />
                        <span>Formato: LP-YYYY-CHIL-NNN o PAL-YYYY-CHIL-NNNNN</span>
                          </div>
                        ) : (
                      <span className="text-gray-500">Formato: LP-YYYY-CHIL-NNN (lote) o PAL-YYYY-CHIL-NNNNN (pallet)</span>
                        )}
                      </div>

                      {/* Botón manual de procesar (backup) */}
                      {codigoManual.length > 0 && !validarCodigoManual(codigoManual) && (
                        <button
                          onClick={() => procesarCodigoManual(codigoManual)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                        >
                          Procesar Código
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Loading state */}
              {loading && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-600">Procesando código QR...</p>
                </div>
              )}
            </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            </div>
          )}
      </div>
    </div>
  )
} 