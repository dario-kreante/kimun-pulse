import React, { useState, useEffect } from 'react'
import { DatosRecepcionPacking } from '../../types/eventSpecificData'
import { Truck, FileText, Package, Thermometer, Clock, Users, AlertCircle, CheckCircle } from 'lucide-react'

interface FormularioRecepcionPackingProps {
  datosIniciales?: Partial<DatosRecepcionPacking>
  onDatosChange: (datos: DatosRecepcionPacking | null) => void
  onValidacionChange: (esValido: boolean) => void
}

export default function FormularioRecepcionPacking({
  datosIniciales,
  onDatosChange,
  onValidacionChange
}: FormularioRecepcionPackingProps) {
  const [datos, setDatos] = useState<Partial<DatosRecepcionPacking>>({
    operario_nombre: '',
    turno: 'mañana',
    numero_guia_recepcion: '',
    transportista: '',
    numero_bins_recibidos: 0,
    peso_total_recibido_kg: 0,
    temperatura_llegada: 20,
    hora_llegada: new Date().toTimeString().slice(0, 5),
    condicion_fruta: 'excelente',
    numero_lote_interno: '',
    observaciones: '',
    ...datosIniciales
  })

  const validarFormulario = (datosActuales: Partial<DatosRecepcionPacking>): boolean => {
    const camposRequeridos: (keyof DatosRecepcionPacking)[] = [
      'operario_nombre',
      'turno',
      'numero_guia_recepcion',
      'transportista',
      'numero_bins_recibidos',
      'peso_total_recibido_kg',
      'temperatura_llegada',
      'hora_llegada',
      'condicion_fruta'
    ]

    const todosCompletos = camposRequeridos.every(campo => {
      const valor = datosActuales[campo]
      if (typeof valor === 'string') {
        return valor.trim() !== ''
      }
      return valor !== undefined && valor !== null && valor !== 0
    })

    const binsValidos = (datosActuales.numero_bins_recibidos || 0) > 0
    const pesoValido = (datosActuales.peso_total_recibido_kg || 0) > 0
    const temperaturaValida = (datosActuales.temperatura_llegada || 0) >= -10 && (datosActuales.temperatura_llegada || 0) <= 50

    return todosCompletos && binsValidos && pesoValido && temperaturaValida
  }

  useEffect(() => {
    const esValido = validarFormulario(datos)
    onValidacionChange(esValido)
    
    if (esValido) {
      onDatosChange(datos as DatosRecepcionPacking)
    } else {
      onDatosChange(null)
    }
  }, [datos, onDatosChange, onValidacionChange])

  const handleInputChange = (campo: keyof DatosRecepcionPacking, valor: any) => {
    setDatos(prev => ({
      ...prev,
      [campo]: valor
    }))
  }

  // Función para formatear la visualización de datos
  const calcularPromedioKgPorBin = () => {
    const bins = datos.numero_bins_recibidos || 0
    const peso = datos.peso_total_recibido_kg || 0
    return bins > 0 ? (peso / bins).toFixed(1) : '0'
  }

  const formValido = validarFormulario(datos)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header del formulario */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Truck className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Recepción en Packing</h3>
            <p className="text-sm text-gray-600">Registro de llegada y recepción de fruta en planta</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna izquierda */}
        <div className="space-y-6">
          {/* Información del Operario */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-4">
              <Users className="h-5 w-5 text-blue-600" />
              <h4 className="font-medium text-gray-900">Información del Operario</h4>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Operario Responsable *
                </label>
                <input
                  type="text"
                  value={datos.operario_nombre || ''}
                  onChange={(e) => handleInputChange('operario_nombre', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Nombre del operario responsable"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Turno *
                </label>
                                 <select
                   value={datos.turno || 'mañana'}
                   onChange={(e) => handleInputChange('turno', e.target.value)}
                   className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                   aria-label="Seleccionar turno de trabajo"
                 >
                  <option value="mañana">Mañana</option>
                  <option value="tarde">Tarde</option>
                  <option value="noche">Noche</option>
                </select>
              </div>
            </div>
          </div>

          {/* Documentación */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-4">
              <FileText className="h-5 w-5 text-green-600" />
              <h4 className="font-medium text-gray-900">Documentación</h4>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Guía de Recepción *
                </label>
                <input
                  type="text"
                  value={datos.numero_guia_recepcion || ''}
                  onChange={(e) => handleInputChange('numero_guia_recepcion', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder="GR-2025-001"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Lote Interno
                </label>
                <input
                  type="text"
                  value={datos.numero_lote_interno || ''}
                  onChange={(e) => handleInputChange('numero_lote_interno', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder="LI-2025-001"
                />
              </div>
            </div>
          </div>

          {/* Control de Temperatura */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-4">
              <Thermometer className="h-5 w-5 text-red-600" />
              <h4 className="font-medium text-gray-900">Control de Temperatura</h4>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temperatura de Llegada (°C) *
              </label>
              <input
                type="number"
                step="0.1"
                min="-10"
                max="50"
                value={datos.temperatura_llegada || ''}
                onChange={(e) => handleInputChange('temperatura_llegada', parseFloat(e.target.value) || 20)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                placeholder="20.5"
              />
              <p className="text-xs text-gray-500 mt-1">
                Temperatura registrada al momento de la recepción (rango: -10°C a 50°C)
              </p>
            </div>
          </div>
        </div>

        {/* Columna derecha */}
        <div className="space-y-6">
          {/* Transporte */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-4">
              <Truck className="h-5 w-5 text-yellow-600" />
              <h4 className="font-medium text-gray-900">Información de Transporte</h4>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transportista *
                </label>
                <input
                  type="text"
                  value={datos.transportista || ''}
                  onChange={(e) => handleInputChange('transportista', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                  placeholder="Empresa transportista"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora de Llegada *
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                     <input
                     type="time"
                     value={datos.hora_llegada || ''}
                     onChange={(e) => handleInputChange('hora_llegada', e.target.value)}
                     className="w-full pl-10 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                     aria-label="Hora de llegada del transporte"
                   />
                </div>
              </div>
            </div>
          </div>

          {/* Recepción */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-4">
              <Package className="h-5 w-5 text-purple-600" />
              <h4 className="font-medium text-gray-900">Datos de Recepción</h4>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Bins *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={datos.numero_bins_recibidos || ''}
                    onChange={(e) => handleInputChange('numero_bins_recibidos', parseInt(e.target.value) || 0)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    placeholder="15"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Peso Total (kg) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={datos.peso_total_recibido_kg || ''}
                    onChange={(e) => handleInputChange('peso_total_recibido_kg', parseFloat(e.target.value) || 0)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    placeholder="1500.5"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Condición de la Fruta *
                </label>
                                 <select
                   value={datos.condicion_fruta || 'excelente'}
                   onChange={(e) => handleInputChange('condicion_fruta', e.target.value)}
                   className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                   aria-label="Condición de la fruta recibida"
                 >
                  <option value="excelente">Excelente</option>
                  <option value="buena">Buena</option>
                  <option value="regular">Regular</option>
                  <option value="rechazada">Rechazada</option>
                </select>
              </div>
              
              {/* Indicador calculado */}
              {datos.numero_bins_recibidos && datos.peso_total_recibido_kg && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <p className="text-sm text-purple-800 font-medium">
                    Promedio por bin: {calcularPromedioKgPorBin()} kg/bin
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Observaciones */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="mb-4">
              <h4 className="font-medium text-gray-900">Observaciones Adicionales</h4>
            </div>
            <textarea
              value={datos.observaciones || ''}
              onChange={(e) => handleInputChange('observaciones', e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              placeholder="Estado del transporte, incidencias durante la recepción, documentación faltante..."
            />
          </div>
        </div>
      </div>

      {/* Estado de validación */}
      <div className={`border rounded-lg p-4 transition-colors ${
        formValido 
          ? 'bg-green-50 border-green-200' 
          : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">
            {formValido ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500" />
            )}
          </div>
          <div className="flex-1">
            <h5 className={`font-medium ${formValido ? 'text-green-800' : 'text-red-800'}`}>
              {formValido 
                ? 'Formulario completo y válido para SAG'
                : 'Faltan campos obligatorios'
              }
            </h5>
            {!formValido && (
              <ul className="mt-2 text-sm text-red-700 space-y-1">
                {!datos.operario_nombre?.trim() && <li>• Nombre del operario es requerido</li>}
                {!datos.numero_guia_recepcion?.trim() && <li>• Número de guía de recepción es requerido</li>}
                {!datos.transportista?.trim() && <li>• Nombre del transportista es requerido</li>}
                {!(datos.numero_bins_recibidos || 0 > 0) && <li>• Número de bins debe ser mayor a 0</li>}
                {!(datos.peso_total_recibido_kg || 0 > 0) && <li>• Peso total debe ser mayor a 0</li>}
                {!((datos.temperatura_llegada || 0) >= -10 && (datos.temperatura_llegada || 0) <= 50) && <li>• Temperatura debe estar entre -10°C y 50°C</li>}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 