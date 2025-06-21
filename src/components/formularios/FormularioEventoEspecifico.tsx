import React from 'react'
import { TipoEvento } from '../../types/database'
import { DatosEventoEspecifico } from '../../types/eventSpecificData'

// Importar todos los formularios específicos
import FormularioInicioCosecha from './FormularioInicioCosecha'
import FormularioCosechaCompleta from './FormularioCosechaCompleta'
import FormularioRecepcionPacking from './FormularioRecepcionPacking'
import FormularioSeleccion from './FormularioSeleccion'
import FormularioEmpaque from './FormularioEmpaque'
import FormularioPaletizado from './FormularioPaletizado'
import FormularioEnfriado from './FormularioEnfriado'
import FormularioControlCalidad from './FormularioControlCalidad'
import FormularioDespacho from './FormularioDespacho'

// Importar versiones con stepper para formularios extensos
import FormularioInicioCosechaStepper from './FormularioInicioCosechaStepper'
import FormularioEnfriadoStepper from './FormularioEnfriadoStepper'
import FormularioDespachoStepper from './FormularioDespachoStepper'

interface FormularioEventoEspecificoProps {
  tipoEvento: TipoEvento
  datosIniciales?: Partial<DatosEventoEspecifico>
  onDatosChange: (datos: DatosEventoEspecifico | null) => void
  onValidacionChange: (esValido: boolean) => void
  onComplete?: () => void
  usarStepper?: boolean
  contexto?: 'lote' | 'pallet'
  codigoPallet?: string
}

export default function FormularioEventoEspecifico({
  tipoEvento,
  datosIniciales,
  onDatosChange,
  onValidacionChange,
  onComplete,
  usarStepper = true,
  contexto = 'lote',
  codigoPallet
}: FormularioEventoEspecificoProps) {

  // Renderizar el formulario específico según el tipo de evento
  const renderFormularioEspecifico = () => {
    switch (tipoEvento) {
      case 'Inicio Cosecha':
        return usarStepper ? (
          <FormularioInicioCosechaStepper
            datosIniciales={datosIniciales}
            onDatosChange={onDatosChange}
            onValidacionChange={onValidacionChange}
            onComplete={onComplete}
          />
        ) : (
          <FormularioInicioCosecha
            datosIniciales={datosIniciales}
            onDatosChange={onDatosChange}
            onValidacionChange={onValidacionChange}
          />
        )
      
      case 'Cosecha Completa':
        return (
          <FormularioCosechaCompleta
            datosIniciales={datosIniciales}
            onDatosChange={onDatosChange}
            onValidacionChange={onValidacionChange}
            onComplete={onComplete}
            usarStepper={usarStepper}
          />
        )
      
      case 'Recepción Packing':
        return (
          <FormularioRecepcionPacking
            datosIniciales={datosIniciales}
            onDatosChange={onDatosChange}
            onValidacionChange={onValidacionChange}
          />
        )
      
      case 'Selección':
        return (
          <FormularioSeleccion
            datosIniciales={datosIniciales}
            onDatosChange={onDatosChange}
            onValidacionChange={onValidacionChange}
          />
        )
      
      case 'Empaque':
        return (
          <FormularioEmpaque
            datosIniciales={datosIniciales}
            onDatosChange={onDatosChange}
            onValidacionChange={onValidacionChange}
          />
        )
      
      case 'Paletizado':
        return (
          <FormularioPaletizado
            datosIniciales={datosIniciales}
            onDatosChange={onDatosChange}
            onValidacionChange={onValidacionChange}
          />
        )
      
      case 'Enfriado':
        return usarStepper ? (
          <FormularioEnfriadoStepper
            datosIniciales={datosIniciales}
            onDatosChange={onDatosChange}
            onValidacionChange={onValidacionChange}
            onComplete={onComplete}
            contexto={contexto}
            codigoPallet={codigoPallet}
          />
        ) : (
          <FormularioEnfriado
            datosIniciales={datosIniciales}
            onDatosChange={onDatosChange}
            onValidacionChange={onValidacionChange}
            contexto={contexto}
            codigoPallet={codigoPallet}
          />
        )
      
      case 'Control Calidad':
        return (
          <FormularioControlCalidad
            datosIniciales={datosIniciales}
            onDatosChange={onDatosChange}
            onValidacionChange={onValidacionChange}
            contexto={contexto}
            codigoPallet={codigoPallet}
          />
        )
      
      case 'Despacho':
        return usarStepper ? (
          <FormularioDespachoStepper
            datosIniciales={datosIniciales}
            onDatosChange={onDatosChange}
            onValidacionChange={onValidacionChange}
            onComplete={onComplete}
          />
        ) : (
          <FormularioDespacho
            datosIniciales={datosIniciales}
            onDatosChange={onDatosChange}
            onValidacionChange={onValidacionChange}
          />
        )
      
      default:
        return (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Formulario no implementado
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    El formulario específico para el evento "{tipoEvento}" aún no ha sido implementado.
                    Por favor, contacta al administrador del sistema.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-lg font-medium text-gray-900">
          Información Específica - {tipoEvento}
        </h4>
        <p className="text-sm text-gray-600 mt-1">
          Completa los datos requeridos para la trazabilidad SAG
        </p>
      </div>

      {/* Renderizar el formulario específico */}
      {renderFormularioEspecifico()}
    </div>
  )
} 