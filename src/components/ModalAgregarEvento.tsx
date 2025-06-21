import React, { useState, useEffect } from 'react'
import { 
  X, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle,
  Activity,
  Scissors,
  Truck,
  Filter,
  Package,
  Grid3X3,
  Snowflake,
  ShieldCheck,
  Send
} from 'lucide-react'
import { eventosService, lotesService } from '../lib/supabase'
import type { TipoEvento } from '../types/database'
import FormularioEventoEspecifico from './formularios/FormularioEventoEspecifico'

interface ModalAgregarEventoProps {
  isOpen: boolean
  loteId: string
  onClose: () => void
  onEventoAgregado: () => void
  eventosValidosData?: any
  loteActual?: any
  eventoParaPallet?: {codigo: string, tipoEvento: string} | null
}

export default function ModalAgregarEvento({
  isOpen,
  loteId,
  onClose,
  onEventoAgregado,
  eventosValidosData,
  loteActual,
  eventoParaPallet
}: ModalAgregarEventoProps) {
  const [tipoEventoSeleccionado, setTipoEventoSeleccionado] = useState<TipoEvento | null>(null)
  const [descripcion, setDescripcion] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingValidacion, setLoadingValidacion] = useState(false)
  const [validacion, setValidacion] = useState<any>(null)
  const [step, setStep] = useState<'seleccionar' | 'describir' | 'datos_sag' | 'confirmar'>('seleccionar')
  const [datosEspecificosSAG, setDatosEspecificosSAG] = useState<any>(null)
  const [formularioSAGValido, setFormularioSAGValido] = useState(false)
  // Estados independientes para los datos del lote en el modal
  const [progresoModal, setProgresoModal] = useState<any>(null)
  const [loadingProgreso, setLoadingProgreso] = useState(false)
  const [eventosValidosModal, setEventosValidosModal] = useState<any>(null)
  const [loadingEventosValidos, setLoadingEventosValidos] = useState(false)

  // New state for post-pallet mode
  const [isPostPaletizado, setIsPostPaletizado] = useState(false);
  const [modoEvento, setModoEvento] = useState<'lote' | 'pallet'>('lote');
  const [codigoPallet, setCodigoPallet] = useState('');

  // Resetear estados cuando el modal se abre
  useEffect(() => {
    if (isOpen) {
      setTipoEventoSeleccionado(null)
      setDescripcion('')
      setLoading(false)
      setLoadingValidacion(false)
      setValidacion(null)
      setStep('seleccionar')
      setDatosEspecificosSAG(null)
      setFormularioSAGValido(false)
      setProgresoModal(null)
      setEventosValidosModal(null)
      setIsPostPaletizado(false);
      setModoEvento('lote');
      setCodigoPallet('');
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && loteActual) {
      // Check if lote is already paletizado
      const yaEstapaletizado = loteActual.ultimo_evento === 'Paletizado';
      setIsPostPaletizado(yaEstapaletizado);
      
      // Si hay un eventoParaPallet definido, configurar automáticamente
      if (eventoParaPallet?.codigo) {
        setModoEvento('pallet');
        setCodigoPallet(eventoParaPallet.codigo);
        
        // Si hay un tipo de evento específico, pre-seleccionarlo y saltar a descripción
        if (eventoParaPallet.tipoEvento) {
          setTipoEventoSeleccionado(eventoParaPallet.tipoEvento as TipoEvento);
          setStep('describir'); // Saltar directamente a la descripción
        }
      } else if (yaEstapaletizado) {
        setModoEvento('pallet'); // Default to pallet mode post-paletizado
      } else {
        setModoEvento('lote');
      }
    }
  }, [isOpen, loteActual, eventoParaPallet]);

  // Cargar datos del lote de forma independiente al abrir el modal
  useEffect(() => {
    if (!isOpen || !loteId) return

    const cargarDatosLote = async () => {
      try {
        setLoadingProgreso(true)
        setLoadingEventosValidos(true)
        
        // Cargar progreso y eventos del lote
        const [progresoData, loteData, eventosData] = await Promise.all([
          lotesService.obtenerProgresoLote(loteId),
          lotesService.obtenerLotePorId(loteId),
          eventosService.obtenerHistorialLote(loteId)
        ])
        
        setProgresoModal(progresoData)

        // Determinar eventos válidos de forma independiente
        if (loteData && eventosData) {
          const tiposEventosExistentes = eventosData.map(e => e.tipo).filter(Boolean)
          
          // Secuencia estándar de eventos con tipos seguros
          const secuenciaEstandar: TipoEvento[] = [
            'Inicio Cosecha',
            'Cosecha Completa', 
            'Recepción Packing',
            'Selección',
            'Empaque',
            'Paletizado',
            'Enfriado',
            'Control Calidad',
            'Despacho'
          ]

          // Encontrar el siguiente evento que no se ha registrado
          const siguienteEvento = secuenciaEstandar.find(evento => !tiposEventosExistentes.includes(evento))
          
          const eventosCalculados = {
            eventos_validos: siguienteEvento ? [siguienteEvento] : [],
            proceso_completo: !siguienteEvento,
            siguiente_sugerido: siguienteEvento ? {
              tipo: siguienteEvento,
              descripcion: obtenerDescripcionSugerida(siguienteEvento)
            } : null
          }
          
          setEventosValidosModal(eventosCalculados)
        }
      } catch (error) {
        console.warn('Error al cargar datos del lote:', error)
        // Fallback: permitir todos los eventos si hay error
        setEventosValidosModal({
          eventos_validos: ['Inicio Cosecha', 'Cosecha Completa', 'Recepción Packing'],
          proceso_completo: false,
          siguiente_sugerido: {
            tipo: 'Inicio Cosecha',
            descripcion: 'Inicio del proceso de cosecha manual en cuartel'
          }
        })
      } finally {
        setLoadingProgreso(false)
        setLoadingEventosValidos(false)
      }
    }

    cargarDatosLote()
  }, [isOpen, loteId])

  // Función auxiliar para obtener descripciones sugeridas
  const obtenerDescripcionSugerida = (tipoEvento: string) => {
    const descripciones: Record<string, string> = {
      'Inicio Cosecha': 'Inicio del proceso de cosecha manual en cuartel',
      'Cosecha Completa': 'Finalización de la cosecha del lote',
      'Recepción Packing': 'Recepción de la fruta en planta de packing',
      'Selección': 'Proceso de selección y clasificación de la fruta',
      'Empaque': 'Empaque de la fruta en contenedores finales',
      'Paletizado': 'Paletizado de cajas para almacenamiento',
      'Enfriado': 'Proceso de enfriamiento en cámara frigorífica',
      'Control Calidad': 'Control de calidad antes del despacho',
      'Despacho': 'Despacho para transporte al cliente final'
    }
    return descripciones[tipoEvento] || `Registro de evento: ${tipoEvento}`
  }

  // Auto-seleccionar evento sugerido al abrir el modal
  useEffect(() => {
    if (eventosValidosModal?.siguiente_sugerido && !tipoEventoSeleccionado) {
      setTipoEventoSeleccionado(eventosValidosModal.siguiente_sugerido.tipo as TipoEvento)
      setDescripcion(eventosValidosModal.siguiente_sugerido.descripcion)
      setStep('describir')
    } else if (eventosValidosModal?.eventos_validos?.length > 0 && !tipoEventoSeleccionado) {
      // Fallback para otros eventos válidos
      if (eventosValidosModal.eventos_validos.length === 1) {
        setTipoEventoSeleccionado(eventosValidosModal.eventos_validos[0] as TipoEvento)
        setStep('describir')
      }
    }
  }, [eventosValidosModal, tipoEventoSeleccionado])

  // Validar solo cuando se selecciona un evento
  const validarEvento = async (evento: TipoEvento) => {
    if (!loteId || !evento) return
    
    try {
      setLoadingValidacion(true)
      
      // Validación simplificada: si el evento está en la lista de disponibles, es válido
      if (eventosValidosModal && eventosValidosModal.eventos_validos.includes(evento)) {
        const resultado = {
          es_valido: true,
          mensaje: 'Evento válido en la secuencia'
        }
        setValidacion(resultado)
        setTipoEventoSeleccionado(evento)
        setStep('describir')
        
        // Generar descripción sugerida
        setDescripcion(obtenerDescripcionSugerida(evento))
      } else {
        // Fallback: intentar validación con el servicio
        const resultado = await eventosService.validarSecuenciaEvento(loteId, evento)
        setValidacion(resultado)
        
        if (resultado && typeof resultado === 'object' && 'es_valido' in resultado && resultado.es_valido) {
          setTipoEventoSeleccionado(evento)
          setStep('describir')
          setDescripcion(obtenerDescripcionSugerida(evento))
        }
      }
    } catch (error) {
      console.error('Error validando evento:', error)
      setValidacion({ es_valido: false, mensaje: 'Error al validar evento' })
    } finally {
      setLoadingValidacion(false)
    }
  }

  const handleSubmit = async () => {
    if (!tipoEventoSeleccionado || !descripcion.trim()) return

    // Validar evento de pallet
    if (modoEvento === 'pallet' && !codigoPallet) {
      alert('Debes ingresar el código del pallet para registrar el evento')
      return
    }

    try {
      setLoading(true)
      
      let resultado
      
      // Extraer nombre del operario de los datos específicos
      const nombreOperario = datosEspecificosSAG?.operario_nombre || 
                            datosEspecificosSAG?.responsable_nombre || 
                            'Usuario Actual'

      if (modoEvento === 'pallet' && codigoPallet) {
        // **EVENTO DE PALLET**: Usar la nueva función para pallets
        resultado = await eventosService.agregarEventoPallet(
          codigoPallet,
          tipoEventoSeleccionado,
          descripcion.trim(),
          nombreOperario,
          datosEspecificosSAG
        )
      } else {
        // **EVENTO DE LOTE**: Usar la función original
        resultado = await eventosService.agregarEventoValidado(
        loteId,
        tipoEventoSeleccionado,
        descripcion.trim(),
          nombreOperario,
        datosEspecificosSAG
      )
      }
      
      if (resultado && typeof resultado === 'object') {
        // Manejar respuesta de eventos de pallet
        if ('success' in resultado) {
          const resultadoPallet = resultado as { success: boolean; error?: string; message?: string }
          if (!resultadoPallet.success) {
            alert('Error al registrar evento de pallet: ' + (resultadoPallet.error || 'Error desconocido'))
          return
        }
        }
        // Manejar respuesta de eventos de lote
        else if ('exito' in resultado) {
          const resultadoLote = resultado as { exito: boolean; error?: string; mensaje?: string }
          if (!resultadoLote.exito) {
            alert('Error de validación: ' + (resultadoLote.error || 'Error desconocido'))
            return
          }
        }
      }
      
      // Notificar éxito y cerrar modal
      onEventoAgregado()
      onClose()
    } catch (error) {
      const tipoEvento = modoEvento === 'pallet' ? 'evento de pallet' : 'evento de lote'
      alert(`Error al agregar ${tipoEvento}: ` + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const eventosDisponibles = eventosValidosModal?.eventos_validos || []
  const estaCompleto = eventosValidosModal?.proceso_completo || false

  // Mapeo de iconos para cada tipo de evento
  const getEventoIcon = (tipo: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'Inicio Cosecha': <Scissors className="h-8 w-8" />,
      'Cosecha Completa': <CheckCircle className="h-8 w-8" />,
      'Recepción Packing': <Truck className="h-8 w-8" />,
      'Selección': <Filter className="h-8 w-8" />,
      'Empaque': <Package className="h-8 w-8" />,
      'Paletizado': <Grid3X3 className="h-8 w-8" />,
      'Enfriado': <Snowflake className="h-8 w-8" />,
      'Control Calidad': <ShieldCheck className="h-8 w-8" />,
      'Despacho': <Send className="h-8 w-8" />
    }
    return iconMap[tipo] || <Activity className="h-8 w-8" />
  }

  // Color por tipo de evento
  const getEventoColor = (tipo: string) => {
    const colorMap: Record<string, string> = {
      'Inicio Cosecha': 'bg-green-500 border-green-200 text-white',
      'Cosecha Completa': 'bg-green-600 border-green-300 text-white',
      'Recepción Packing': 'bg-blue-500 border-blue-200 text-white',
      'Selección': 'bg-yellow-500 border-yellow-200 text-white',
      'Empaque': 'bg-purple-500 border-purple-200 text-white',
      'Paletizado': 'bg-indigo-500 border-indigo-200 text-white',
      'Enfriado': 'bg-cyan-500 border-cyan-200 text-white',
      'Control Calidad': 'bg-orange-500 border-orange-200 text-white',
      'Despacho': 'bg-red-500 border-red-200 text-white'
    }
    return colorMap[tipo] || 'bg-gray-500 border-gray-200 text-white'
  }

  const volver = () => {
    if (step === 'describir') {
      setStep('seleccionar')
      setTipoEventoSeleccionado(null)
      setValidacion(null)
      setDescripcion('')
    } else if (step === 'datos_sag') {
      setStep('describir')
    } else if (step === 'confirmar') {
      setStep('datos_sag')
    }
  }

  // Prevenir cierre accidental durante formularios críticos
  const previeneCierre = step === 'datos_sag' && ['Cosecha Completa', 'Enfriado', 'Despacho'].includes(tipoEventoSeleccionado || '')

  // Get available events based on current agricultural flow
  const getEventosDisponibles = (): TipoEvento[] => {
    // Para eventos de pallet, solo permitir eventos post-paletizado
    if (modoEvento === 'pallet') {
      return ['Enfriado', 'Control Calidad', 'Despacho'] as TipoEvento[];
    }
    
    // Para eventos de lote, usar la lógica existente
    if (!eventosValidosModal) return [];
    
    // Si el proceso está completo, no permitir más eventos
    if (eventosValidosModal.proceso_completo) {
      return [];
    }

    // Usar la lógica ya implementada en el modal que es más robusta
    return (eventosValidosModal.eventos_validos || []) as TipoEvento[];
  };

  const getTituloStep = (): string => {
    const prefijo = modoEvento === 'pallet' ? 'Evento de Pallet' : 'Evento de Lote'
    
    switch (step) {
      case 'seleccionar':
        return `${prefijo} - Seleccionar`
      case 'describir':
        return `${prefijo} - Describir`
      case 'datos_sag':
        return `${prefijo} - Datos SAG`
      case 'confirmar':
        return `${prefijo} - Confirmar`
      default:
        return `Agregar ${prefijo}`
    }
  }

  const getStepOrder = (currentStep: string): number => {
    const steps = ['seleccionar', 'describir', 'datos_sag', 'confirmar']
    return steps.indexOf(currentStep)
  }

  const handleClose = () => {
    // Verificar si hay datos no guardados
    const hayDatosIngresados = tipoEventoSeleccionado || descripcion.trim() || datosEspecificosSAG
    
    if (hayDatosIngresados && !loading) {
      setMostrarModalConfirmacion(true)
    } else {
      onClose()
    }
  }

  const [mostrarModalConfirmacion, setMostrarModalConfirmacion] = useState(false)

  const confirmarCerrarModal = () => {
    setMostrarModalConfirmacion(false)
    onClose()
  }

  const cancelarCerrarModal = () => {
    setMostrarModalConfirmacion(false)
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="relative w-full max-w-4xl mx-4 bg-white rounded-xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
          {/* Header (Fijo) */}
          <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {step !== 'seleccionar' && (
                <button
                  onClick={volver}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={loading}
                  aria-label="Volver al paso anterior"
                  title="Volver al paso anterior"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-500" />
                </button>
              )}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {getTituloStep()}
                </h3>
                <p className="text-sm text-gray-500">
                  {modoEvento === 'pallet' && codigoPallet 
                    ? `Pallet: ${codigoPallet}` 
                    : loteActual?.id || loteId}
                </p>
              </div>
            </div>
            
            {/* Indicador de progreso */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                {['seleccionar', 'describir', 'datos_sag', 'confirmar'].map((stepName, index) => (
                  <div key={stepName} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                      step === stepName ? 'bg-blue-600 text-white' : 
                      getStepOrder(step) > index ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {getStepOrder(step) > index ? <CheckCircle className="h-4 w-4" /> : index + 1}
                    </div>
                    {index < 3 && (
                      <div className={`w-8 h-0.5 ${
                        getStepOrder(step) > index ? 'bg-green-500' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                disabled={loading}
                aria-label="Cerrar modal"
                title="Cerrar modal"
              >
                <X className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
              </button>
            </div>
          </div>

          {/* Progreso del proceso (Solo para eventos de lote) */}
          {modoEvento === 'lote' && progresoModal && !loadingProgreso && (
            <div className="flex-shrink-0 px-6 py-4 bg-cultivo-50 border-b border-gray-200">
              <div className="flex items-center justify-between text-sm text-cultivo-800 mb-2">
                <span className="font-medium">Progreso del Proceso</span>
                <span className="font-bold">{progresoModal.progreso_porcentaje.toFixed(1)}% completado</span>
              </div>
              <div className="w-full bg-cultivo-200 rounded-full h-3">
                <div 
                  className="bg-cultivo-500 h-3 rounded-full transition-all duration-500" 
                  style={{ width: `${progresoModal.progreso_porcentaje}%` }}
                ></div>
              </div>
              <p className="text-xs text-cultivo-600 mt-2">
                {progresoModal.eventos_completados} de 9 etapas • {progresoModal.etapas_restantes} restantes
              </p>
            </div>
          )}
          
          {/* Información de Pallet (Solo para eventos de pallet) */}
          {modoEvento === 'pallet' && codigoPallet && (
            <div className="flex-shrink-0 px-6 py-4 bg-cyan-50 border-b border-gray-200">
              <div className="flex items-center justify-between text-sm text-cyan-800 mb-2">
                <span className="font-medium">Evento de Pallet Individual</span>
                <span className="font-bold">Post-Paletizado</span>
              </div>
              <p className="text-xs text-cyan-600">
                Registrando evento específico para pallet individual • Lote padre: {loteActual?.id || loteId}
              </p>
            </div>
          )}

          {/* Contenido Principal (Scrollable) */}
          <div className="flex-grow overflow-y-auto p-6">
            {estaCompleto ? (
              <div className="text-center py-8">
                <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                <h4 className="text-xl font-medium text-gray-900 mb-3">Proceso Completado</h4>
                <p className="text-gray-600 mb-6">
                  Este lote ha completado todo el proceso de trazabilidad. No se pueden agregar más eventos.
                </p>
                <button
                  onClick={onClose}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium"
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <>
                {/* Paso 1: Seleccionar tipo de evento */}
                {step === 'seleccionar' && (
                  <div className="space-y-4">
                    <div className="text-center mb-6">
                      <h4 className="text-lg font-medium text-gray-900 mb-2">¿Qué evento vas a registrar?</h4>
                      <p className="text-gray-600">Selecciona el tipo de evento que acabas de completar</p>
                    </div>

                    {/* Post-pallet mode selector */}
                    {isPostPaletizado && (
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <p className="text-sm font-medium text-blue-900 mb-3">
                          Este lote ya está paletizado. ¿Cómo deseas registrar el evento?
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setModoEvento('lote')}
                            className={`p-3 text-left border rounded-lg transition-colors ${
                              modoEvento === 'lote'
                                ? 'border-blue-500 bg-blue-100 text-blue-900'
                                : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
                            }`}
                          >
                            <div className="font-medium">A nivel de Lote</div>
                            <div className="text-xs mt-1">Eventos generales del lote completo</div>
                          </button>
                          <button
                            type="button"
                            onClick={() => setModoEvento('pallet')}
                            className={`p-3 text-left border rounded-lg transition-colors ${
                              modoEvento === 'pallet'
                                ? 'border-green-500 bg-green-100 text-green-900'
                                : 'border-gray-300 bg-white text-gray-700 hover:border-green-300'
                            }`}
                          >
                            <div className="font-medium">A nivel de Pallet</div>
                            <div className="text-xs mt-1">Eventos específicos por pallet</div>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Pallet code input for pallet mode */}
                    {isPostPaletizado && modoEvento === 'pallet' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Código del Pallet
                        </label>
                        <input
                          type="text"
                          value={codigoPallet}
                          onChange={(e) => setCodigoPallet(e.target.value)}
                          placeholder="PAL-2025-CHIL-00001"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Formato: PAL-YYYY-CHIL-NNNNN
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Tipo de Evento
                      </label>
                      <div className="grid grid-cols-1 gap-2">
                        {getEventosDisponibles().map((evento: TipoEvento) => (
                          <button
                            key={evento}
                            type="button"
                            onClick={() => setTipoEventoSeleccionado(evento)}
                            className={`p-3 text-left border rounded-lg transition-colors ${
                              tipoEventoSeleccionado === evento
                                ? 'border-blue-500 bg-blue-50 text-blue-900'
                                : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
                            }`}
                          >
                            <div className="font-medium">{evento}</div>
                            {isPostPaletizado && (
                              <div className="text-xs text-gray-500 mt-1">
                                {modoEvento === 'pallet' ? 'Evento específico del pallet' : 'Evento general del lote'}
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Show warning if pallet mode selected but no pallet code */}
                    {isPostPaletizado && modoEvento === 'pallet' && !codigoPallet && (
                      <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                        <p className="text-sm text-yellow-800">
                          ⚠️ Debes ingresar el código del pallet para continuar
                        </p>
                      </div>
                    )}

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setStep('describir')}
                        disabled={!tipoEventoSeleccionado || (isPostPaletizado && modoEvento === 'pallet' && !codigoPallet)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                )}

                {/* Paso 2: Describir el evento */}
                {step === 'describir' && tipoEventoSeleccionado && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className={`inline-flex items-center space-x-3 px-4 py-3 rounded-lg ${getEventoColor(tipoEventoSeleccionado)} mb-4`}>
                        {getEventoIcon(tipoEventoSeleccionado)}
                        <span className="font-semibold text-lg">{tipoEventoSeleccionado}</span>
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">Describe el evento</h4>
                      <p className="text-gray-600">Agrega detalles sobre lo que se realizó</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Descripción del evento
                      </label>
                      <textarea 
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        rows={4}
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-cultivo-500 focus:border-cultivo-500 transition-colors"
                        placeholder="Describe qué se hizo, quién participó, condiciones especiales, etc."
                        autoFocus
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Mínimo 10 caracteres. Incluye detalles relevantes para la trazabilidad.
                      </p>
                    </div>

                    {/* Información de validación exitosa */}
                    {validacion && typeof validacion === 'object' && 'es_valido' in validacion && validacion.es_valido && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <p className="text-green-800 font-medium">Evento válido en la secuencia</p>
                        </div>
                        {'progreso_con_evento' in validacion && validacion.progreso_con_evento && (
                          <p className="text-green-700 text-sm mt-1">
                            Progreso después del evento: {validacion.progreso_con_evento}%
                          </p>
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => setStep('datos_sag')}
                      disabled={descripcion.trim().length < 10}
                      className="w-full bg-cultivo-600 hover:bg-cultivo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-4 rounded-lg font-medium text-lg transition-colors"
                    >
                      Continuar
                    </button>
                  </div>
                )}

                {/* Paso 3: Datos específicos SAG */}
                {step === 'datos_sag' && tipoEventoSeleccionado && (
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="text-center">
                      <div className={`inline-flex items-center space-x-3 px-4 py-3 rounded-lg ${getEventoColor(tipoEventoSeleccionado)} mb-4`}>
                        {getEventoIcon(tipoEventoSeleccionado)}
                        <span className="font-semibold text-lg">{tipoEventoSeleccionado}</span>
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">Datos Específicos SAG</h4>
                      <p className="text-gray-600">Información requerida para la trazabilidad completa</p>
                    </div>

                    {/* Formulario */}
                    <div className="max-h-[50vh] overflow-y-auto px-1">
                      <FormularioEventoEspecifico
                        tipoEvento={tipoEventoSeleccionado}
                        datosIniciales={datosEspecificosSAG}
                        onDatosChange={setDatosEspecificosSAG}
                        onValidacionChange={setFormularioSAGValido}
                        usarStepper={false} 
                        onComplete={() => setStep('confirmar')}
                        contexto={modoEvento}
                        codigoPallet={modoEvento === 'pallet' ? codigoPallet : undefined}
                      />
                    </div>
                  </div>
                )}

                {/* Paso 4: Confirmar */}
                {step === 'confirmar' && tipoEventoSeleccionado && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h4 className="text-lg font-medium text-gray-900 mb-2">Confirmar evento</h4>
                      <p className="text-gray-600">Revisa la información antes de guardar</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Tipo de evento:</span>
                        <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getEventoColor(tipoEventoSeleccionado)}`}>
                          {getEventoIcon(tipoEventoSeleccionado)}
                          <span>{tipoEventoSeleccionado}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Descripción:</span>
                        <p className="text-gray-900 mt-1 text-sm">{descripcion}</p>
                      </div>
                      {datosEspecificosSAG && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">Datos SAG:</span>
                          <div className="mt-1 text-sm text-gray-900 bg-blue-50 rounded p-3 border border-blue-200">
                            {/* Información básica común a todos los eventos */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                              <p><span className="font-medium text-blue-800">Operario:</span> {datosEspecificosSAG.operario_nombre}</p>
                              <p><span className="font-medium text-blue-800">Turno:</span> {datosEspecificosSAG.turno}</p>
                            </div>
                            
                            {/* Datos específicos por tipo de evento */}
                            {tipoEventoSeleccionado === 'Recepción Packing' && (
                              <div className="border-t border-blue-200 pt-3">
                                <h6 className="font-medium text-blue-800 mb-2">Detalles de Recepción:</h6>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                  <p>• Guía: {datosEspecificosSAG.numero_guia_recepcion}</p>
                                  <p>• Transportista: {datosEspecificosSAG.transportista}</p>
                                  <p>• Bins recibidos: {datosEspecificosSAG.numero_bins_recibidos}</p>
                                  <p>• Peso total: {datosEspecificosSAG.peso_total_recibido_kg} kg</p>
                                  <p>• Temperatura: {datosEspecificosSAG.temperatura_llegada}°C</p>
                                  <p>• Condición: {datosEspecificosSAG.condicion_fruta}</p>
                                </div>
                              </div>
                            )}
                            
                            {tipoEventoSeleccionado === 'Paletizado' && (
                              <div className="border-t border-blue-200 pt-3">
                                <h6 className="font-medium text-blue-800 mb-2">Detalles del Paletizado:</h6>
                                
                                {/* Información general */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-3">
                                  <p>• Operario: {datosEspecificosSAG.operario_nombre}</p>
                                  <p>• Tipo pallet: {datosEspecificosSAG.tipo_pallet}</p>
                                  <p>• Destino: {datosEspecificosSAG.destino_inicial}</p>
                                  <p>• Peso verificado: {datosEspecificosSAG.control_peso_verificado ? 'Sí' : 'No'}</p>
                                </div>

                                {/* Múltiples pallets */}
                                {datosEspecificosSAG.cantidad_pallets_generados && datosEspecificosSAG.cantidad_pallets_generados > 1 ? (
                                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                    <h6 className="font-medium text-green-800 mb-2">
                                      🎯 Múltiples Pallets Generados ({datosEspecificosSAG.cantidad_pallets_generados})
                                    </h6>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-green-700 mb-2">
                                      <p>• Total cajas: {datosEspecificosSAG.cantidad_cajas_lote}</p>
                                      <p>• Peso total: {datosEspecificosSAG.peso_lote_en_pallet_kg} kg</p>
                                    </div>
                                    <div className="space-y-1">
                                      {datosEspecificosSAG.resumen_pallets?.map((pallet: any, index: number) => (
                                        <div key={index} className="flex justify-between items-center text-xs bg-white rounded px-2 py-1">
                                          <span className="font-mono text-green-800">{pallet.codigo}</span>
                                          <span className="text-green-600">
                                            {pallet.cajas} cajas • {pallet.peso.toFixed(1)} kg
                                            {pallet.mixto && <span className="ml-1 text-yellow-600">• Mixto</span>}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                    <p>• Pallet: {datosEspecificosSAG.numero_pallet}</p>
                                    <p>• Cajas del lote: {datosEspecificosSAG.cantidad_cajas_lote}</p>
                                    <p>• Peso del lote: {datosEspecificosSAG.peso_lote_en_pallet_kg} kg</p>
                                    <p>• Etiquetado: {datosEspecificosSAG.estado_etiquetado}</p>
                                    {datosEspecificosSAG.pallet_mixto && (
                                      <p>• <span className="text-yellow-600 font-medium">Pallet Mixto</span> - Total: {datosEspecificosSAG.total_cajas_pallet} cajas</p>
                                    )}
                                  </div>
                                )}

                                {datosEspecificosSAG.lotes_consolidados && datosEspecificosSAG.lotes_consolidados.length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-sm"><span className="font-medium text-blue-800">Otros lotes:</span> {datosEspecificosSAG.lotes_consolidados.join(', ')}</p>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {tipoEventoSeleccionado === 'Enfriado' && (
                              <div className="border-t border-blue-200 pt-3">
                                <h6 className="font-medium text-blue-800 mb-2">Detalles del Enfriamiento:</h6>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                  <p>• Cámara: {datosEspecificosSAG.camara_asignada}</p>
                                  <p>• Temperatura objetivo: {datosEspecificosSAG.temperatura_objetivo}°C</p>
                                  <p>• Humedad objetivo: {datosEspecificosSAG.humedad_objetivo}%</p>
                                  <p>• Tiempo estimado: {datosEspecificosSAG.tiempo_enfriamiento_estimado_horas}h</p>
                                </div>
                              </div>
                            )}
                            
                            {tipoEventoSeleccionado === 'Despacho' && (
                              <div className="border-t border-blue-200 pt-3">
                                <h6 className="font-medium text-blue-800 mb-2">Detalles del Despacho:</h6>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                  <p>• Factura: {datosEspecificosSAG.numero_factura}</p>
                                  <p>• Guía despacho: {datosEspecificosSAG.numero_guia_despacho}</p>
                                  <p>• Transportista: {datosEspecificosSAG.transportista}</p>
                                  <p>• Vehículo: {datosEspecificosSAG.patente_vehiculo}</p>
                                  <p>• Cliente: {datosEspecificosSAG.destino_cliente}</p>
                                  <p>• Pallets: {datosEspecificosSAG.cantidad_pallets_despachados}</p>
                                </div>
                              </div>
                            )}
                            
                            {/* Observaciones si existen */}
                            {datosEspecificosSAG.observaciones && (
                              <div className="border-t border-blue-200 pt-3 mt-3">
                                <p className="text-sm"><span className="font-medium text-blue-800">Observaciones:</span> {datosEspecificosSAG.observaciones}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Fecha y hora:</span>
                        <span className="text-sm text-gray-900">{new Date().toLocaleString('es-CL')}</span>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={volver}
                        disabled={loading}
                        className="flex-1 border-2 border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 bg-cultivo-600 hover:bg-cultivo-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Guardando...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-5 w-5" />
                            <span>Confirmar Evento</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* 
            SOLUCIÓN ROBUSTA PARA EL FOOTER:
            - El contenedor del pie de página (`div` principal) siempre está en el DOM para evitar saltos de layout.
            - Se usa `grid` y `grid-rows-[0fr]` / `grid-rows-[1fr]` para animar suavemente la altura de 0 a 'auto'.
            - El contenido interno (`div` con `overflow-hidden`) se expande y colapsa con la animación.
            - Esto elimina el parpadeo y crea una transición profesional y consistente con el resto de la app.
          */}
          <div className={`
            flex-shrink-0 border-t bg-gray-50
            transition-all duration-300 ease-in-out
            grid
            ${step === 'datos_sag' ? 'grid-rows-[1fr] border-gray-200' : 'grid-rows-[0fr] border-transparent'}
          `}>
            <div className="overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
                  <button
                    onClick={() => setStep('describir')}
                    disabled={loading}
                    className="w-full sm:w-auto order-2 sm:order-1 border border-gray-300 hover:bg-gray-100 disabled:opacity-50 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    ← Volver
                  </button>
                  
                  <button
                    onClick={() => setStep('confirmar')}
                    disabled={loading || !formularioSAGValido}
                    className={`w-full sm:flex-1 order-1 sm:order-2 text-white px-6 py-3 rounded-lg font-bold text-base transition-all duration-200 transform hover:scale-105 shadow-md ${
                      formularioSAGValido 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-amber-500 cursor-not-allowed'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {formularioSAGValido ? '✓ Continuar al Resumen' : '⚠️ Revisar Información'}
                  </button>
                </div>
                
                <div className={`
                  mt-3 text-center transition-opacity duration-300
                  ${!formularioSAGValido ? 'opacity-100' : 'opacity-0 h-0'}
                `}>
                  <p className="text-xs text-amber-800">
                    Completa todos los campos obligatorios (*) para continuar.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmación de Cierre */}
      {mostrarModalConfirmacion && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md mx-4 bg-white rounded-xl shadow-2xl">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    ¿Cerrar sin guardar?
                  </h3>
                  <p className="text-sm text-gray-500">
                    Se perderán los datos ingresados
                  </p>
                </div>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
                <p className="text-sm text-amber-800">
                  Tienes datos sin guardar en este formulario. Si cierras ahora, se perderán todos los cambios.
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={cancelarCerrarModal}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  Continuar editando
                </button>
                <button
                  onClick={confirmarCerrarModal}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                >
                  Sí, cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 