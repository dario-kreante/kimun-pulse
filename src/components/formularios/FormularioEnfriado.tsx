import React, { useState, useEffect } from 'react'
import { DatosEnfriado } from '../../types/eventSpecificData'
import { CamaraFrigorifica } from '../../types/inventario'
import { Snowflake, Thermometer, Users, Check, Loader2, Building, AlertTriangle, Clock } from 'lucide-react'
import gestionCamarasService from '../../services/gestionCamarasService'

interface FormularioEnfriadoProps {
  datosIniciales?: Partial<DatosEnfriado>
  onDatosChange: (datos: DatosEnfriado | null) => void
  onValidacionChange: (esValido: boolean) => void
  contexto?: 'lote' | 'pallet'
  codigoPallet?: string
}

export default function FormularioEnfriado({
  datosIniciales,
  onDatosChange,
  onValidacionChange,
  contexto = 'lote',
  codigoPallet
}: FormularioEnfriadoProps) {
  const [datos, setDatos] = useState<Partial<DatosEnfriado>>({
    operario_nombre: '',
    turno: 'mañana',
    camara_frigorifica: '',
    temperatura_inicial: 20,
    temperatura_objetivo: 2,
    tiempo_enfriado_horas: 24,
    humedad_relativa_porcentaje: 85,
    sistema_control: 'automatico',
    responsable_camara: '',
    numero_registros_temperatura: 48, // Default: 1 cada 30 min por 24 horas
    temperatura_minima_alcanzada: 0,
    temperatura_maxima_registrada: 0,
    observaciones: '',
    ...datosIniciales
  })

  // Estados para cámaras frigoríficas
  const [camarasDisponibles, setCamarasDisponibles] = useState<CamaraFrigorifica[]>([])
  const [cargandoCamaras, setCargandoCamaras] = useState(false)
  const [camaraSeleccionada, setCamaraSeleccionada] = useState<CamaraFrigorifica | null>(null)

  // Cargar cámaras disponibles al montar
  useEffect(() => {
    cargarCamarasDisponibles()
  }, [])

  // Auto-completar información cuando se selecciona una cámara
  useEffect(() => {
    if (datos.camara_frigorifica && camarasDisponibles.length > 0) {
      const camara = camarasDisponibles.find(c => c.id === datos.camara_frigorifica)
      setCamaraSeleccionada(camara || null)
      
      if (camara) {
        setDatos(prev => ({
          ...prev,
          responsable_camara: camara.responsable,
          sistema_control: camara.tipo_control,
          temperatura_objetivo: (camara.temperatura_operacion_min + camara.temperatura_operacion_max) / 2,
          humedad_relativa_porcentaje: camara.humedad_optima_porcentaje
        }))
      }
    }
  }, [datos.camara_frigorifica, camarasDisponibles])

  const cargarCamarasDisponibles = async () => {
    try {
      setCargandoCamaras(true)
      const camaras = await gestionCamarasService.obtenerCamarasDisponibles()
      setCamarasDisponibles(camaras)
    } catch (error) {
      console.error('Error al cargar cámaras:', error)
      setCamarasDisponibles([])
    } finally {
      setCargandoCamaras(false)
    }
  }

  const validarFormulario = (datosActuales: Partial<DatosEnfriado>): boolean => {
    // Validación simplificada - solo campos esenciales
    const camposEsenciales = [
      'operario_nombre',
      'camara_frigorifica',
      'temperatura_inicial',
      'tiempo_enfriado_horas'
    ]

    const todosCompletos = camposEsenciales.every(campo => {
      const valor = datosActuales[campo as keyof DatosEnfriado]
      if (typeof valor === 'string') return valor.trim() !== ''
      return valor !== undefined && valor !== null && valor !== 0
    })

    const camaraValida = camarasDisponibles.some(c => c.id === datosActuales.camara_frigorifica)
    const temperaturaRazonable = (datosActuales.temperatura_inicial || 0) >= -10 && (datosActuales.temperatura_inicial || 0) <= 40
    const tiempoValido = (datosActuales.tiempo_enfriado_horas || 0) > 0

    return todosCompletos && camaraValida && temperaturaRazonable && tiempoValido
  }

  useEffect(() => {
    const esValido = validarFormulario(datos)
    onValidacionChange(esValido)
    
    if (esValido) {
      // Auto-completar campos dependientes antes de enviar
      const datosCompletos = {
        ...datos,
        // Si no se han registrado temperaturas min/max, usar valores por defecto
        temperatura_minima_alcanzada: datos.temperatura_minima_alcanzada || datos.temperatura_objetivo,
        temperatura_maxima_registrada: datos.temperatura_maxima_registrada || datos.temperatura_inicial,
        // Auto-calcular registros basado en tiempo si no se especifica
        numero_registros_temperatura: datos.numero_registros_temperatura || Math.max(1, (datos.tiempo_enfriado_horas || 24) * 2)
      } as DatosEnfriado
      
      onDatosChange(datosCompletos)
    } else {
      onDatosChange(null)
    }
  }, [datos, onDatosChange, onValidacionChange, camarasDisponibles])

  const handleInputChange = (campo: keyof DatosEnfriado, valor: any) => {
    setDatos(prev => ({
      ...prev,
      [campo]: valor
    }))
  }

  const seleccionarCamara = (camaraId: string) => {
    handleInputChange('camara_frigorifica', camaraId)
  }

  // Calcular tiempo estimado de enfriado basado en temperatura
  const calcularTiempoEstimado = () => {
    const inicial = datos.temperatura_inicial || 20
    const objetivo = datos.temperatura_objetivo || 2
    const diferencia = inicial - objetivo
    
    // Estimación simple: ~1.5 horas por cada grado a enfriar
    const tiempoEstimado = Math.ceil(diferencia * 1.5)
    return Math.max(12, Math.min(48, tiempoEstimado)) // Entre 12 y 48 horas
  }

  return (
    <div className="space-y-6">
      {/* Información específica del contexto */}
      {contexto === 'pallet' && codigoPallet && (
        <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Snowflake className="h-5 w-5 text-cyan-600" />
            <h5 className="font-medium text-cyan-900">Enfriado - Pallet Individual</h5>
          </div>
          <p className="text-sm text-cyan-700 mt-1">
            Ingresando pallet específico a cámara frigorífica: <span className="font-medium">{codigoPallet}</span>
          </p>
        </div>
      )}
      
      {/* Información Básica - Simplificada */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Users className="h-5 w-5 text-blue-600" />
          <h5 className="font-medium text-gray-900">Información del Operario</h5>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Operario Responsable *
            </label>
            <input
              type="text"
              value={datos.operario_nombre || ''}
              onChange={(e) => handleInputChange('operario_nombre', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Tu nombre completo"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Turno
            </label>
            <select
              value={datos.turno || 'mañana'}
              onChange={(e) => handleInputChange('turno', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Turno de trabajo"
            >
              <option value="mañana">Mañana</option>
              <option value="tarde">Tarde</option>
              <option value="noche">Noche</option>
            </select>
          </div>
        </div>
      </div>

      {/* Selección de Cámara - Simplificada e Intuitiva */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
          <Snowflake className="h-5 w-5 text-cyan-600" />
            <h5 className="font-medium text-gray-900">¿A qué cámara va la fruta?</h5>
          </div>
          {cargandoCamaras && <Loader2 className="h-4 w-4 text-cyan-600 animate-spin" />}
        </div>
        
        {cargandoCamaras ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 text-cyan-600 animate-spin mx-auto mb-2" />
            <p className="text-gray-600">Buscando cámaras disponibles...</p>
          </div>
        ) : camarasDisponibles.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <p className="text-yellow-800 font-medium">No hay cámaras disponibles</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Grid de cámaras - Diseño más simple */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {camarasDisponibles.map((camara) => (
                <div
                  key={camara.id}
                  onClick={() => seleccionarCamara(camara.id)}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                    datos.camara_frigorifica === camara.id
                      ? 'border-cyan-500 bg-cyan-50'
                      : 'border-gray-200 hover:border-cyan-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-cyan-600" />
                      <span className="font-semibold text-gray-900">{camara.nombre}</span>
                    </div>
                    {datos.camara_frigorifica === camara.id && (
                      <Check className="h-5 w-5 text-cyan-600" />
                    )}
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Temperatura:</span>
                      <span className="font-medium text-cyan-700">
                        {camara.temperatura_operacion_min}°C a {camara.temperatura_operacion_max}°C
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Responsable:</span>
                      <span className="font-medium">{camara.responsable}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      📍 {camara.ubicacion}
                    </div>
                  </div>
                </div>
              ))}
          </div>
          
            {/* Información auto-completada de la cámara seleccionada */}
            {camaraSeleccionada && (
              <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
                <h6 className="font-medium text-cyan-900 mb-2">
                  ✓ Configuración automática para: {camaraSeleccionada.nombre}
                </h6>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-cyan-800">
                  <div>
                    <span className="font-medium">Responsable:</span>
                    <div>{camaraSeleccionada.responsable}</div>
                  </div>
                  <div>
                    <span className="font-medium">Temp. Objetivo:</span>
                    <div>{datos.temperatura_objetivo}°C</div>
                  </div>
          <div>
                    <span className="font-medium">Humedad:</span>
                    <div>{datos.humedad_relativa_porcentaje}%</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Control de Temperatura - Simplificado */}
      {camaraSeleccionada && (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Thermometer className="h-5 w-5 text-red-600" />
            <h5 className="font-medium text-gray-900">Control de Temperatura</h5>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Temperatura Actual de la Fruta (°C) *
            </label>
            <input
              type="number"
                step="0.5"
                min="-10"
                max="40"
                value={datos.temperatura_inicial || ''}
                onChange={(e) => handleInputChange('temperatura_inicial', parseFloat(e.target.value) || 20)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Ej: 20"
            />
              <p className="text-xs text-gray-500 mt-1">
                Temperatura que tiene la fruta al entrar
              </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Tiempo Estimado de Enfriado (horas)
            </label>
              <div className="relative">
            <input
              type="number"
              step="0.5"
                  min="1"
                  max="72"
              value={datos.tiempo_enfriado_horas || ''}
                  onChange={(e) => handleInputChange('tiempo_enfriado_horas', parseFloat(e.target.value) || calcularTiempoEstimado())}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder={calcularTiempoEstimado().toString()}
                />
                <button
                  type="button"
                  onClick={() => handleInputChange('tiempo_enfriado_horas', calcularTiempoEstimado())}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-blue-600 hover:text-blue-800"
                  title="Usar tiempo calculado automáticamente"
                >
                  Auto
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Sugerido: {calcularTiempoEstimado()}h (basado en temperatura)
              </p>
            </div>
          </div>
          
          {/* Información auto-completada en modo solo lectura */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h6 className="text-sm font-medium text-gray-700 mb-2">Información Auto-completada:</h6>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600">
          <div>
                <span className="font-medium">Temp. Objetivo:</span>
                <div>{datos.temperatura_objetivo}°C</div>
          </div>
          <div>
                <span className="font-medium">Humedad:</span>
                <div>{datos.humedad_relativa_porcentaje}%</div>
          </div>
          <div>
                <span className="font-medium">Control:</span>
                <div className="capitalize">{datos.sistema_control}</div>
          </div>
              <div>
                <span className="font-medium">Responsable:</span>
                <div>{datos.responsable_camara}</div>
        </div>
      </div>
          </div>
        </div>
      )}

      {/* Observaciones - Simplificado */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Observaciones (opcional)
        </label>
        <textarea
          value={datos.observaciones || ''}
          onChange={(e) => handleInputChange('observaciones', e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ej: Fruta en excelente estado, sin defectos visibles..."
        />
      </div>

      {/* Indicador de validación mejorado */}
      <div className={`p-4 rounded-lg text-sm border-2 ${
        validarFormulario(datos) 
          ? 'bg-green-50 text-green-800 border-green-300' 
          : 'bg-red-50 text-red-800 border-red-300'
      }`}>
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${
            validarFormulario(datos) ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <div className="flex-1">
            {validarFormulario(datos) ? (
              <div>
                <span className="font-medium">✓ Listo para ingreso a cámara</span>
                <p className="text-green-700 text-xs mt-1">
                  La fruta se enviará automáticamente a {camaraSeleccionada?.nombre} bajo responsabilidad de {datos.responsable_camara}
                </p>
              </div>
            ) : (
              <div>
                <span className="font-medium">Completa la información faltante:</span>
                <ul className="mt-1 text-xs space-y-1">
                  {!datos.operario_nombre?.trim() && <li>• Tu nombre como operario responsable</li>}
                  {!datos.camara_frigorifica && <li>• Selecciona la cámara frigorífica</li>}
                  {!(datos.temperatura_inicial) && <li>• Temperatura actual de la fruta</li>}
                  {!(datos.tiempo_enfriado_horas || 0 > 0) && <li>• Tiempo estimado de enfriado</li>}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 