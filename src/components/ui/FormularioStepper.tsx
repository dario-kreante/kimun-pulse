import React, { useState, useEffect } from 'react'
import { Check, ChevronLeft, ChevronRight } from 'lucide-react'

export interface StepData {
  id: string
  titulo: string
  descripcion?: string
  componente: React.ReactNode
  esValido: boolean
  esOpcional?: boolean
}

interface FormularioStepperProps {
  pasos: StepData[]
  onStepChange?: (pasoActual: number) => void
  onComplete?: () => void
  tituloGeneral: string
  esValidoGeneral: boolean
}

export default function FormularioStepper({
  pasos,
  onStepChange,
  onComplete,
  tituloGeneral,
  esValidoGeneral
}: FormularioStepperProps) {
  const [pasoActual, setPasoActual] = useState(0)
  const [pasosCompletados, setPasosCompletados] = useState<Set<number>>(new Set())

  useEffect(() => {
    onStepChange?.(pasoActual)
  }, [pasoActual, onStepChange])

  useEffect(() => {
    // Marcar paso como completado si es válido
    if (pasos[pasoActual]?.esValido) {
      setPasosCompletados(prev => new Set([...Array.from(prev), pasoActual]))
    } else {
      setPasosCompletados(prev => {
        const newSet = new Set(Array.from(prev))
        newSet.delete(pasoActual)
        return newSet
      })
    }
  }, [pasoActual, pasos])

  const siguientePaso = () => {
    if (pasoActual < pasos.length - 1) {
      setPasoActual(pasoActual + 1)
    }
  }

  const pasoAnterior = () => {
    if (pasoActual > 0) {
      setPasoActual(pasoActual - 1)
    }
  }

  const irAPaso = (numeroPaso: number) => {
    setPasoActual(numeroPaso)
  }

  const todosLosObligatoriosCompletos = pasos.every((paso, index) => 
    paso.esOpcional || pasosCompletados.has(index) || paso.esValido
  )

  const getStatusIcon = (index: number) => {
    if (pasosCompletados.has(index)) {
      return <Check className="h-4 w-4 text-green-600" />
    }
    if (index === pasoActual) {
      return <span className="text-blue-600 font-semibold">{index + 1}</span>
    }
    return <span className="text-gray-400">{index + 1}</span>
  }

  const getStatusColor = (index: number) => {
    if (pasosCompletados.has(index)) {
      return 'bg-green-100 border-green-500'
    }
    if (index === pasoActual) {
      return 'bg-blue-100 border-blue-500'
    }
    return 'bg-gray-50 border-gray-300'
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header con título */}
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h3 className="text-lg font-medium text-gray-900">{tituloGeneral}</h3>
        <p className="text-sm text-gray-600 mt-1">
          Paso {pasoActual + 1} de {pasos.length}: {pasos[pasoActual]?.titulo}
        </p>
      </div>

      {/* Indicador de progreso */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          {pasos.map((paso, index) => (
            <React.Fragment key={paso.id}>
              <div className="flex flex-col items-center">
                <button
                  onClick={() => irAPaso(index)}
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors ${getStatusColor(index)} ${
                    index <= pasoActual ? 'cursor-pointer hover:bg-opacity-80' : 'cursor-default'
                  }`}
                  disabled={index > pasoActual}
                >
                  {getStatusIcon(index)}
                </button>
                <span className={`text-xs mt-1 text-center max-w-20 ${
                  index === pasoActual ? 'text-blue-600 font-medium' : 'text-gray-500'
                }`}>
                  {paso.titulo}
                </span>
              </div>
              {index < pasos.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${
                  pasosCompletados.has(index) ? 'bg-green-400' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Barra de progreso general */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${((pasoActual + 1) / pasos.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Contenido del paso actual */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="pb-6">
          {pasos[pasoActual]?.descripcion && (
            <p className="text-sm text-gray-600 mb-4">
              {pasos[pasoActual].descripcion}
            </p>
          )}
          {pasos[pasoActual]?.componente}
        </div>
      </div>

      {/* Controles de navegación */}
      <div className="border-t border-gray-200 pt-4 mt-6">
        <div className="flex items-center justify-between">
          <button
            onClick={pasoAnterior}
            disabled={pasoActual === 0}
            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Anterior</span>
          </button>

          <div className="flex items-center space-x-4">
            {/* Indicador de validación del paso actual */}
            <div className={`text-xs px-3 py-1 rounded-full ${
              pasos[pasoActual]?.esValido 
                ? 'bg-green-100 text-green-800' 
                : pasos[pasoActual]?.esOpcional
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {pasos[pasoActual]?.esValido 
                ? '✓ Completo' 
                : pasos[pasoActual]?.esOpcional 
                ? 'Opcional'
                : 'Incompleto'
              }
            </div>

            {pasoActual === pasos.length - 1 ? (
              <button
                onClick={onComplete}
                disabled={!todosLosObligatoriosCompletos || !esValidoGeneral}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                <Check className="h-4 w-4" />
                <span>Completar</span>
              </button>
            ) : (
              <button
                onClick={siguientePaso}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                <span>Siguiente</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Resumen de progreso */}
        <div className="mt-3 text-xs text-gray-500 text-center">
          {pasosCompletados.size} de {pasos.filter(p => !p.esOpcional).length} pasos obligatorios completados
          {pasos.some(p => p.esOpcional) && ` • ${pasos.filter(p => p.esOpcional).length} opcionales`}
        </div>
      </div>
    </div>
  )
} 