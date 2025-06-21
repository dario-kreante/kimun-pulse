import React, { useState, useEffect } from 'react'
import { DatosCosechaCompleta } from '../../types/eventSpecificData'
import { CheckCircle, Clock, Package, TrendingDown, Users, ChevronRight, ChevronLeft } from 'lucide-react'

interface FormularioCosechaCompletaProps {
  datosIniciales?: Partial<DatosCosechaCompleta>
  onDatosChange: (datos: DatosCosechaCompleta | null) => void
  onValidacionChange: (esValido: boolean) => void
  onComplete?: () => void
  usarStepper?: boolean
}

export default function FormularioCosechaCompleta({
  datosIniciales,
  onDatosChange,
  onValidacionChange,
  onComplete,
  usarStepper = false
}: FormularioCosechaCompletaProps) {
  const [step, setStep] = useState(1)
  const [datos, setDatos] = useState<Partial<DatosCosechaCompleta>>({
    operario_nombre: '',
    turno: 'mañana',
    hora_termino: new Date().toTimeString().slice(0, 5),
    cantidad_cosechada_kg: 0,
    numero_bins_llenos: 0,
    merma_estimada_porcentaje: 0,
    calidad_visual: 'excelente',
    observaciones: '',
    ...datosIniciales
  })

  const steps = [
    { id: 1, nombre: 'Operario', icono: Users, requerido: true },
    { id: 2, nombre: 'Resultados', icono: Package, requerido: true },
    { id: 3, nombre: 'Control', icono: TrendingDown, requerido: true },
    { id: 4, nombre: 'Finalizar', icono: CheckCircle, requerido: false }
  ]

  const validarFormulario = (datosActuales: Partial<DatosCosechaCompleta>): boolean => {
    const camposRequeridos: (keyof DatosCosechaCompleta)[] = [
      'operario_nombre',
      'hora_termino',
      'cantidad_cosechada_kg',
      'numero_bins_llenos',
      'merma_estimada_porcentaje',
      'calidad_visual'
    ]

    const todosCompletos = camposRequeridos.every(campo => {
      const valor = datosActuales[campo]
      return valor !== undefined && valor !== null && valor !== ''
    })

    const cantidadValida = (datosActuales.cantidad_cosechada_kg || 0) > 0
    const binsValidos = (datosActuales.numero_bins_llenos || 0) > 0
    const mermaValida = (datosActuales.merma_estimada_porcentaje || 0) >= 0 && (datosActuales.merma_estimada_porcentaje || 0) <= 100

    return todosCompletos && cantidadValida && binsValidos && mermaValida
  }

  const validarStep = (stepNumber: number): boolean => {
    switch (stepNumber) {
      case 1:
        return !!(datos.operario_nombre && datos.turno)
      case 2:
        return !!(datos.cantidad_cosechada_kg && datos.cantidad_cosechada_kg > 0 && 
                 datos.numero_bins_llenos && datos.numero_bins_llenos > 0)
      case 3:
        return !!(datos.merma_estimada_porcentaje !== undefined && 
                 datos.merma_estimada_porcentaje >= 0 && 
                 datos.merma_estimada_porcentaje <= 100 &&
                 datos.hora_termino && datos.calidad_visual)
      case 4:
        return validarFormulario(datos)
      default:
        return false
    }
  }

  useEffect(() => {
    const esValido = validarFormulario(datos)
    onValidacionChange(esValido)
    
    if (esValido) {
      onDatosChange(datos as DatosCosechaCompleta)
    } else {
      onDatosChange(null)
    }
  }, [datos, onDatosChange, onValidacionChange])

  const handleInputChange = (campo: keyof DatosCosechaCompleta, valor: any) => {
    setDatos(prev => ({
      ...prev,
      [campo]: valor
    }))
  }

  const nextStep = () => {
    if (step < 4 && validarStep(step)) {
      setStep(step + 1)
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleComplete = () => {
    if (validarFormulario(datos) && onComplete) {
      onComplete()
    }
  }

  if (usarStepper) {
    return (
      <div className="space-y-6">
        {/* Stepper visual */}
        <div className="flex items-center justify-between">
          {steps.map((stepItem, index) => {
            const isCompleted = step > stepItem.id || (step === stepItem.id && validarStep(stepItem.id))
            const isCurrent = step === stepItem.id
            const IconComponent = stepItem.icono

            return (
              <div key={stepItem.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    isCompleted ? 'bg-green-500 text-white' :
                    isCurrent ? 'bg-cultivo-600 text-white' :
                    'bg-gray-300 text-gray-600'
                  }`}>
                    {isCompleted ? <CheckCircle className="w-4 h-4" /> : <IconComponent className="w-4 h-4" />}
                  </div>
                  <span className={`text-xs mt-1 ${isCurrent ? 'text-cultivo-600 font-medium' : 'text-gray-500'}`}>
                    {stepItem.nombre}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-3 ${
                    step > stepItem.id ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            )
          })}
        </div>

        {/* Contenido del step actual */}
        <div className="min-h-[400px]">
          {step === 1 && (
            <div className="space-y-6">
              <div className="bg-green-50 rounded-lg p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Users className="h-5 w-5 text-green-600" />
                  <h5 className="font-medium text-green-900">Información del Operario</h5>
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
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Nombre del operario responsable"
                      autoFocus
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Turno *
                    </label>
                    <select
                      value={datos.turno || 'mañana'}
                      onChange={(e) => handleInputChange('turno', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      title="Turno de trabajo"
                    >
                      <option value="mañana">Mañana (06:00 - 14:00)</option>
                      <option value="tarde">Tarde (14:00 - 22:00)</option>
                      <option value="noche">Noche (22:00 - 06:00)</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-green-100 rounded-lg">
                  <p className="text-sm text-green-800">
                    Registra quién fue el responsable de completar la cosecha y en qué turno se finalizó.
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-yellow-50 rounded-lg p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Package className="h-5 w-5 text-yellow-600" />
                  <h5 className="font-medium text-yellow-900">Resultados de Cosecha</h5>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cantidad Cosechada (kg) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={datos.cantidad_cosechada_kg || ''}
                      onChange={(e) => handleInputChange('cantidad_cosechada_kg', parseFloat(e.target.value) || 0)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="1500.5"
                      autoFocus
                    />
                    <p className="text-xs text-gray-500 mt-1">Peso total de la fruta cosechada</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número de Bins Llenos *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={datos.numero_bins_llenos || ''}
                      onChange={(e) => handleInputChange('numero_bins_llenos', parseInt(e.target.value) || 0)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="15"
                    />
                    <p className="text-xs text-gray-500 mt-1">Contenedores completamente llenos</p>
                  </div>
                </div>

                {/* Cálculo automático de rendimiento */}
                {datos.cantidad_cosechada_kg && datos.numero_bins_llenos && datos.numero_bins_llenos > 0 && (
                  <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Rendimiento promedio:</strong> {(datos.cantidad_cosechada_kg / datos.numero_bins_llenos).toFixed(1)} kg/bin
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

                     {step === 3 && (
             <div className="space-y-6">
               <div className="bg-blue-50 rounded-lg p-6">
                 <div className="flex items-center space-x-2 mb-4">
                   <Clock className="h-5 w-5 text-blue-600" />
                   <h5 className="font-medium text-blue-900">Control de Calidad y Finalización</h5>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                       Hora de Término *
                     </label>
                     <input
                       type="time"
                       value={datos.hora_termino || ''}
                       onChange={(e) => handleInputChange('hora_termino', e.target.value)}
                       className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                       title="Hora de término de la cosecha"
                     />
                   </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Calidad Visual *
                    </label>
                    <select
                      value={datos.calidad_visual || 'excelente'}
                      onChange={(e) => handleInputChange('calidad_visual', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      title="Calidad visual de la fruta cosechada"
                    >
                      <option value="excelente">Excelente - Sin defectos</option>
                      <option value="buena">Buena - Defectos menores</option>
                      <option value="regular">Regular - Algunos defectos</option>
                      <option value="deficiente">Deficiente - Muchos defectos</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 rounded-lg p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <TrendingDown className="h-5 w-5 text-orange-600" />
                  <h5 className="font-medium text-orange-900">Control de Merma</h5>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Merma Estimada (%) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={datos.merma_estimada_porcentaje || ''}
                    onChange={(e) => handleInputChange('merma_estimada_porcentaje', parseFloat(e.target.value) || 0)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="5.2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Porcentaje de fruta descartada o no apta para el proceso
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="bg-green-50 rounded-lg p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h5 className="font-medium text-green-900">Resumen y Finalización</h5>
                </div>

                {/* Resumen de datos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-white p-3 rounded border">
                    <p className="text-sm text-gray-600">Operario Responsable</p>
                    <p className="font-medium">{datos.operario_nombre}</p>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <p className="text-sm text-gray-600">Turno</p>
                    <p className="font-medium">{datos.turno}</p>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <p className="text-sm text-gray-600">Cantidad Cosechada</p>
                    <p className="font-medium">{datos.cantidad_cosechada_kg} kg</p>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <p className="text-sm text-gray-600">Bins Llenos</p>
                    <p className="font-medium">{datos.numero_bins_llenos}</p>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <p className="text-sm text-gray-600">Merma Estimada</p>
                    <p className="font-medium">{datos.merma_estimada_porcentaje}%</p>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <p className="text-sm text-gray-600">Calidad Visual</p>
                    <p className="font-medium">{datos.calidad_visual}</p>
                  </div>
                </div>

                {/* Observaciones finales */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observaciones Adicionales
                  </label>
                  <textarea
                    value={datos.observaciones || ''}
                    onChange={(e) => handleInputChange('observaciones', e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Condiciones especiales, incidencias, rendimiento del equipo..."
                  />
                </div>

                {/* Indicador de validación */}
                <div className={`p-3 rounded-lg text-sm ${
                  validarFormulario(datos) 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {validarFormulario(datos) 
                    ? '✓ Formulario completo y válido para registro SAG'
                    : '⚠ Revisa que todos los campos estén completos'
                  }
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navegación del stepper */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <button
            onClick={prevStep}
            disabled={step === 1}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              step === 1 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          <div className="text-sm text-gray-500">
            Paso {step} de {steps.length}
          </div>

          {step < 4 ? (
            <button
              onClick={nextStep}
              disabled={!validarStep(step)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                validarStep(step)
                  ? 'bg-cultivo-600 text-white hover:bg-cultivo-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <span>Siguiente</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={!validarFormulario(datos)}
              className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                validarFormulario(datos)
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>Completar</span>
            </button>
          )}
        </div>
      </div>
    )
  }

  // Renderizado sin stepper (formulario completo)
  return (
    <div className="space-y-6">
      {/* Información del Operario */}
      <div className="bg-green-50 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Users className="h-5 w-5 text-green-600" />
          <h5 className="font-medium text-green-900">Información del Operario</h5>
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
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Nombre del operario responsable"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Turno
            </label>
            <select
              value={datos.turno || 'mañana'}
              onChange={(e) => handleInputChange('turno', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              title="Turno de trabajo"
            >
              <option value="mañana">Mañana</option>
              <option value="tarde">Tarde</option>
              <option value="noche">Noche</option>
            </select>
          </div>
        </div>
      </div>

      {/* Datos de Finalización */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Clock className="h-5 w-5 text-blue-600" />
          <h5 className="font-medium text-blue-900">Datos de Finalización</h5>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hora de Término *
            </label>
            <input
              type="time"
              value={datos.hora_termino || ''}
              onChange={(e) => handleInputChange('hora_termino', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              title="Hora de término de la cosecha"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Calidad Visual *
            </label>
            <select
              value={datos.calidad_visual || 'excelente'}
              onChange={(e) => handleInputChange('calidad_visual', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              title="Calidad visual de la fruta cosechada"
            >
              <option value="excelente">Excelente</option>
              <option value="buena">Buena</option>
              <option value="regular">Regular</option>
              <option value="deficiente">Deficiente</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resultados de Cosecha */}
      <div className="bg-yellow-50 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Package className="h-5 w-5 text-yellow-600" />
          <h5 className="font-medium text-yellow-900">Resultados de Cosecha</h5>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cantidad Cosechada (kg) *
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={datos.cantidad_cosechada_kg || ''}
              onChange={(e) => handleInputChange('cantidad_cosechada_kg', parseFloat(e.target.value) || 0)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              placeholder="1500.5"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de Bins Llenos *
            </label>
            <input
              type="number"
              min="0"
              value={datos.numero_bins_llenos || ''}
              onChange={(e) => handleInputChange('numero_bins_llenos', parseInt(e.target.value) || 0)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              placeholder="15"
            />
          </div>
        </div>
      </div>

      {/* Control de Merma */}
      <div className="bg-orange-50 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingDown className="h-5 w-5 text-orange-600" />
          <h5 className="font-medium text-orange-900">Control de Merma</h5>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Merma Estimada (%) *
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={datos.merma_estimada_porcentaje || ''}
            onChange={(e) => handleInputChange('merma_estimada_porcentaje', parseFloat(e.target.value) || 0)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="5.2"
          />
          <p className="text-xs text-gray-500 mt-1">
            Porcentaje de fruta descartada o no apta para el proceso
          </p>
        </div>
      </div>

      {/* Observaciones */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Observaciones Adicionales
        </label>
        <textarea
          value={datos.observaciones || ''}
          onChange={(e) => handleInputChange('observaciones', e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Condiciones especiales, incidencias, rendimiento del equipo..."
        />
      </div>

      {/* Indicador de validación */}
      <div className={`p-3 rounded-lg text-sm ${
        validarFormulario(datos) 
          ? 'bg-green-50 text-green-800 border border-green-200' 
          : 'bg-red-50 text-red-800 border border-red-200'
      }`}>
        {validarFormulario(datos) 
          ? '✓ Formulario completo y válido para SAG'
          : '⚠ Completa todos los campos obligatorios marcados con *'
        }
      </div>
    </div>
  )
} 